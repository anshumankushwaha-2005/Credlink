const Merchant = require('../models/Merchant');
const { requestOTP, verifyOTP } = require('../services/otpService');
const { signToken } = require('../services/jwtService');
const { ok, fail } = require('../utils/response');

/** POST /api/auth/send-otp  { email, name?, businessName? } */
async function sendOtp(req, res, next) {
  try {
    const { email, name, businessName } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return fail(res, 'A valid email address is required.', 400);
    }

    // Auto-create a merchant profile on first login (name/businessName optional at this stage).
    let merchant = await Merchant.findOne({ email: email.toLowerCase() });
    if (!merchant) {
      merchant = await Merchant.create({
        email: email.toLowerCase(),
        name: name || email.split('@')[0],
        businessName: businessName || 'My Shop',
      });
    }

    const result = await requestOTP(email.toLowerCase());

    return ok(res, {
      devMode: result.devMode,
      expiresInMinutes: result.expiresInMinutes,
      message: result.devMode
        ? 'Development OTP generated. Check backend console.'
        : 'OTP sent to your email.',
    });
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/verify-otp  { email, otp } */
async function verifyOtp(req, res, next) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return fail(res, 'Email and OTP are required.', 400);
    }

    const result = await verifyOTP(email.toLowerCase(), String(otp).trim());
    if (!result.valid) {
      return fail(res, result.reason, 400);
    }

    const merchant = await Merchant.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true }
    );

    const token = signToken({ id: merchant._id, email: merchant.email });

    return ok(res, { token, merchant }, 'Login successful');
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me */
async function getMe(req, res, next) {
  try {
    return ok(res, { merchant: req.merchant });
  } catch (err) {
    next(err);
  }
}

/** PUT /api/auth/me - update merchant profile */
async function updateMe(req, res, next) {
  try {
    const { name, businessName, phone } = req.body;
    const merchant = await Merchant.findByIdAndUpdate(
      req.merchantId,
      { $set: { name, businessName, phone } },
      { new: true, runValidators: true }
    );
    return ok(res, { merchant }, 'Profile updated');
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/logout - stateless JWT, client just discards the token */
async function logout(req, res) {
  return ok(res, null, 'Logged out');
}

const path = require('path');
const fs = require('fs');

async function uploadQrCode(req, res, next) {
  try {
    if (!req.file) {
      return fail(res, 'No image file uploaded.', 400);
    }

    const merchant = await Merchant.findById(req.merchantId);
    if (merchant && merchant.qrCodePath) {
      const oldPath = path.join(__dirname, '..', '..', merchant.qrCodePath);
      if (fs.existsSync(oldPath)) {
        try {
          fs.unlinkSync(oldPath);
        } catch (e) {
          console.error('Failed to delete old QR code:', e.message);
        }
      }
    }

    const relativePath = `/uploads/qrcodes/${req.file.filename}`;
    const updatedMerchant = await Merchant.findByIdAndUpdate(
      req.merchantId,
      { $set: { qrCodePath: relativePath } },
      { new: true }
    );

    return ok(res, { merchant: updatedMerchant }, 'Payment QR code uploaded successfully');
  } catch (err) {
    next(err);
  }
}

module.exports = { sendOtp, verifyOtp, getMe, updateMe, logout, uploadQrCode };
