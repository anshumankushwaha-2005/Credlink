const express = require('express');
const router = express.Router();
const { listBills, getBill, downloadBill, sendBillWhatsApp } = require('../controllers/billController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', listBills);
router.get('/:transactionId', getBill);
router.get('/:transactionId/download', downloadBill);
router.post('/:transactionId/send-whatsapp', sendBillWhatsApp);

module.exports = router;
