const crypto = require('crypto');
const OTP = require('../models/OTP');
const env = require('../config/env');
const generateOTP = require('../utils/generateOTP');
const hashOTP = require('../utils/hashOTP');
const { sendOTPEmail } = require('./emailService');

/** Creates and sends a new OTP for the given email, invalidating any previous ones. */
async function requestOTP(email) {
  await OTP.deleteMany({ email });

  const otp = generateOTP(6);
  const salt = crypto.randomBytes(16).toString('hex');
  const otpHash = hashOTP(otp, salt);
  const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);

  await OTP.create({ email, otpHash, salt, expiresAt });

  const result = await sendOTPEmail(email, otp);
  return { devMode: result.devMode, expiresInMinutes: env.OTP_EXPIRY_MINUTES };
}

/** Verifies a submitted OTP, enforcing max attempts + expiry. */
async function verifyOTP(email, submittedOTP) {
  const record = await OTP.findOne({ email }).sort({ createdAt: -1 });

  if (!record) {
    return { valid: false, reason: 'OTP not requested or already used. Please request a new one.' };
  }

  if (record.verified) {
    return { valid: false, reason: 'OTP already used. Please request a new one.' };
  }

  if (record.expiresAt < new Date()) {
    await OTP.deleteOne({ _id: record._id });
    return { valid: false, reason: 'OTP expired. Please request a new one.' };
  }

  if (record.attempts >= env.OTP_MAX_ATTEMPTS) {
    await OTP.deleteOne({ _id: record._id });
    return { valid: false, reason: 'Maximum attempts exceeded. Please request a new one.' };
  }

  const submittedHash = hashOTP(submittedOTP, record.salt);
  if (submittedHash !== record.otpHash) {
    record.attempts += 1;
    await record.save();
    return { valid: false, reason: `Incorrect OTP. ${env.OTP_MAX_ATTEMPTS - record.attempts} attempt(s) left.` };
  }

  record.verified = true;
  await record.save();
  await OTP.deleteOne({ _id: record._id });

  return { valid: true };
}

module.exports = { requestOTP, verifyOTP };
