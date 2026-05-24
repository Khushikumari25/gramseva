const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getSellerProducts,
  createOrder,
  getOrders,
  verifyPayment
} = require('../controllers/marketplaceController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/seller', protect, authorize('seller', 'admin'), getSellerProducts);
router.get('/orders', protect, getOrders);

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid product ID')
], validate, getProduct);

router.post('/', protect, authorize('seller', 'admin'), upload.array('images', 5), [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').notEmpty().withMessage('Category is required')
], validate, createProduct);

router.put('/:id', protect, authorize('seller', 'admin'), upload.array('images', 5), [
  param('id').isMongoId().withMessage('Invalid product ID'),
  body('price').optional().isNumeric().withMessage('Price must be a number')
], validate, updateProduct);

router.delete('/:id', protect, authorize('seller', 'admin'), [
  param('id').isMongoId().withMessage('Invalid product ID')
], validate, deleteProduct);

router.post('/order', protect, [
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('quantity').notEmpty().withMessage('Quantity is required')
], validate, createOrder);

router.post('/verify-payment', protect, [
  body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required')
], validate, verifyPayment);

module.exports = router;
