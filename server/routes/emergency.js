const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { getEmergencyContacts, reportEmergency } = require('../controllers/emergencyController');

router.get('/', getEmergencyContacts);

router.post('/report', [
  body('type').notEmpty().withMessage('Emergency type is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('description').notEmpty().withMessage('Description is required')
], validate, reportEmergency);

module.exports = router;
