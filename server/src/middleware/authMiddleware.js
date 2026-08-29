const { verifyToken } = require('../services/jwtService');
const Merchant = require('../models/Merchant');
const { fail } = require('../utils/response');

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return fail(res, 'Not authenticated. Please log in.', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const merchant = await Merchant.findById(decoded.id).select('-__v');
    if (!merchant) {
      return fail(res, 'Merchant account not found.', 401);
    }

    req.merchant = merchant;
    req.merchantId = merchant._id;
    next();
  } catch (err) {
    return fail(res, 'Invalid or expired session. Please log in again.', 401);
  }
}

module.exports = { protect };
