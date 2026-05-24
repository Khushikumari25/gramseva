const express = require('express');
const router = express.Router();
const { query } = require('express-validator');
const validate = require('../middleware/validate');
const { getWeather, getAlerts } = require('../controllers/weatherController');

router.get('/', [
  query('lat').optional().isNumeric().withMessage('Latitude must be a number'),
  query('lon').optional().isNumeric().withMessage('Longitude must be a number'),
  query('city').optional().isString().withMessage('City must be a string')
], validate, getWeather);

router.get('/alerts', [
  query('state').optional().isString().withMessage('State must be a string')
], validate, getAlerts);

module.exports = router;
