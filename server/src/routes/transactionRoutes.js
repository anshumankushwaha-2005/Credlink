const express = require('express');
const router = express.Router();
const { createTransaction, listTransactions, getTransaction } = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', listTransactions);
router.post('/', createTransaction);
router.get('/:id', getTransaction);

module.exports = router;
