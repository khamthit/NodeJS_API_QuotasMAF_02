const express = require("express");
const router = express.Router();

const RegisterController = require("../controllers/RegisterController");
const RegisterService = require("../services/RegisterService"); // Import service

const registerService = new RegisterService();
const registerController = new RegisterController(registerService);

router.post("", registerController.updateLicenseDetails.bind(registerController)); // New distinct path
router.put("", registerController.updateRegisterDoc.bind(registerController)); // New distinct path
router.patch("", registerController.updateRegisterBank.bind(registerController)); // New distinct path)

module.exports = router;


