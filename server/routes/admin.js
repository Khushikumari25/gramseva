const express = require('express');
const router = express.Router();
const { param } = require('express-validator');
const validate = require('../middleware/validate');
const {
  getDashboard,
  getUsers,
  updateUser,
  deleteUser,
  getAnalytics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/users', getUsers);

router.put('/users/:id', [
  param('id').isMongoId().withMessage('Invalid user ID')
], validate, updateUser);

router.delete('/users/:id', [
  param('id').isMongoId().withMessage('Invalid user ID')
], validate, deleteUser);

router.get('/analytics', getAnalytics);

module.exports = router;
