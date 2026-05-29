const express = require('express');
const router = express.Router();
const { addMoney, payBill, userMpin, verifyUpi, scanAnyQrTransfer, mobileRecService, dthRecharge, waterBill, insurancePayment } = require('../controllers/walletController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/add-money', protect, addMoney);
router.post('/pay-bill', protect, payBill);
router.post('/verify-mpin', protect, userMpin);
router.post('/verify-upi', protect, verifyUpi);
router.post('/scan-any-qr-transfer', protect, scanAnyQrTransfer);
router.post('/mobile-recharge', protect, mobileRecService);
router.post('/dth-recharge', protect, dthRecharge);
router.post('/water-bill', protect, waterBill);
router.post('/insurance-payment', protect, insurancePayment);



module.exports = router;
