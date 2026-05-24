const User = require('../models/User');
const Product = require('../models/Product');
const Equipment = require('../models/Equipment');
const Scheme = require('../models/Scheme');
const Order = require('../models/Order');
const Tourism = require('../models/Tourism');

exports.getDashboard = async (req, res) => {
  try {
    const [users, products, equipment, schemes, orders, tourism] = await Promise.all([
      User.countDocuments(),
      Product.countDocuments(),
      Equipment.countDocuments(),
      Scheme.countDocuments(),
      Order.countDocuments(),
      Tourism.countDocuments()
    ]);

    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name role createdAt');
    const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5)
      .populate('buyer', 'name').populate('product', 'name');

    res.json({
      success: true,
      data: {
        stats: { users, products, equipment, schemes, orders, tourism },
        recentUsers,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;
    if (search) query.name = new RegExp(search, 'i');

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await User.countDocuments(query);

    res.json({ success: true, data: users, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } }
    ]);
    const productsByCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const schemesByState = await Scheme.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: { usersByRole, ordersByStatus, productsByCategory, schemesByState }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
