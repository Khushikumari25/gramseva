const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, unique: true, sparse: true, lowercase: true },
  phone: { type: String, unique: true, sparse: true },
  password: { type: String, minlength: 6 },
  role: {
    type: String,
    enum: ['farmer', 'admin', 'seller', 'equipment_owner'],
    default: 'farmer'
  },
  avatar: { type: String, default: '' },
  state: { type: String },
  district: { type: String },
  village: { type: String },
  language: { type: String, default: 'hi' },
  isVerified: { type: Boolean, default: false },
  otp: { type: String },
  otpExpiry: { type: Date },
  savedSchemes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Scheme' }],
  createdAt: { type: Date, default: Date.now }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

module.exports = mongoose.model('User', UserSchema);
