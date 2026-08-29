const crypto = require('crypto');

function hashOTP(otp, salt) {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
}

module.exports = hashOTP;
