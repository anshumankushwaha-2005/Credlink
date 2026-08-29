const Transaction = require('../models/Transaction');

async function generateReceiptNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const datePart = `${y}${m}${d}`;

  const startOfDay = new Date(y, now.getMonth(), now.getDate());
  const endOfDay = new Date(y, now.getMonth(), now.getDate() + 1);

  const countToday = await Transaction.countDocuments({
    createdAt: { $gte: startOfDay, $lt: endOfDay },
  });

  const seq = String(countToday + 1).padStart(4, '0');
  return `CRL-${datePart}-${seq}`;
}

module.exports = generateReceiptNumber;
