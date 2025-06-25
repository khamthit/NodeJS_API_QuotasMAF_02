const express = require("express"); // Though not used in the current snippet, convert for consistency
const { Sequelize } = require("sequelize"); // Import Sequelize
const {
  SendCreate,
  SendSuccess,
  SendError400,
  SendError,
  SendDuplicateData,
} = require("../utils/response");

const CountryCheckpoint = require("../models/CountryCheckpoint"); // Assuming District model
const User = require("../models/User");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const Country = require("../models/Country");
const Register = require("../models/Register");


class CountryCheckpointController {
  constructor(countrycheckpointService) {
    this.countrycheckpointService = countrycheckpointService; // Dependency Injection
  }
  static async fetchTokenKeyForCustomer(gettokenkey) {
    if (!gettokenkey) {
      console.log("No tokenkey provided to fetch user details"); // Changed log message for clarity
      return null;
    }
    try {
      const user = await Register.findOne({
        attributes: ["tokenkey", "businessid", "emails"], // Selects tokenkey and typelogin
        where: {
          tokenkey: gettokenkey, // Assuming 'statustypes' is a valid column in 'tb_register'
          logingstatus: "Y",
        },
        order: [["rgstid", "DESC"]], // Order by usid in descending order
      });

      if (!user) {
        return null;
      }
      return {
        tokenkey: user.tokenkey,
        businessid: user.businessid,
        emails: user.emails,
      }; // Return both tokenkey and typelogin
    } catch (error) {
      throw new Error(
        "Database query failed while fetching user details by token key."
      );
    }
  }

  async getAllCountryCheckpointUser(req, res, next) {
    try {
      console.log("show countrycheckpoint controller");
      const { page, limit, tokenKey, searchtext, countryid } = req.query;
      
      if (!page || !limit || !tokenKey){
        return SendError400(res, 400, "Missing required parameters");
      }
      // Validate token first
      console.log("TOkenkey: ", tokenKey);
      const userDetails = await CountryCheckpointController.fetchTokenKeyForCustomer(
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
      // Fetch the HistoryRegister data
      const response = await this.countrycheckpointService.getAllCountryCheckpoint({
        page,
        limit,
        searchtext,// Pass the correct variable name
        countryid: countryid,
      });

      // Ensure the response is valid and has the required properties
      if (!response || !response.items) {
        return SendError400(
          res,
          "Failed to fetch countrycheckpoint or invalid response format" // Corrected message
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
        "Countrycheckpoint items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error(
        "Error fetching countrycheckpointUser in Controller:",
        error
      );
      return SendError(res, 500, "Internal Server Error");
    }
  }


}
module.exports = CountryCheckpointController;
