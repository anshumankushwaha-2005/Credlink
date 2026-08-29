const fs = require('fs');
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const Merchant = require('../models/Merchant');
const { generateStatementPDF } = require('../services/pdfService');
const { ok, fail } = require('../utils/response');

function resolveDateRange(from, to) {
  const toDate = to ? new Date(to) : new Date();
  const fromDate = from ? new Date(from) : new Date(toDate.getFullYear(), toDate.getMonth() - 1, toDate.getDate());
  return { fromDate, toDate };
}

/** GET /api/reports/customer/:id?from=&to= */
async function getCustomerReport(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, merchantId: req.merchantId });
    if (!customer) return fail(res, 'Customer not found.', 404);

    const { fromDate, toDate } = resolveDateRange(req.query.from, req.query.to);

    const transactions = await Transaction.find({
      customerId: customer._id,
      createdAt: { $gte: fromDate, $lte: toDate },
    }).sort({ createdAt: 1 });

    const totalCredit = transactions.filter((t) => t.type === 'CREDIT').reduce((s, t) => s + t.amount, 0);
    const totalPayment = transactions.filter((t) => t.type === 'PAYMENT').reduce((s, t) => s + t.amount, 0);

    return ok(res, {
      customer,
      period: { from: fromDate, to: toDate },
      transactions,
      totals: { totalCredit, totalPayment, outstanding: customer.currentBalance },
    });
  } catch (err) {
    next(err);
  }
}

/** GET /api/reports/customer/:id/pdf?from=&to= */
async function getCustomerReportPDF(req, res, next) {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, merchantId: req.merchantId });
    if (!customer) return fail(res, 'Customer not found.', 404);

    const merchant = await Merchant.findById(req.merchantId);
    const { fromDate, toDate } = resolveDateRange(req.query.from, req.query.to);

    const transactions = await Transaction.find({
      customerId: customer._id,
      createdAt: { $gte: fromDate, $lte: toDate },
    }).sort({ createdAt: 1 });

    const pdfPath = await generateStatementPDF({ merchant, customer, transactions, from: fromDate, to: toDate });

    res.download(pdfPath, `Statement-${customer.name}-${Date.now()}.pdf`, () => {
      // Clean up the temporary statement file after sending (statements are generated on demand).
      fs.unlink(pdfPath, () => {});
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCustomerReport, getCustomerReportPDF };
