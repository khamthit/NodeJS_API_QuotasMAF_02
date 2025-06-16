const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db"); // sequelize import seems unused here

const BankController = require("../controllers/BankController");
const BankService = require("../services/BankService");

const bankService = new BankService();
const bankController = new BankController(bankService);

router.get("/", bankController.getBankAll.bind(bankController)); // Use .bind(this) for class methods
router.post("/", bankController.newBank.bind(bankController))
router.put("/", bankController.updateBank.bind(bankController))
router.delete("/", bankController.deleteBank.bind(bankController))



module.exports = router;
