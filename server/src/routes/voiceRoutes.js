const express = require('express');
const router = express.Router();
const multer = require('multer');
const { extractFromVoice, transcribeVoice, searchCustomerByVoice } = require('../controllers/voiceController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

router.use(protect);
router.post('/extract', extractFromVoice);
router.post('/transcribe', upload.single('audio'), transcribeVoice);
router.post('/search-customer', upload.single('audio'), searchCustomerByVoice);

module.exports = router;
