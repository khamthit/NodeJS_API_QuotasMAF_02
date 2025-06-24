const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");

const RequestQuotasAdminController = require("../controllers/RequestQuotasAdminController");
const RequestQuotasAdminService = require("../services/RequestQuotasService"); // Renamed for clarity, it's the service for RequestQuotas
const EmployeeGroupApprovalService = require("../services/EmployeeGroupApprovalService"); // Import the missing service

const requestquotasAdminService = new RequestQuotasAdminService();
const employeeGroupApprovalService = new EmployeeGroupApprovalService(); // Instantiate the missing service
const requestquotasAdminController = new RequestQuotasAdminController(requestquotasAdminService, employeeGroupApprovalService);

router.get("/", requestquotasAdminController.getAllRequestQuotasAdmin.bind(requestquotasAdminController));
router.post("/", requestquotasAdminController.approvequotas.bind(requestquotasAdminController));

module.exports = router;