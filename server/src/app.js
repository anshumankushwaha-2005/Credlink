const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const voiceRoutes = require('./routes/voiceRoutes');
const billRoutes = require('./routes/billRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      'https://credlink-six.vercel.app',
      'https://credlink-six.vercel.app/',
      env.CLIENT_URL,
      env.CLIENT_URL ? env.CLIENT_URL + '/' : ''
    ].filter(Boolean);
    
    // Clean trailing slash for checking
    const cleanOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const cleanAllowed = allowed.map(url => url.endsWith('/') ? url.slice(0, -1) : url);

    if (cleanAllowed.includes(cleanOrigin) || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
      callback(null, origin); // Reflect request origin
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));
}

app.use('/api', apiLimiter);

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'CredLink API is running',
    emailConfigured: env.isEmailConfigured,
    twilioConfigured: env.isTwilioConfigured,
    time: new Date().toISOString(),
  });
});

app.get('/api/debug-status', async (req, res) => {
  const nodemailer = require('nodemailer');
  const mongoose = require('mongoose');
  
  const debug = {
    env: {
      NODE_ENV: process.env.NODE_ENV,
      CLIENT_URL: process.env.CLIENT_URL,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
      SMTP_PASS_LENGTH: process.env.SMTP_PASS ? process.env.SMTP_PASS.length : 0,
      GROQ_API_KEY_EXISTS: !!process.env.GROQ_API_KEY,
      isEmailConfigured: env.isEmailConfigured,
    },
    mongodb: {
      state: mongoose.connection.readyState, // 1 = connected
      host: mongoose.connection.host,
    },
    smtp: {
      status: 'untested',
      error: null
    }
  };

  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
      connectionTimeout: 8000,
      socketTimeout: 8000,
    });
    await transporter.verify();
    debug.smtp.status = 'verified';
  } catch (err) {
    debug.smtp.status = 'failed';
    debug.smtp.error = err.message;
  }

  res.json(debug);
});

app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
