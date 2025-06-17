const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");
// const sequelize = require("../config/db"); // sequelize import seems unused here



const CategoryApproveController = require("../controllers/CategoryApproveController");
const CategoryApproveService = require("../services/CategoryApproveService");

const categoryapproveService = new CategoryApproveService();
const categoryapproveController = new CategoryApproveController(categoryapproveService);

 // Use .bind(this) for class methods
 router.get("/", categoryapproveController.getAllCategoryApprove.bind(categoryapproveController));
router.post("/", categoryapproveController.newCategoryApprove.bind(categoryapproveController))
router.put("/", categoryapproveController.updateCategoryApprove.bind(categoryapproveController))
router.delete("/", categoryapproveController.deleteCategoryApprove.bind(categoryapproveController))

module.exports = router;