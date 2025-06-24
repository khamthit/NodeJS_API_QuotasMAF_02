const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");

const ApproveHistoryQuotasAdminController = require("../controllers/ApproveHistoryQuotasAdminController");
const ApproveHistoryQuotasService = require("../services/ApproveHistoryQuotasService");

const approvehistoryquotasAdminService = new ApproveHistoryQuotasService();
const approvehistoryquotasAdminController = new ApproveHistoryQuotasAdminController(approvehistoryquotasAdminService);

router.get("/", approvehistoryquotasAdminController.getapprovehistoryquotasadmin.bind(approvehistoryquotasAdminController));

module.exports = router;