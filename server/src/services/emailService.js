const nodemailer = require('nodemailer');
const https = require('https');
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
    connectionTimeout: 10000, // 10 seconds timeout
    socketTimeout: 10000,     // 10 seconds timeout
  });
  return transporter;
}

/**
 * Sends email using Brevo's HTTP API (Port 443) to bypass SMTP port blocks on hosting environments like Render.
 */
function sendViaBrevoAPI(email, subject, html) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      sender: { name: "CredLink", email: process.env.SENDER_EMAIL || env.SMTP_USER },
      to: [{ email: email }],
      subject: subject,
      htmlContent: html
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': env.SMTP_PASS,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Brevo API responded with status ${res.statusCode}: ${body}`));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(data);
    req.end();
  });
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

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
      <h2 style="color:#0f766e;">CredLink</h2>
      <p>Your login OTP is:</p>
      <p style="font-size:32px; font-weight:bold; letter-spacing:6px;">${otp}</p>
      <p>This code expires in ${env.OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.</p>
    </div>
  `;

  // Detect Brevo configuration and use HTTP API (Port 443) to avoid SMTP blocks
  if (env.SMTP_HOST && env.SMTP_HOST.includes('brevo')) {
    try {
      logger.info(`Sending OTP email via Brevo HTTPS API...`);
      await sendViaBrevoAPI(email, `Your CredLink login OTP: ${otp}`, html);
      return { devMode: false };
    } catch (err) {
      logger.error(`Brevo API Send Error: ${err.message}`);
      logger.warn(`Brevo API failed. Falling back to console OTP logging.`);
      logger.success(`[FALLBACK LOG] OTP for ${email}: ${otp} (valid ${env.OTP_EXPIRY_MINUTES} min)`);
      return { devMode: true, fallback: true };
    }
  }

  try {
    const tx = getTransporter();
    await tx.sendMail({
      from: `"CredLink" <${process.env.SENDER_EMAIL || env.SMTP_USER}>`,
      to: email,
      subject: `Your CredLink login OTP: ${otp}`,
      html,
    });

    return { devMode: false };
  } catch (err) {
    logger.error(`SMTP Send Error: ${err.message}`);
    logger.warn(`SMTP failed. Falling back to console OTP logging so you can still log in!`);
    logger.success(`[FALLBACK LOG] OTP for ${email}: ${otp} (valid ${env.OTP_EXPIRY_MINUTES} min)`);
    return { devMode: true, fallback: true };
  }
}

module.exports = { sendOTPEmail };
