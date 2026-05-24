const User = require('../models/User');
const { validationResult } = require('express-validator');

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { name, email, phone, password, role, state, district, village, language } = req.body;

    let existingUser = null;
    if (email) existingUser = await User.findOne({ email });
    if (!existingUser && phone) existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const user = await User.create({ name, email, phone, password, role, state, district, village, language });
    const token = user.getSignedJwtToken();
    res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, phone, password } = req.body;
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (phone) {
      user = await User.findOne({ phone });
    }
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    const token = user.getSignedJwtToken();
    res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role, language: user.language } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone, name: 'User', otp, otpExpiry });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      await user.save();
    }
    // In production, send OTP via SMS service
    res.json({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });
    if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, error: 'Invalid or expired OTP' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    const token = user.getSignedJwtToken();
    res.json({ success: true, token, user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = ['name', 'avatar', 'state', 'district', 'village', 'language'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: process.env.NODE_ENV === 'production' ? 'Update failed' : error.message });
  }
};
