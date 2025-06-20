const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");

const ApproveHistoryRegisterController = require("../controllers/ApproveHistoryRegisterController");
const ApproveHistoryRegisterService = require("../services/ApproveHistoryRegisterService");

const approvehistoryregisterService = new ApproveHistoryRegisterService();
const approvehistoryregisterController = new ApproveHistoryRegisterController(approvehistoryregisterService);   

router.post("/", approvehistoryregisterController.newapprovehistoryregister.bind(approvehistoryregisterController));
router.get("/", approvehistoryregisterController.getRegisterbyAdmin.bind(approvehistoryregisterController));
module.exports = router;