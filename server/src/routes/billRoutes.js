const express = require('express');
const router = express.Router();
const { listBills, getBill, downloadBill, sendBillWhatsApp } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

// Public route for downloading the PDF (since customers need to access it without authentication)
router.get('/:transactionId/download', downloadBill);

router.use(protect);

router.get('/', listBills);
router.get('/:transactionId', getBill);
router.post('/:transactionId/send-whatsapp', sendBillWhatsApp);

module.exports = router;
