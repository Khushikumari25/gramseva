const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const {
  getSchemes,
  getScheme,
  createScheme,
  updateScheme,
  deleteScheme,
  bookmarkScheme
} = require('../controllers/schemeController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', [
  query('category').optional().isString().withMessage('Category must be a string'),
  query('state').optional().isString().withMessage('State must be a string')
], validate, getSchemes);

router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid scheme ID')
], validate, getScheme);

router.post('/', protect, authorize('admin'), upload.single('image'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required')
], validate, createScheme);

router.put('/:id', protect, authorize('admin'), upload.single('image'), [
  param('id').isMongoId().withMessage('Invalid scheme ID')
], validate, updateScheme);

router.delete('/:id', protect, authorize('admin'), [
  param('id').isMongoId().withMessage('Invalid scheme ID')
], validate, deleteScheme);

router.post('/:id/bookmark', protect, [
  param('id').isMongoId().withMessage('Invalid scheme ID')
], validate, bookmarkScheme);

module.exports = router;
