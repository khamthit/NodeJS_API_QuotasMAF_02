// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const UserloginController = require('../controllers/UserloginController');
const UserloginService = require('../services/UserloginService'); // Import service

// Instantiate the service and controller
const userloginService = new UserloginService();
const userloginController = new UserloginController(userloginService);

router.get('/', userloginController.Userlogin.bind(userloginController)); // Use .bind(this) for class methods


module.exports = router;