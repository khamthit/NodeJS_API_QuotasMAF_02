const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");

const EmployeeController = require("../controllers/EmployeeController");
const EmployeeService = require("../services/EmployeeService");



const employeeService = new EmployeeService();
const employeeController = new EmployeeController(employeeService);

router.post("/", employeeController.newemployee.bind(employeeController));
router.get("/", employeeController.getAllEmployee.bind(employeeController));
router.put("/", employeeController.updateemployee.bind(employeeController));
router.delete("/", employeeController.deleteemployee.bind(employeeController));


module.exports = router;