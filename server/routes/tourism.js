const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const {
  getPlaces,
  getPlace,
  createPlace,
  updatePlace,
  deletePlace
} = require('../controllers/tourismController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getPlaces);

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid place ID')
], validate, getPlace);

router.post('/', protect, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]), [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').notEmpty().withMessage('Location is required')
], validate, createPlace);

router.put('/:id', protect, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3 }
]), [
  param('id').isMongoId().withMessage('Invalid place ID')
], validate, updatePlace);

router.delete('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid place ID')
], validate, deletePlace);

module.exports = router;
