const Equipment = require('../models/Equipment');

exports.getEquipment = async (req, res) => {
  try {
    const { type, location, available, page = 1, limit = 12 } = req.query;
    const query = {};
    if (type) query.type = type;
    if (location) query.location = new RegExp(location, 'i');
    if (available === 'true') query.isAvailable = true;

    const equipment = await Equipment.find(query)
      .populate('owner', 'name phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Equipment.countDocuments(query);

    res.json({ success: true, data: equipment, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id).populate('owner', 'name phone location');
    if (!equipment) return res.status(404).json({ success: false, error: 'Equipment not found' });
    res.json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createEquipment = async (req, res) => {
  try {
    const data = { ...req.body, owner: req.user._id };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => '/uploads/' + f.filename);
    }
    const equipment = await Equipment.create(data);
    res.status(201).json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, error: 'Equipment not found' });
    if (equipment.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    
    // Handle booking status update
    if (req.body.bookingUpdate) {
      const { bookingId, status } = req.body.bookingUpdate;
      const booking = equipment.bookings.id(bookingId);
      if (booking) {
        booking.status = status;
        if (status === 'confirmed') {
          equipment.totalEarnings += booking.totalAmount || 0;
        }
        await equipment.save();
        return res.json({ success: true, data: equipment });
      }
      // Try by index if id doesn't work
      for (let b of equipment.bookings) {
        if (b.status === 'pending') {
          b.status = status;
          if (status === 'confirmed') equipment.totalEarnings += b.totalAmount || 0;
          await equipment.save();
          return res.json({ success: true, data: equipment });
        }
      }
    }

    const data = { ...req.body };
    delete data.bookingUpdate;
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => '/uploads/' + f.filename);
    }
    const updated = await Equipment.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment) return res.status(404).json({ success: false, error: 'Equipment not found' });
    if (equipment.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    await equipment.deleteOne();
    res.json({ success: true, message: 'Equipment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.bookEquipment = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const equipment = await Equipment.findById(req.params.id);
    if (!equipment || !equipment.isAvailable) {
      return res.status(400).json({ success: false, error: 'Equipment not available' });
    }

    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    const totalAmount = days * equipment.pricePerDay;

    equipment.bookings.push({
      user: req.user._id,
      startDate,
      endDate,
      totalAmount,
      status: 'pending'
    });
    equipment.totalBookings += 1;
    await equipment.save();

    res.status(201).json({ success: true, data: equipment.bookings[equipment.bookings.length - 1], totalAmount });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOwnerEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: equipment });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const equipment = await Equipment.find({
      $or: [
        { owner: req.user._id },
        { 'bookings.user': req.user._id }
      ]
    }).populate('owner', 'name phone');
    const bookings = [];
    equipment.forEach(eq => {
      eq.bookings.forEach(b => {
        if (b.user.toString() === req.user._id.toString() || eq.owner._id.toString() === req.user._id.toString()) {
          bookings.push({ ...b.toObject(), equipmentName: eq.name, equipmentId: eq._id });
        }
      });
    });
    res.json({ success: true, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
