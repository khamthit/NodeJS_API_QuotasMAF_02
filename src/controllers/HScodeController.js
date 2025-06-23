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

const HSCode = require("../models/HScode"); // Assuming District model
const User = require("../models/User");
const Register = require("../models/register");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators

class HScodeController {
  constructor(hscodeService) {
    this.hscodeService = hscodeService; // Dependency Injection
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
        typelogin: user.typelogin,
        emailorphone: user.emailorphone,
      }; // Return both tokenkey and typelogin
    } catch (error) {
      throw new Error(
        "Database query failed while fetching user details by token key."
      );
    }
  }

  async getAllHScode(req, res, next) {
    try {
      console.log("show HScode");
      const { page, limit, tokenKey, searchtext } = req.query;
      // Fetch the Bank data
      const response = await this.hscodeService.getAllHScode({
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
      const userDetails = await HScodeController.fetchTokenKeyForUser(tokenKey);
      if (!userDetails) {
        return SendError400(res, "Invalid token key or user not found");
      }
      return SendSuccess(
        res,
        "HScode items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching HScode in Controller:", error);
      SendError(res, 500, "Internal Server Error", error);
    }
  }

  async getAllHScodebyCustomer(req, res, next) {
    try {
      console.log("show HScode for Customer");
      const { page, limit, tokenKey, searchtext } = req.query;
      // Fetch the Bank data
      const response = await this.hscodeService.getAllHScode({
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
      const userDetails = await HScodeController.fetchTokenKeyForCustomer(tokenKey);
      if (!userDetails) {
        return SendError400(res, "Invalid token key or user not found");
      }
      return SendSuccess(
        res,
        "HScode items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching HScode in Controller:", error);
      SendError(res, 500, "Internal Server Error", error);
    }
  }
  async updatehscodeactive(req, res, next) {
    try {
        const {tokenKey} = req.query;
        const {hsl3id, actives} = req.body;
        // Validate token
        const userData = await HScodeController.fetchTokenKeyForUser(tokenKey);
        if (!userData){
            return SendError400(res, "Invalid token key or user not found");
        }
        if (!hsl3id || !actives){
            return SendError400(res, "Missing required fields");
        }
        //this is update data
        const updatehscodeactive = await this.hscodeService.updatehscodeactive({
            hsl3id,
            actives,
        });
        return SendCreate(res, 200, "Update Data.", hsl3id);

    } catch (error) {
        console.error("Error update HScode in Controller:", error);
      SendError(res, 500, "Internal Server Error", error);
    }
  }
}
module.exports = HScodeController;
