const express = require("express"); // Though not used in the current snippet, convert for consistency
const { Sequelize, where } = require("sequelize"); // Import Sequelize
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
const Bank = require("../models/Bank");

class BankController {
  constructor(bankService) {
    this.bankService = bankService; // Dependency Injection
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

  async getBankAll(req, res, next) {
    try {
      console.log("show Bankank");
      const { page, limit, tokenKey, searchtext } = req.query;
      // Fetch the Bank data
      const response = await this.bankService.getBankAll({
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
      const userDetails = await BankController.fetchTokenKeyForUser(tokenKey);
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
      console.error("Error fetching Bank in Controller:", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async newBank(req, res, next) {
    try {
      console.log("new Bankank");
      const { tokenKey } = req.query;
      const { bankshortname, bankname } = req.body;

      //this is check tokenKey
      const userData = await BankController.fetchTokenKeyForUser(tokenKey);
      if (userData.tokenkey != tokenKey || !userData) {
        return SendError400(res, 400, "Invalid token key or user not found");
      }

      //this is check data first
      const checkdata = await this.bankService.checkDataFirst(
        bankshortname,
        bankname
      );
      if (checkdata) {
        return SendDuplicateData(res, "Duplicate data");
      }
      //this is save data
      const result = await this.bankService.newBank(bankshortname, bankname);

      //this is save log
      let form = "Bank - newBank";
      let newdata = bankshortname + " " + bankname;
      let olddata = "";
      const savelog = await this.bankService.createLogSystem({
        form,
        newdata,
        olddata,
        createby: userData.emailorphone,
      });
      return SendCreate(res, 200, "Bank created successfully");
    } catch (error) {
      console.error("Error Bank in Controller:", error);
      //   next(error);
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async updateBank(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { bankshortname, bankname, bkid } = req.body;

      //this is fecting data tokenKey first
      const userData = await BankController.fetchTokenKeyForUser(tokenKey);
      if (userData.tokenkey != tokenKey || !userData) {
        return SendError400(res, 400, "Invalid token key or user not found");
      }

      //this is check data first
      const checkdata = await this.bankService.checkDataFirst(
        bankshortname,
        bankname
      );
      if (checkdata) {
        return SendDuplicateData(res, "Duplicate data");
      }
      //this is update data
      const updateBank = await this.bankService.updateBank(
        bankshortname,
        bankname,
        bkid
      );

      //this is save log
      let form = "Bank - updateBank";
      let newdata = bankshortname + " " + bankname;
      let olddata = "";
      const savelog = await this.bankService.createLogSystem({
        form,
        newdata,
        olddata,
        createby: userData.emailorphone,
      });
      return SendCreate(res, 200, "Bank updated successfully");
    } catch (error) {
      console.error("Error updateBank in Controller:", error);
      //   next(error);
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async deleteBank(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { bkid } = req.body;

      //this is fecting data tokenKey first
      const userData = await BankController.fetchTokenKeyForUser(tokenKey);
      if (userData.tokenkey != tokenKey || !userData) {
        return SendError400(res, 400, "Invalid token key or user not found");
      }

      //this is update data
      const updateBank = await this.bankService.deleteBank(bkid);

      //this is save log
      let form = "Bank - deleteBank";
      let newdata = bkid;
      let olddata = "";
      const savelog = await this.bankService.createLogSystem({
        form,
        newdata,
        olddata,
        createby: userData.emailorphone,
      });
      return SendCreate(res, 200, "Bank delete successfully");
    } catch (error) {
      console.error("Error deleteBank in Controller:", error);
      //   next(error);
      return SendError(res, 500, "Internal Server Error");
    }
  }
}

module.exports = BankController;
