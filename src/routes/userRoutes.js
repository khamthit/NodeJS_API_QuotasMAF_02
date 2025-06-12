// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const UserService = require('../services/UserService'); // Import service

// Instantiate the service and controller
const userService = new UserService();
const userController = new UserController(userService);

router.get('/', userController.getUsers.bind(userController)); // Use .bind(this) for class methods
router.post('/', userController.createUser.bind(userController));
router.post('/login', userController.getloginUser.bind(userController)); // Use .bind(this) for class methods
router.put('/', userController.updatePasswords.bind(userController)); // Use .bind(this) for class methods
router.put('/updateUserLogin', userController.updateUserLogin.bind(userController)); // Use .bind(this) for class methods
router.put('/deleteUserLogin', userController.deleteUserLogin.bind(userController)); // Use .bind(this) for class methods')
router.put('/updateUserLoginActive', userController.updateUserLoginActive.bind(userController)); // Use .bind(this) for class methods')
module.exports = router;