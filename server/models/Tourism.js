const mongoose = require('mongoose');

const TourismSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameHi: { type: String },
  description: { type: String, required: true },
  descriptionHi: { type: String },
  category: {
    type: String,
    enum: ['heritage', 'nature', 'cultural', 'religious', 'adventure', 'village_life'],
    required: true
  },
  location: { type: String, required: true },
  state: { type: String, required: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  images: [{ type: String }],
  videos: [{ type: String }],
  events: [{
    name: { type: String },
    date: { type: Date },
    description: { type: String }
  }],
  contactName: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  entryFee: { type: Number, default: 0 },
  bestTimeToVisit: { type: String },
  facilities: [{ type: String }],
  isApproved: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

TourismSchema.index({ name: 'text', description: 'text', location: 'text' });

module.exports = mongoose.model('Tourism', TourismSchema);
