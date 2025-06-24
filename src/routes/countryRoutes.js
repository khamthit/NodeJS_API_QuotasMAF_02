// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const CountryController = require('../controllers/CountryController');
const CountryService = require('../services/CountryService'); // Import service
// Instantiate the service and controller
const countryService = new CountryService();
const countryController = new CountryController(countryService);

router.get('/', countryController.getAllCountry.bind(countryController)); // Use .bind(this) for class methods





module.exports = router;