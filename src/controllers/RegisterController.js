
const express = require("express"); // Though not used in the current snippet, convert for consistency
const { Sequelize } = require("sequelize"); // Import Sequelize
const {
  SendCreate,
  SendSuccess,
  SendError400,
  SendError,
  SendDuplicateData,
} = require("../utils/response");

const User = require("../models/User");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const Register = require("../models/Register");

class RegisterController {
  constructor(registerService) {
    this.registerService = registerService; // Dependency Injection
  }

  static async fetchTokenKeyForUserCustomer(gettokenkey) {
    if (!gettokenkey) {
      console.log("No tokenkey provided to fetch user details"); // Changed log message for clarity
      return null;
    }
    try {
      const user = await Register.findOne({
        attributes: [
          "tokenkey",
          "emails",
          "firstname",
          "lastname",
          "typeregister",
        ], // Selects tokenkey and typelogin
        where: {
          tokenkey: gettokenkey,
          statustype: "ADD", // Assuming 'statustypes' is a valid column in 'tb_userlogin'
        },
        order: [["rgstid", "DESC"]], // Order by usid in descending order
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
      console.log("Error :", error);
      //   throw new Error(
      //     "Database query failed while fetching user details by token key."
      //   );
    }
  }

  async getRegister(req, res, next) {
    console.log("show Register");
    try {
      const { page, limit, tokenKey, searchtext } = req.query;

      // Fetch the village data
      const response = await this.registerService.getRegisterAll({
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

      const { items, totalItems, totalPages, currentPage } = response;

      const paginationData = {
        totalItems,
        totalPages,
        currentPage,
      };
      // Validate token
      const userDetails = await RegisterController.fetchTokenKeyForUserCustomer(
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
        "Register retrieved successfully",
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching Register in Controller:", error);
      next(error);
    }
  }

  async newRegister(req, res, next) {
    console.log("new Register:");
    try {
      const { emails, createby } = req.body;

      // this is check data first
      const checkdata = await this.registerService.checkDataFirst(emails);
      if (checkdata) {
        return SendDuplicateData(res, "Duplication Data.");
      }
      const createdata = await this.registerService.newRegister(
        emails,
        createby
      );
      return SendCreate(res, 200, "Created Register", emails, createdata);
    } catch (error) {
      console.error("Error new Register in Controller:", error);
      return SendError(res, 500, "Failed to create Register");
    }
  }

  async verifyOTP(req, res, next) {
    try {
      const { emails } = req.body;
      const otp = await this.registerService.verifyOTP(emails);
      if (otp) {
        return SendSuccess(res, 200, "OTP verified successfully", otp);
      } else {
        return SendError(res, 400, "Invalid OTP, Please try again.");
      }
    } catch (error) {
      return SendError(res, 500, "Failed to verify OTP");
    }
  }

  async addGeneralInfo(req, res, next) {
    try {
      const { emails, typeregister, firstname, lastname, mobiles, passwords, images } =
        req.body;
      const updateData = {
        emails,
        typeregister,
        firstname,
        lastname,
        mobiles,
        passwords,
        images,
      };
      
      const update = await this.registerService.registerGeneralInfo(updateData);
      if (update) {
        return SendSuccess(res, 200, "Add General Info uccessfully");
      } else {
        return SendError(res, 400, "General Info , Please try again.");
      }
    } catch (error) {
      console.log("Error message addGeneralInfo controller :", error);
      return SendError(res, 500, "Failed to General Info ");
    }
  }

  async updateLicenseDetails(req, res, next) {
    try {
      console.log("updateLicenseDetails");
      const { emails,
        businessid,
        laoenterprise,
        engenterprise,
        registerby,
        capitalregistration,
        investmenttype,
        registerationdate,
        province,
        district,
        village,
        taxinfo,
        taxregistration,
        status } = req.body;

        const updateData = {emails, businessid,
        laoenterprise,
        engenterprise,
        registerby,
        capitalregistration,
        investmenttype,
        registerationdate,
        province,
        district,
        village,
        taxinfo,
        taxregistration,
        status};
        const update = await this.registerService.updateLicenseDetails(updateData);
        if (update) {
          return SendSuccess(res, 200, "Update License Details uccessfully");
        }else{
          return SendError(res, 400, "Update License Details , Please try again.");
        }

    } catch (error) {
      console.log("Failed to updateLicenseDetails");
      return SendError(res, 500, "Failed to updateLicenseDetails");
    }
  }
}
module.exports = RegisterController;
