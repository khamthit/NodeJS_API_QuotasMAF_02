const express = require('express');
const router = express.Router();

const CountrycheckpointUserController = require('../controllers/CountryCheckpointUserController');
const CountryCheckpointService = require('../services/CountryCheckpointService'); // Import service
// Instantiate the service and controller
const countrycheckpointService = new CountryCheckpointService();
const countrycheckpointUserController = new CountrycheckpointUserController(countrycheckpointService);

router.get('/', countrycheckpointUserController.getAllCountryCheckpointUser.bind(countrycheckpointUserController)); // Use .bind(this) for class methods

module.exports = router;