const express = require('express');
const router = express.Router();
const { getCustomerReport, getCustomerReportPDF } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/customer/:id', getCustomerReport);
router.get('/customer/:id/pdf', getCustomerReportPDF);

module.exports = router;
