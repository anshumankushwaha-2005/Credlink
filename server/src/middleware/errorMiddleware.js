const logger = require('../utils/logger');

function notFound(req, res, next) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message);

  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  if (err.name === 'ValidationError') {
    return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors });
  }
  if (err.code === 11000) {
    return res.status(409).json({ success: false, message: 'Duplicate value', field: Object.keys(err.keyValue || {}) });
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = { notFound, errorHandler };
