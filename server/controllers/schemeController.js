const Scheme = require('../models/Scheme');
const User = require('../models/User');

exports.getSchemes = async (req, res) => {
  try {
    const { state, category, search, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (state && state !== 'All') query.state = { $in: [state, 'All'] };
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const schemes = await Scheme.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Scheme.countDocuments(query);

    res.json({ success: true, data: schemes, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findById(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, error: 'Scheme not found' });
    res.json({ success: true, data: scheme });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createScheme = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    if (data.requiredDocuments && typeof data.requiredDocuments === 'string') {
      data.requiredDocuments = data.requiredDocuments.split(',').map(d => d.trim());
    }
    const scheme = await Scheme.create(data);
    res.status(201).json({ success: true, data: scheme });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateScheme = async (req, res) => {
  try {
    const data = { ...req.body, updatedAt: Date.now() };
    if (req.file) data.image = '/uploads/' + req.file.filename;
    if (data.requiredDocuments && typeof data.requiredDocuments === 'string') {
      data.requiredDocuments = data.requiredDocuments.split(',').map(d => d.trim());
    }
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!scheme) return res.status(404).json({ success: false, error: 'Scheme not found' });
    res.json({ success: true, data: scheme });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndDelete(req.params.id);
    if (!scheme) return res.status(404).json({ success: false, error: 'Scheme not found' });
    res.json({ success: true, message: 'Scheme deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bookmarkScheme = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const schemeId = req.params.id;
    const index = user.savedSchemes.indexOf(schemeId);
    if (index > -1) {
      user.savedSchemes.splice(index, 1);
    } else {
      user.savedSchemes.push(schemeId);
    }
    await user.save();
    res.json({ success: true, savedSchemes: user.savedSchemes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
