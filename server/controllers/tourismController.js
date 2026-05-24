const Tourism = require('../models/Tourism');

exports.getPlaces = async (req, res) => {
  try {
    const { state, category, search, page = 1, limit = 12 } = req.query;
    const query = { isApproved: true };
    if (state) query.state = state;
    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const places = await Tourism.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Tourism.countDocuments(query);

    res.json({ success: true, data: places, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getPlace = async (req, res) => {
  try {
    const place = await Tourism.findById(req.params.id);
    if (!place) return res.status(404).json({ success: false, error: 'Place not found' });
    res.json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createPlace = async (req, res) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    if (req.files) {
      if (req.files.images) data.images = req.files.images.map(f => '/uploads/' + f.filename);
      if (req.files.videos) data.videos = req.files.videos.map(f => '/uploads/' + f.filename);
    }
    if (req.user.role === 'admin') data.isApproved = true;
    const place = await Tourism.create(data);
    res.status(201).json({ success: true, data: place });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePlace = async (req, res) => {
  try {
    const place = await Tourism.findById(req.params.id);
    if (!place) return res.status(404).json({ success: false, error: 'Place not found' });
    if (place.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const data = { ...req.body };
    if (req.files) {
      if (req.files.images) data.images = req.files.images.map(f => '/uploads/' + f.filename);
      if (req.files.videos) data.videos = req.files.videos.map(f => '/uploads/' + f.filename);
    }
    const updated = await Tourism.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deletePlace = async (req, res) => {
  try {
    await Tourism.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Place deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
