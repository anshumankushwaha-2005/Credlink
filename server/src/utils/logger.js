const stamp = (msg) => new Date().toISOString() + ' - ' + msg;

module.exports = {
  info: (msg) => console.log('[INFO]', stamp(msg)),
  warn: (msg) => console.warn('[WARN]', stamp(msg)),
  error: (msg) => console.error('[ERROR]', stamp(msg)),
  success: (msg) => console.log('[OK]', stamp(msg)),
};
