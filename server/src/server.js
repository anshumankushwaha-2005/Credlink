const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./utils/logger');

async function start() {
  await connectDB();

  app.listen(env.PORT, () => {
    logger.success(`CredLink API listening on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Email OTP mode: ${env.isEmailConfigured ? 'Gmail SMTP' : 'DEVELOPMENT (console OTP)'}`);
    logger.info(`WhatsApp mode: ${env.isTwilioConfigured ? 'Twilio API' : 'WhatsApp Web fallback link'}`);
  });
}

start().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err.message}`);
});
