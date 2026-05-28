const express = require('express');
const router = express.Router();
const { addBank, getMyBanks, createBanksMpin, verifyBankMpin } = require('../controllers/bankController');
const { protect } = require('../middlewares/authMiddleware');
router.post('/add', protect, addBank);
router.get('/my-banks', protect, getMyBanks);
router.post('/setup-mpin-bank', protect, createBanksMpin);
router.post('/verify-mpin', protect, verifyBankMpin);



module.exports = router;