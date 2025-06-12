const express = require('express');
const router = express.Router();

const DistrictController = require('../controllers/DistrictController'); // Import controller
const DistrictService = require('../services/DistrictService'); // Import service

const districtService = new DistrictService();
const districtController = new DistrictController(districtService);

router.get('/', districtController.getAllDistrict.bind(districtController)); // Use .bind(this) for class methods
router.post('/', districtController.newDistrict.bind(districtController)); // Use .bind(this) for class methods
router.put('/', districtController.updateDistrict.bind(districtController)); // Use .bind(this) for class methods
router.delete('/', districtController.deleteDistrict.bind(districtController)); // Use .bind(this) for class methods


module.exports = router;