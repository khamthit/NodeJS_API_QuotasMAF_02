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

const Employee = require("../models/Employee"); // Assuming District model
const User = require("../models/User");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators

class HistoryRegisterController {
  constructor(historyRegisterService) {
    this.historyRegisterService = historyRegisterService; // Dependency Injection
  }
  static async fetchTokenKeyForUser(gettokenkey) {
    if (!gettokenkey) {
      console.log("No tokenkey provided to fetch user details"); // Changed log message for clarity
      return null;
    }
    try {
      const user = await User.findOne({
        attributes: ["tokenkey", "typelogin", "emailorphone", "eid"], // Selects tokenkey and typelogin
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
        eid: user.eid,
      }; // Return both tokenkey and typelogin
    } catch (error) {
      throw new Error(
        "Database query failed while fetching user details by token key."
      );
    }
  }

  async getAllHistoryRegister(req, res, next) {
    try {
      console.log("show HistoryRegister controller");
      const { page, limit, tokenKey, searchtext, rgstid } = req.query;
      
      if (!page || !limit || !tokenKey || !rgstid){
        return SendError400(res, 400, "Missing required parameters");
      }
      // Validate token first
      const userDetails = await HistoryRegisterController.fetchTokenKeyForUser(
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
      console.log("UserData :", userDetails);
      const onlyapproveby = userDetails.eid; // Changed variable name for clarity
      console.log("eid / onlyapproveby : ", onlyapproveby); // Corrected typo: constole.log to console.log

      // Fetch the HistoryRegister data
      const response = await this.historyRegisterService.getAllHistoryRegister({
        page,
        limit,
        searchtext,// Pass the correct variable name
        rgstid,
      });

      // Ensure the response is valid and has the required properties
      if (!response || !response.items) {
        return SendError400(
          res,
          "Failed to fetch History Register or invalid response format" // Corrected message
        );
      }

      let { items, totalItems, totalPages, currentPage } = response;
      const paginationData = {
        totalItems,
        totalPages,
        currentPage,
        // eid: onlyapproveby, // Consider if 'eid' is still needed here or if 'onlyapproveby' is more descriptive
      };

      return SendSuccess(
        res,
        "History Register items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error(
        "Error fetching History Register in Controller:",
        error
      );
      return SendError(res, 500, "Internal Server Error");
    }
  }
}
module.exports = HistoryRegisterController;
