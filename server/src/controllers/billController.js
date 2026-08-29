const fs = require('fs');
const path = require('path');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const Merchant = require('../models/Merchant');
const { generateTransactionPDF } = require('../services/pdfService');
const { sendWhatsAppReceipt } = require('../services/notificationService');
const { ok, fail } = require('../utils/response');
const env = require('../config/env');

/** GET /api/bills - list all generated bills (transactions with pdfGenerated) */
async function listBills(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const query = { merchantId: req.merchantId };

    const [transactions, total] = await Promise.all([
      Transaction.find(query).populate('customerId', 'name phone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(query),
    ]);

    return ok(res, { bills: transactions, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

/** GET /api/bills/:transactionId - metadata + view info */
async function getBill(req, res, next) {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.transactionId, merchantId: req.merchantId }).populate(
      'customerId',
      'name phone whatsappNumber address'
    );
    if (!transaction) return fail(res, 'Bill not found.', 404);
    return ok(res, { bill: transaction });
  } catch (err) {
    next(err);
  }
}

/** GET /api/bills/:transactionId/download - streams the PDF file, regenerating if missing */
async function downloadBill(req, res, next) {
  try {
    const transaction = await Transaction.findById(req.params.transactionId).populate(
      'customerId'
    );
    if (!transaction) return fail(res, 'Bill not found.', 404);

    const merchant = await Merchant.findById(transaction.merchantId);
    if (!merchant) return fail(res, 'Merchant not found.', 404);

    const pdfPath = await generateTransactionPDF({ merchant, customer: transaction.customerId, transaction });
    transaction.pdfPath = pdfPath;
    transaction.pdfGenerated = true;
    await transaction.save();

    res.download(pdfPath, `${transaction.receiptNumber}.pdf`);
  } catch (err) {
    next(err);
  }
}

/** POST /api/bills/:transactionId/send-whatsapp */
async function sendBillWhatsApp(req, res, next) {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.transactionId, merchantId: req.merchantId }).populate(
      'customerId'
    );
    if (!transaction) return fail(res, 'Bill not found.', 404);

    const customer = transaction.customerId;
    if (!customer.whatsappNumber && !customer.phone) {
      return fail(res, 'Customer has no WhatsApp/phone number on file.', 400);
    }

    const pdfDownloadUrl = `${req.protocol}://${req.get('host')}/api/bills/${transaction._id}/download`;

    const result = await sendWhatsAppReceipt({ customer, transaction, pdfDownloadUrl });

    if (result.mode === 'twilio' && result.sent) {
      transaction.whatsappSent = true;
      await transaction.save();
    }

    return ok(res, result, result.mode === 'twilio' ? 'Sent via WhatsApp' : 'WhatsApp fallback link generated');
  } catch (err) {
    next(err);
  }
}

module.exports = { listBills, getBill, downloadBill, sendBillWhatsApp };
