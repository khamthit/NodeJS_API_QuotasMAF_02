const express = require("express");
const router = express.Router();

const RegisterController = require("../controllers/RegisterController");
const RegisterService = require("../services/RegisterService"); // Import service

const registerService = new RegisterService();
const registerController = new RegisterController(registerService);

router.get("/", registerController.getRegister.bind(registerController)); // Use .bind(this) for class methods
router.post("/", registerController.newRegister.bind(registerController)); // Use .bind(this) for class methods
router.put("/", registerController.verifyOTP.bind(registerController)); // Use .bind(this) for class methods
router.patch("/", registerController.addGeneralInfo.bind(registerController)); // Use .bind(this) for class methods

// router.post("", registerController.updateLicenseDetails.bind(registerController)); // New distinct path



module.exports = router;
