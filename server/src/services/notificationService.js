const env = require('../config/env');
const logger = require('../utils/logger');
const { formatINR } = require('./pdfService');

let twilioClient = null;
function getTwilioClient() {
  if (!env.isTwilioConfigured) return null;
  if (twilioClient) return twilioClient;
  const twilio = require('twilio');
  twilioClient = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return twilioClient;
}

function buildMessage({ customer, transaction, pdfDownloadUrl }) {
  const pdfLink = pdfDownloadUrl 
    ? `Download receipt PDF:\n${pdfDownloadUrl}\n*(Save this contact to make the link clickable)*\n\n` 
    : '';
  return (
    `Hello ${customer.name},\n\n` +
    `Your CredLink transaction has been recorded.\n\n` +
    `Transaction: ${transaction.type === 'CREDIT' ? 'Credit' : 'Payment'}\n` +
    `Amount: ${formatINR(transaction.amount)}\n` +
    `Current Outstanding Balance: ${formatINR(transaction.balanceAfter)}\n\n` +
    pdfLink +
    `Thank you.`
  );
}

function normalizeWhatsAppNumber(number) {
  if (!number) return null;
  const digits = number.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length === 10) return `+91${digits}`; // assume India if no country code
  return `+${digits}`;
}

function buildWhatsAppWebLink(number, message) {
  const normalized = normalizeWhatsAppNumber(number);
  const encoded = encodeURIComponent(message);
  if (!normalized) {
    return `https://wa.me/?text=${encoded}`;
  }
  return `https://wa.me/${normalized.replace('+', '')}?text=${encoded}`;
}

/**
 * Sends the transaction receipt over WhatsApp using Twilio when configured.
 * When Twilio isn't configured, returns a pre-filled WhatsApp Web/App share
 * link plus the PDF download path so the merchant can share it manually -
 * the app must remain fully demonstrable without paid WhatsApp API credentials.
 */
async function sendWhatsAppReceipt({ customer, transaction, pdfDownloadUrl }) {
  const message = buildMessage({ customer, transaction, pdfDownloadUrl });
  const whatsappWebUrl = buildWhatsAppWebLink(customer.whatsappNumber || customer.phone, message);

  if (!env.isTwilioConfigured) {
    logger.warn('Twilio not configured - falling back to WhatsApp Web share link.');
    return {
      mode: 'fallback',
      message,
      whatsappWebUrl,
      pdfDownloadUrl,
      info: 'WhatsApp is not configured. PDF receipt is ready to share.',
    };
  }

  try {
    const client = getTwilioClient();
    const to = `whatsapp:${normalizeWhatsAppNumber(customer.whatsappNumber || customer.phone)}`;
    const from = `whatsapp:${env.TWILIO_WHATSAPP_NUMBER}`;

    await client.messages.create({
      from,
      to,
      body: message,
      mediaUrl: pdfDownloadUrl ? [pdfDownloadUrl] : undefined,
    });

    return { mode: 'twilio', message, sent: true };
  } catch (err) {
    logger.error(`Twilio WhatsApp send failed: ${err.message}`);
    return {
      mode: 'fallback',
      message,
      whatsappWebUrl,
      pdfDownloadUrl,
      info: 'WhatsApp API send failed. Use the WhatsApp Web link or download the PDF instead.',
      error: err.message,
    };
  }
}

module.exports = { sendWhatsAppReceipt, buildWhatsAppWebLink, buildMessage };
