const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const {
  chatWithAssistant,
  detectCropDisease,
  getFarmingRecommendations
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/chat', protect, [
  body('message').notEmpty().withMessage('Message is required').isString().withMessage('Message must be a string')
], validate, chatWithAssistant);

router.post('/crop-disease', protect, upload.single('image'), detectCropDisease);

router.post('/farming-recommendations', protect, [
  body('crop').notEmpty().withMessage('Crop is required'),
  body('location').notEmpty().withMessage('Location is required')
], validate, getFarmingRecommendations);

module.exports = router;
