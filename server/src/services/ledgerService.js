const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const generateReceiptNumber = require('../utils/generateReceiptNumber');
const { generateTransactionPDF } = require('./pdfService');
const logger = require('../utils/logger');

/**
 * The backend is the single source of truth for balances. Frontend-supplied
 * balances are never trusted - we always read the customer's currentBalance
 * from the database right before applying a transaction.
 *
 * Uses a MongoDB session transaction when available (replica-set / Atlas).
 * Falls back to a plain sequential write on standalone MongoDB instances,
 * which don't support multi-document transactions - this keeps local/dev
 * setups working without extra configuration.
 */
async function applyTransaction({ merchantId, customerId, amount, type, description, transcript, source, session }) {
  const customer = await Customer.findOne({ _id: customerId, merchantId }).session(session || undefined);
  if (!customer) {
    throw new Error('Customer not found for this merchant');
  }

  const balanceBefore = customer.currentBalance;
  const balanceAfter = type === 'CREDIT' ? balanceBefore + amount : balanceBefore - amount;
  const receiptNumber = await generateReceiptNumber();

  const created = await Transaction.create(
    [
      {
        merchantId,
        customerId,
        amount,
        type,
        description: description || '',
        transcript: transcript || '',
        source: source || 'manual',
        balanceBefore,
        balanceAfter,
        receiptNumber,
      },
    ],
    session ? { session } : undefined
  );
  const transaction = created[0];

  customer.currentBalance = balanceAfter;
  await customer.save(session ? { session } : undefined);

  return { transaction, customer };
}

async function recordTransaction({ merchantId, customerId, amount, type, description, transcript, source }) {
  if (!['CREDIT', 'PAYMENT'].includes(type)) {
    throw new Error('Invalid transaction type');
  }
  const numericAmount = Number(amount);
  if (!(numericAmount > 0)) {
    throw new Error('Amount must be greater than zero');
  }

  let result;
  let session = null;

  try {
    session = await mongoose.startSession();
    await session.withTransaction(async () => {
      result = await applyTransaction({
        merchantId,
        customerId,
        amount: numericAmount,
        type,
        description,
        transcript,
        source,
        session,
      });
    });
  } catch (err) {
    // Standalone MongoDB (no replica set) doesn't support transactions - fall back
    // to a sequential, non-transactional write so local dev still works.
    const msg = (err && err.message) || '';
    if (
      msg.includes('Transaction numbers') ||
      msg.includes('replica set') ||
      (err && err.codeName === 'IllegalOperation')
    ) {
      logger.warn('MongoDB transactions unavailable (standalone instance) - using sequential write.');
      result = await applyTransaction({
        merchantId,
        customerId,
        amount: numericAmount,
        type,
        description,
        transcript,
        source,
        session: null,
      });
    } else {
      throw err;
    }
  } finally {
    if (session) session.endSession();
  }

  const { transaction, customer } = result;

  // Generate the PDF receipt automatically. Non-fatal on failure - the
  // ledger entry is already safely recorded and the PDF can be regenerated later.
  try {
    const merchant = await Merchant.findById(merchantId);
    const pdfPath = await generateTransactionPDF({ merchant, customer, transaction });
    transaction.pdfPath = pdfPath;
    transaction.pdfGenerated = true;
    await transaction.save();
  } catch (err) {
    logger.error(`PDF generation failed: ${err.message}`);
  }

  return { transaction, customer };
}

module.exports = { recordTransaction };
