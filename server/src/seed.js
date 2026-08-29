/**
 * Seeds demo data so the app is fully explorable without manual setup.
 * Run with: npm run seed  (from the server/ directory)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('./config/env');
const logger = require('./utils/logger');

const Merchant = require('./models/Merchant');
const Customer = require('./models/Customer');
const Transaction = require('./models/Transaction');
const OTP = require('./models/OTP');
const { recordTransaction } = require('./services/ledgerService');

const DEMO_EMAIL = 'demo@credlink.test';

async function seed() {
  await mongoose.connect(env.MONGODB_URI);
  logger.info('Connected to MongoDB for seeding');

  // Clean previous demo data for a repeatable seed.
  const existing = await Merchant.findOne({ email: DEMO_EMAIL });
  if (existing) {
    const customers = await Customer.find({ merchantId: existing._id });
    await Transaction.deleteMany({ merchantId: existing._id });
    await Customer.deleteMany({ merchantId: existing._id });
    await Merchant.deleteOne({ _id: existing._id });
  }
  await OTP.deleteMany({ email: DEMO_EMAIL });

  const merchant = await Merchant.create({
    name: 'Demo Merchant',
    email: DEMO_EMAIL,
    businessName: 'Sharma General Store',
    phone: '9876543210',
    isVerified: true,
  });
  logger.success(`Created merchant: ${merchant.businessName} (${merchant.email})`);

  const customerSeeds = [
    { name: 'Ramesh', phone: '9876500001', address: 'MG Road, Lucknow' },
    { name: 'Sunita', phone: '9876500002', address: 'Hazratganj, Lucknow' },
    { name: 'Raj', phone: '9876500003', address: 'Gomti Nagar, Lucknow' },
    { name: 'Amit', phone: '9876500004', address: 'Alambagh, Lucknow' },
  ];

  const customers = [];
  for (const c of customerSeeds) {
    const customer = await Customer.create({
      merchantId: merchant._id,
      name: c.name,
      phone: c.phone,
      whatsappNumber: c.phone,
      address: c.address,
    });
    customers.push(customer);
  }
  logger.success(`Created ${customers.length} demo customers`);

  // A handful of realistic transactions per customer, generated through the
  // real ledger service so balances + PDFs are produced exactly like production use.
  const sampleTx = [
    { type: 'CREDIT', amount: 500, description: 'Groceries on credit' },
    { type: 'CREDIT', amount: 200, description: 'Vegetables' },
    { type: 'PAYMENT', amount: 300, description: 'Partial payment' },
    { type: 'CREDIT', amount: 150, description: 'Household items' },
  ];

  for (const customer of customers) {
    for (const tx of sampleTx) {
      await recordTransaction({
        merchantId: merchant._id,
        customerId: customer._id,
        amount: tx.amount,
        type: tx.type,
        description: tx.description,
        source: 'manual',
      });
    }
  }
  logger.success('Generated sample transactions and PDF receipts for each customer');

  logger.success('Seed complete!');
  logger.info(`Login with email: ${DEMO_EMAIL}`);
  logger.info('Development OTP mode will print the OTP to this console when you request it.');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  logger.error(`Seed failed: ${err.message}`);
  process.exit(1);
});
