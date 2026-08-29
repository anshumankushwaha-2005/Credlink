const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: ['CREDIT', 'PAYMENT'], required: true },
    description: { type: String, trim: true, default: '' },
    transcript: { type: String, trim: true, default: '' },
    source: { type: String, enum: ['voice', 'manual'], default: 'manual' },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    receiptNumber: { type: String, required: true, unique: true },
    pdfPath: { type: String, default: '' },
    pdfGenerated: { type: Boolean, default: false },
    whatsappSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

transactionSchema.index({ merchantId: 1, createdAt: -1 });
transactionSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
