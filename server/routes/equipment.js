const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  bookEquipment,
  getOwnerEquipment,
  getBookings
} = require('../controllers/equipmentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getEquipment);
router.get('/owner', protect, authorize('equipment_owner', 'admin'), getOwnerEquipment);
router.get('/bookings', protect, getBookings);

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid equipment ID')
], validate, getEquipmentById);

router.post('/', protect, authorize('equipment_owner', 'admin'), upload.array('images', 5), [
  body('name').notEmpty().withMessage('Name is required'),
  body('pricePerDay').isNumeric().withMessage('Price per day must be a number')
], validate, createEquipment);

router.put('/:id', protect, authorize('equipment_owner', 'admin'), upload.array('images', 5), [
  param('id').isMongoId().withMessage('Invalid equipment ID')
], validate, updateEquipment);

router.delete('/:id', protect, authorize('equipment_owner', 'admin'), [
  param('id').isMongoId().withMessage('Invalid equipment ID')
], validate, deleteEquipment);

router.post('/:id/book', protect, [
  param('id').isMongoId().withMessage('Invalid equipment ID'),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid date')
], validate, bookEquipment);

module.exports = router;
