// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const VillageController = require('../controllers/VillagesController');
const VillageService = require('../services/VillagesService'); // Import service

// Instantiate the service and controller
const villageService = new VillageService();
const villagesController = new VillageController(villageService);

router.get('/', villagesController.getAllVillages.bind(villagesController)); // Use .bind(this) for class methods
router.post('/', villagesController.newVillages.bind(villagesController));


module.exports = router;