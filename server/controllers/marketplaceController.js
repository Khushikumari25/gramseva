const Product = require('../models/Product');
const Order = require('../models/Order');
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
});

exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const query = { isAvailable: true };
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }

    const products = await Product.find(query)
      .populate('seller', 'name location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Product.countDocuments(query);

    res.json({ success: true, data: products, total, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('seller', 'name phone location');
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const data = { ...req.body, seller: req.user._id };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => '/uploads/' + f.filename);
    }
    const product = await Product.create(data);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    const data = { ...req.body };
    if (req.files && req.files.length > 0) {
      data.images = req.files.map(f => '/uploads/' + f.filename);
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { productId, quantity, shippingAddress } = req.body;
    const product = await Product.findById(productId);
    if (!product || !product.isAvailable) {
      return res.status(400).json({ success: false, error: 'Product not available' });
    }
    const totalAmount = product.price * (quantity || 1);

    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount * 100,
      currency: 'INR',
      receipt: `order_${Date.now()}`
    });

    const order = await Order.create({
      buyer: req.user._id,
      seller: product.seller,
      product: productId,
      quantity: quantity || 1,
      totalAmount,
      shippingAddress,
      paymentId: razorpayOrder.id
    });

    res.status(201).json({
      success: true,
      data: order,
      razorpayOrder: { id: razorpayOrder.id, amount: razorpayOrder.amount, currency: razorpayOrder.currency }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [{ buyer: req.user._id }, { seller: req.user._id }]
    })
      .populate('product', 'name images price')
      .populate('buyer', 'name')
      .populate('seller', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      await Order.findOneAndUpdate(
        { paymentId: razorpay_order_id },
        { paymentStatus: 'completed', status: 'confirmed' }
      );
      res.json({ success: true, message: 'Payment verified' });
    } else {
      res.status(400).json({ success: false, error: 'Payment verification failed' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
