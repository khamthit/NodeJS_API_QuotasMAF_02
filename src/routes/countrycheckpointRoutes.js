const express = require('express');
const router = express.Router();

const CountryCheckpointController = require('../controllers/CountryCheckpointController');
const CountryCheckpointService = require('../services/CountryCheckpointService'); // Import service
// Instantiate the service and controller
const countrycheckpointService = new CountryCheckpointService();
const countrycheckpointController = new CountryCheckpointController(countrycheckpointService);

router.get('/', countrycheckpointController.getAllCountryCheckpoint.bind(countrycheckpointController)); // Use .bind(this) for class methods
router.post('/', countrycheckpointController.createCountryCheckpoint.bind(countrycheckpointController));
router.put('/', countrycheckpointController.updatecountrycheckpoint.bind(countrycheckpointController));
router.delete('/', countrycheckpointController.deletecountrycheckpoint.bind(countrycheckpointController));

module.exports = router;