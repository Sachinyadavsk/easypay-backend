const express = require('express');
const router = express.Router();
const { sendMoney, getTransactionHistory, bankTransfer, upiTransfer, selfTransfer, transactionHistory } = require('../controllers/txnController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/send', protect, sendMoney);
router.get('/history', protect, getTransactionHistory);
router.post('/bank-transfer', protect, bankTransfer);
router.post('/upi-transfer', protect, upiTransfer);
router.post('/self-transfer', protect, selfTransfer);
router.get('/historyall', protect, transactionHistory);

module.exports = router;
