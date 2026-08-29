const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { sendOtp, verifyOtp, getMe, updateMe, logout, uploadQrCode } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { otpRequestLimiter } = require('../middleware/rateLimitMiddleware');

// Configure disk storage for merchant QR codes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'qrcodes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `qr-${req.merchantId}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

router.post('/send-otp', otpRequestLimiter, sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/me/qr', protect, upload.single('qrCode'), uploadQrCode);
router.post('/logout', protect, logout);

module.exports = router;
