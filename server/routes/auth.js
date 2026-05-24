const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const {
  register,
  login,
  sendOtp,
  verifyOtp,
  getMe,
  updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.body.phone || req.ip,
  message: { success: false, error: 'Too many OTP requests. Try again in 15 minutes.' }
});

router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be 6+ characters')
], register);

router.post('/login', [
  body('password').notEmpty().withMessage('Password required')
], login);

router.post('/send-otp', otpLimiter, [
  body('phone').isMobilePhone().withMessage('Valid phone required')
], sendOtp);

router.post('/verify-otp', [
  body('phone').isMobilePhone(),
  body('otp').isLength({ min: 4, max: 6 })
], verifyOtp);

router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
