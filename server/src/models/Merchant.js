const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    businessName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    qrCodePath: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Merchant', merchantSchema);
