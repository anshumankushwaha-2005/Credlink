const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    merchantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Merchant',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    whatsappNumber: { type: String, trim: true },
    address: { type: String, trim: true },
    currentBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

customerSchema.index({ merchantId: 1, name: 1 });

module.exports = mongoose.model('Customer', customerSchema);
