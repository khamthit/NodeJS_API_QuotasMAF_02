const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");

const EmployeeGroupApprovalController = require("../controllers/EmployeeGroupApprovalController");
const EmployeeGroupApprovalService = require("../services/EmployeeGroupApprovalService");



const employeeGroupApprovalService = new EmployeeGroupApprovalService();
const employeeGroupApprovalController = new EmployeeGroupApprovalController(employeeGroupApprovalService);

router.post("/", employeeGroupApprovalController.newemployeegroupapproval.bind(employeeGroupApprovalController));
router.get("/", employeeGroupApprovalController.getAllEmployeeGroupApproval.bind(employeeGroupApprovalController));
router.put("/", employeeGroupApprovalController.updateemployeegroupapproval.bind(employeeGroupApprovalController));
router.delete("/", employeeGroupApprovalController.deleteemployeegroupapproval.bind(employeeGroupApprovalController));


module.exports = router;