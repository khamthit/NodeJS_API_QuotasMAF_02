const express = require("express");
const router = express.Router();
const { DataTypes } = require("sequelize");

const GroupApproveController = require("../controllers/GroupApproveController");
const GroupApproveService = require("../services/GroupApproveService");

const groupapproveService = new GroupApproveService();
const groupapproveController = new GroupApproveController(groupapproveService);

 // Use .bind(this) for class methods
//  router.get("/", categoryapproveController.getAllCategoryApprove.bind(categoryapproveController));
router.post("/", groupapproveController.newgroupapprove.bind(groupapproveController));
router.put("/", groupapproveController.updategroupapprove.bind(groupapproveController));
router.get("/", groupapproveController.getAllGroupApprove.bind(groupapproveController));
router.delete("/", groupapproveController.deletegroupapprove.bind(groupapproveController));

module.exports = router;