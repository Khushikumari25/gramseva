const mongoose = require('mongoose');

const EquipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameHi: { type: String },
  type: {
    type: String,
    enum: ['tractor', 'pump_set', 'harvester', 'farming_machine', 'other'],
    required: true
  },
  description: { type: String },
  descriptionHi: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  pricePerDay: { type: Number, required: true },
  pricePerHour: { type: Number },
  images: [{ type: String }],
  location: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  isAvailable: { type: Boolean, default: true },
  condition: { type: String, enum: ['excellent', 'good', 'fair'], default: 'good' },
  bookings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
    totalAmount: { type: Number },
    paymentId: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  totalEarnings: { type: Number, default: 0 },
  totalBookings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
