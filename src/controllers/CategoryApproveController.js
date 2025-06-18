const express = require("express"); // Though not used in the current snippet, convert for consistency
const { Sequelize } = require("sequelize"); // Import Sequelize
const {
  SendCreate,
  SendSuccess,
  SendError400,
  SendError,
  SendDuplicateData,
} = require("../utils/response");
const moment = require("moment"); // Import moment.js

const CategoryApprove = require("../models/CategoryApprove"); // Assuming District model
const User = require("../models/User");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators

// const jwt = require('jsonwebtoken');

class CategoryApproveController {
  constructor(categoryapproveService) {
    this.categoryapproveService = categoryapproveService; // Dependency Injection
    // this.logSystemService = logSystemService; // Dependency Injection
  }

  static async fetchTokenKeyForUser(gettokenkey) {
    if (!gettokenkey) {
      console.log("No tokenkey provided to fetch user details"); // Changed log message for clarity
      return null;
    }
    try {
      const user = await User.findOne({
        attributes: ["tokenkey", "typelogin", "emailorphone"], // Selects tokenkey and typelogin
        where: {
          tokenkey: gettokenkey,
          statustypes: "ADD", // Assuming 'statustypes' is a valid column in 'tb_userlogin'
        },
        order: [["usid", "DESC"]], // Order by usid in descending order
      });

      if (!user) {
        return null;
      }
      return {
        tokenkey: user.tokenkey,
        typelogin: user.typelogin,
        emailorphone: user.emailorphone,
      }; // Return both tokenkey and typelogin
    } catch (error) {
      throw new Error(
        "Database query failed while fetching user details by token key."
      );
    }
  }

  async newCategoryApprove(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { categoryapprove } = req.body;
      if (!categoryapprove) {
        return SendError400(res, "Missing required fields");
      }
      //this is fect tokenkey
      const userDetail = await CategoryApproveController.fetchTokenKeyForUser(
        tokenKey
      );
      if (userDetail.tokenkey != tokenKey) {
        return SendError400(
          res,
          400,
          "Authorization failed: Invalid token key"
        );
      }
      //this is check data first
      const checkDataFirst = await this.categoryapproveService.checkDataFirst(
        categoryapprove
      );
      if (checkDataFirst) {
        console.log("Duplicate data.");
        return SendDuplicateData(res, "Category Approve is duplicate.");
      }
      const createCategoryApprove =
        await this.categoryapproveService.newCategoryApprove({
          categoryapprove,
          createby: userDetail.emailorphone,
        });
      //this is save log
      let form = "New CategoryApprove";
      let newdata = categoryapprove + " createby : " + userDetail.emailorphone;
      let olddata = "";
      const savelog = await this.categoryapproveService.createLogSystem({
        form,
        newdata,
        olddata,
        createby: userDetail.emailorphone,
      });
      return SendCreate(
        res,
        200,
        "Category Approve created successfully",
        categoryapprove
      );
    } catch (error) {
      console.log("Error message :", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }
  

  async getAllCategoryApprove(req, res, next) {
    try {
      console.log("show CategoryApprove");
      const { page, limit, tokenKey, searchtext } = req.query;
      // Fetch the Bank data
      const response = await this.categoryapproveService.getAllCategoryApprove({
        page,
        limit,
        searchtext,
      });

      // Ensure the response is valid and has the required properties
      if (!response || !response.items) {
        return SendError400(
          res,
          "Failed to fetch Register or invalid response format"
        );
      }

      let { items, totalItems, totalPages, currentPage } = response;
      const paginationData = {
        totalItems,
        totalPages,
        currentPage,
      };
      // Validate token
      const userDetails = await CategoryApproveController.fetchTokenKeyForUser(
        tokenKey
      );
      if (!userDetails) {
        return SendError400(res, "Invalid token key or user not found");
      }

      if (userDetails.tokenkey !== tokenKey) {
        return SendError(
          res,
          400,
          "User type login does not match the provided type login"
        );
      }
      return SendSuccess(
        res,
        "CategoryApprove items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching Categoryapprove in Controller:", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }
  async updateCategoryApprove(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { catename, capid } = req.body;
      if (!catename || !capid) {
        return SendError400(res, "Missing required fields");
      }
      //this is fect token compare
      const userData = await CategoryApproveController.fetchTokenKeyForUser(
        tokenKey
      );
      if (userData.tokenkey != tokenKey) {
        return SendError400(res, 400, "Invalid token key or user not found");
      }
      //this is check data first
      const checkData = await this.categoryapproveService.checkDataFirst(
        catename
      );
      if (checkData) {
        return SendDuplicateData(res, "Duplicate data");
      }
      //this is update data
      const updateCategoryApprove =
        await this.categoryapproveService.updateCategoryApprove(
          catename,
          capid
        );
      //this is save log
      let form = "Update CategoryApprove";
      let newdata = catename + " updateby : " + userData.emailorphone;
      let olddata = "";
      const savelog = await this.categoryapproveService.createLogSystem({
        form,
        newdata,
        olddata,
        createby: userData.emailorphone,
      });
      return SendCreate(
        res,
        200,
        "CategoryApprove updated successfully",
        catename
      );
    } catch (error) {
      console.error("Error update categoryapprove : ", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async deleteCategoryApprove(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { capid } = req.body;
      if (!capid) {
        return SendError400(res, "Missing required fields");
      }
      //this is fect token compare
      const userData = await CategoryApproveController.fetchTokenKeyForUser(
        tokenKey
      );
      if (userData.tokenkey != tokenKey) {
        return SendError400(res, 400, "Invalid token key or user not found");
      }
      //this is update data
      const updateCategoryApprove =
        await this.categoryapproveService.deleteCategoryApprove(capid);
      //this is save log
      let form = "Delete CategoryApprove";
      let newdata = "ID : " + capid + " updateby : " + userData.emailorphone;
      let olddata = "";
      const savelog = await this.categoryapproveService.createLogSystem({
        form,
        newdata,
        olddata,
        createby: userData.emailorphone,
      });

      if (updateCategoryApprove == 0) {
        return SendError400(res, "CategoryApprove not found id.");
      }
      console.log("CategoryApprove delete successfully", capid);
      return SendCreate(res, 200, "CategoryApprove delete successfully", capid);
    } catch (error) {
      console.error("Error delete categoryapprove : ", error);
      return SendError(res, 500, "Internal Server Error", error.message);
    }
  }
}
module.exports = CategoryApproveController;
