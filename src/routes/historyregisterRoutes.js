const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");

const HistoryRegisterController = require("../controllers/HistoryRegisterController");
const HistoryRegisterService = require("../services/HistoryRegisterService");

const historyregisterService = new HistoryRegisterService();
const historyregisterController = new HistoryRegisterController(historyregisterService);

router.get("/", historyregisterController.getAllHistoryRegister.bind(historyregisterController));

module.exports = router;