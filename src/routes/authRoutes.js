const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, setupMpin, profileUpdate, logout, loginWithMpin, getAllUser } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/setup-mpin', protect, setupMpin); // New Route
router.put('/user/profile', protect, profileUpdate);
router.post('/logout', protect, logout);
router.post('/login-mpin', loginWithMpin); // New Route
router.get('/getAllUser', getAllUser); // New Route


module.exports = router;
