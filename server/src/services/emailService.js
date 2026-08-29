const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;

function getTransporter() {
  if (!env.isEmailConfigured) return null;
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}

/**
 * Sends the OTP email. In development mode (no SMTP creds configured) this
 * simply logs the OTP to the console instead of sending a real email, so the
 * whole app remains demonstrable without a paid/real Gmail account.
 */
async function sendOTPEmail(email, otp) {
  if (!env.isEmailConfigured) {
    logger.warn(`Development OTP mode - SMTP not configured.`);
    logger.success(`OTP for ${email}: ${otp} (valid ${env.OTP_EXPIRY_MINUTES} min)`);
    return { devMode: true };
  }

  const tx = getTransporter();
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#0f766e;">CredLink</h2>
      <p>Your login OTP is:</p>
      <p style="font-size:32px; font-weight:bold; letter-spacing:6px;">${otp}</p>
      <p>This code expires in ${env.OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.</p>
    </div>
  `;

  await tx.sendMail({
    from: `"CredLink" <${env.SMTP_USER}>`,
    to: email,
    subject: `Your CredLink login OTP: ${otp}`,
    html,
  });

  return { devMode: false };
}

module.exports = { sendOTPEmail };
