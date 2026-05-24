const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  nameHi: { type: String },
  description: { type: String, required: true },
  descriptionHi: { type: String },
  category: {
    type: String,
    enum: ['dairy', 'blankets', 'handicrafts', 'homemade', 'organic', 'farming'],
    required: true
  },
  price: { type: Number, required: true },
  unit: { type: String, default: 'piece' },
  images: [{ type: String }],
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stock: { type: Number, default: 1 },
  isAvailable: { type: Boolean, default: true },
  location: { type: String },
  ratings: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalSold: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

ProductSchema.index({ name: 'text', description: 'text', category: 1 });

module.exports = mongoose.model('Product', ProductSchema);
