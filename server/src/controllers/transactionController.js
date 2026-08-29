const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const { recordTransaction } = require('../services/ledgerService');
const { ok, fail } = require('../utils/response');

/** POST /api/transactions  { customerId, amount, type, description?, transcript?, source? } */
async function createTransaction(req, res, next) {
  try {
    const { customerId, amount, type, description, transcript, source } = req.body;

    if (!customerId || !amount || !type) {
      return fail(res, 'customerId, amount and type are required.', 400);
    }
    if (!['CREDIT', 'PAYMENT'].includes(type)) {
      return fail(res, 'type must be CREDIT or PAYMENT.', 400);
    }

    const { transaction, customer } = await recordTransaction({
      merchantId: req.merchantId,
      customerId,
      amount,
      type,
      description,
      transcript,
      source,
    });

    return ok(res, { transaction, customer }, 'Transaction recorded', 201);
  } catch (err) {
    if (err.message === 'Customer not found for this merchant') {
      return fail(res, err.message, 404);
    }
    next(err);
  }
}

/** GET /api/transactions?customerId=&type=&from=&to=&page=&limit= */
async function listTransactions(req, res, next) {
  try {
    const { customerId, type, from, to, page = 1, limit = 20, search } = req.query;
    const query = { merchantId: req.merchantId };

    if (customerId) query.customerId = customerId;
    if (type && ['CREDIT', 'PAYMENT'].includes(type)) query.type = type;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }

    let customerIdsForSearch = null;
    if (search) {
      const matches = await Customer.find({ merchantId: req.merchantId, name: { $regex: search, $options: 'i' } }).select('_id');
      customerIdsForSearch = matches.map((c) => c._id);
      query.customerId = { $in: customerIdsForSearch };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [transactions, total] = await Promise.all([
      Transaction.find(query).populate('customerId', 'name phone').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Transaction.countDocuments(query),
    ]);

    return ok(res, { transactions, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

/** GET /api/transactions/:id */
async function getTransaction(req, res, next) {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, merchantId: req.merchantId }).populate(
      'customerId',
      'name phone whatsappNumber address'
    );
    if (!transaction) return fail(res, 'Transaction not found.', 404);
    return ok(res, { transaction });
  } catch (err) {
    next(err);
  }
}

/** GET /api/customers/:id/transactions */
async function getCustomerTransactions(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, merchantId: req.merchantId });
    if (!customer) return fail(res, 'Customer not found.', 404);

    const transactions = await Transaction.find({ customerId: customer._id }).sort({ createdAt: -1 });
    return ok(res, { customer, transactions });
  } catch (err) {
    next(err);
  }
}

module.exports = { createTransaction, listTransactions, getTransaction, getCustomerTransactions };
