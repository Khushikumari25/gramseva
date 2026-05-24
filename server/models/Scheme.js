const mongoose = require('mongoose');

const SchemeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleHi: { type: String },
  description: { type: String, required: true },
  descriptionHi: { type: String },
  state: {
    type: String,
    enum: ['Bihar', 'Haryana', 'Uttar Pradesh', 'Punjab', 'Jharkhand', 'All'],
    required: true
  },
  category: {
    type: String,
    enum: ['agriculture', 'women', 'education', 'health', 'housing', 'finance', 'other'],
    required: true
  },
  eligibility: { type: String, required: true },
  eligibilityHi: { type: String },
  requiredDocuments: [{ type: String }],
  benefits: { type: String },
  benefitsHi: { type: String },
  applicationUrl: { type: String },
  deadline: { type: Date },
  isActive: { type: Boolean, default: true },
  image: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

SchemeSchema.index({ title: 'text', description: 'text', state: 1, category: 1 });

module.exports = mongoose.model('Scheme', SchemeSchema);
