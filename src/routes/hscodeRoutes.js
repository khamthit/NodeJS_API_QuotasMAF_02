const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");

const HScodeController = require("../controllers/HScodeController");
const HScodeService = require("../services/HScodeService");

const hscodeService = new HScodeService();
const hscodeController = new HScodeController(hscodeService);

router.get("/", hscodeController.getAllHScode.bind(hscodeController));
router.post("/", hscodeController.updatehscodeactive.bind(hscodeController));

module.exports = router;