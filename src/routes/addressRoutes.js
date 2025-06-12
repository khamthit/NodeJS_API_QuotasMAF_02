// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const AddressController = require('../controllers/AddressController');
const AddressService = require('../services/AddressService'); // Import service
// Instantiate the service and controller
const addressService = new AddressService();
const addressController = new AddressController(addressService);

router.get('/', addressController.getProvinces.bind(addressController)); // Use .bind(this) for class methods
router.post('/', addressController.createProvince.bind(addressController)); // Use .bind(this) for class methods
router.put('/', addressController.updateProvinces.bind(addressController)); // Use .bind(this) for class methods
router.delete('/', addressController.deleteProvince.bind(addressController)); // Use .bind(this) for class methods





module.exports = router;