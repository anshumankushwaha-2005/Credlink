const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const { ok, fail } = require('../utils/response');

/** GET /api/customers?search=&page=&limit= */
async function listCustomers(req, res, next) {
  try {
    const { search = '', page = 1, limit = 20 } = req.query;
    const query = { merchantId: req.merchantId, isActive: true };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [customers, total] = await Promise.all([
      Customer.find(query).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Customer.countDocuments(query),
    ]);

    return ok(res, { customers, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
}

/** POST /api/customers */
async function createCustomer(req, res, next) {
  try {
    const { name, phone, whatsappNumber, address } = req.body;
    if (!name) return fail(res, 'Customer name is required.', 400);

    const customer = await Customer.create({
      merchantId: req.merchantId,
      name,
      phone,
      whatsappNumber: whatsappNumber || phone,
      address,
    });

    return ok(res, { customer }, 'Customer created', 201);
  } catch (err) {
    next(err);
  }
}

/** GET /api/customers/:id */
async function getCustomer(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, merchantId: req.merchantId });
    if (!customer) return fail(res, 'Customer not found.', 404);

    const transactions = await Transaction.find({ customerId: customer._id }).sort({ createdAt: -1 }).limit(50);

    const totalCredit = transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const totalPayment = transactions.filter((t) => t.type === 'PAYMENT').reduce((s, t) => s + t.amount, 0);

    return ok(res, {
      customer,
      transactions,
      summary: {
        totalCredit,
        totalPayment,
        lastTransaction: transactions[0] || null,
      },
    });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/customers/:id */
async function updateCustomer(req, res, next) {
  try {
    const { name, phone, whatsappNumber, address } = req.body;
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, merchantId: req.merchantId },
      { $set: { name, phone, whatsappNumber, address } },
      { new: true, runValidators: true }
    );
    if (!customer) return fail(res, 'Customer not found.', 404);
    return ok(res, { customer }, 'Customer updated');
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/customers/:id - soft delete (deactivate) */
async function deleteCustomer(req, res, next) {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, merchantId: req.merchantId },
      { $set: { isActive: false } },
      { new: true }
    );
    if (!customer) return fail(res, 'Customer not found.', 404);
    return ok(res, { customer }, 'Customer deactivated');
  } catch (err) {
    next(err);
  }
}

module.exports = { listCustomers, createCustomer, getCustomer, updateCustomer, deleteCustomer };
