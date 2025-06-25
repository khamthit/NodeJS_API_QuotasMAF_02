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

class CountryCheckpointController {
  constructor(countrycheckpointService) {
    this.countrycheckpointService = countrycheckpointService; // Dependency Injection
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

  async getAllCountryCheckpoint(req, res, next) {
    try {
      console.log("show countrycheckpoint controller");
      const { page, limit, tokenKey, searchtext, countryid } = req.query;

      if (!page || !limit || !tokenKey) {
        return SendError400(res, 400, "Missing required parameters");
      }
      // Validate token first
      const userDetails =
        await CountryCheckpointController.fetchTokenKeyForUser(tokenKey);
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
      const response =
        await this.countrycheckpointService.getAllCountryCheckpoint({
          page,
          limit,
          searchtext, // Pass the correct variable name
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
      console.error("Error fetching History Register in Controller:", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async createCountryCheckpoint(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { countryid, locations } = req.body;
      if (!tokenKey || !countryid || !locations) {
        return SendError(res, 400, "Missing required parameters");
      }
      //this is userDetail
      const userDetail = await CountryCheckpointController.fetchTokenKeyForUser(
        tokenKey
      );
      if (!userDetail) {
        return SendError(res, 400, "Invalid token key or user not found");
      }
      //this is check data first
      const checkData = await this.countrycheckpointService.checkDataFirst(
        countryid,
        locations
      );
      if (checkData) {
        return SendDuplicateData(res, 409, "Duplicate Data.");
      }
      console.log("Check Data :", checkData);

      //this is save data
      const createdata =
        await this.countrycheckpointService.createCountryCheckpoint({
          countryid,
          locations,
          createby: userDetail.emailorphone,
        });

      //this is save log
      let newdatas =
        "create by: " +
        userDetail.emailorphone +
        ", countryid " +
        countryid +
        ", locations " +
        locations;
      //this is save log
      const savelog = await this.countrycheckpointService.savelogsystem({
        form: "New CountryCheckpoint",
        newdata: newdatas,
        olddata: "",
        createby: userDetail.emailorphone,
      });
      let datas = { countryid, locations };
      return SendCreate(res, 200, "Success.", datas);
    } catch (error) {
      console.error("Error add item countrycheckpoint in Controller:", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async updatecountrycheckpoint(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { ccid, countryid, locations } = req.body;
      if (!tokenKey || !ccid || !countryid || !locations) {
        return SendError(res, 400, "Missing required parameters");
      }
      //user data
      const userData = await CountryCheckpointController.fetchTokenKeyForUser(
        tokenKey
      );
      if (!userData) {
        return SendError(res, 400, "Invalid token key or user not found");
      }
      //this is check data first
      const checkdata = await this.countrycheckpointService.checkDataFirst(
        countryid,
        locations
      );
      if (checkdata) {
        return SendDuplicateData(res, 409, "Duplicate Data.");
      }
      const update =
        await this.countrycheckpointService.updatecountrycheckpoint({
          ccid,
          countryid,
          locations,
        });
      //this is save log
      let newdatas =
        "create by: " +
        userData.emailorphone +
        ", countryid " +
        countryid +
        ", locations " +
        locations +
        ", ccid " +
        ccid;
      //this is save log
      const savelog = await this.countrycheckpointService.savelogsystem({
        form: "Update CountryCheckpoint",
        newdata: newdatas,
        olddata: "",
        createby: userData.emailorphone,
      });
      let datas = { ccid, countryid, locations };
      return SendCreate(res, 200, "Success.", datas);
    } catch (error) {
      console.error(
        "Error Update item countrycheckpoint in Controller:",
        error
      );
      return SendError(res, 500, "Internal Server Error");
    }
  }
  async deletecountrycheckpoint(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { ccid} = req.body;
      if (!tokenKey || !ccid ) {
        return SendError(res, 400, "Missing required parameters");
      }
      //user data
      const userData = await CountryCheckpointController.fetchTokenKeyForUser(
        tokenKey
      );
      if (!userData) {
        return SendError(res, 400, "Invalid token key or user not found");
      }
      const deleteData = await this.countrycheckpointService.deletecountrycheckpoint({
          ccid
        });
      //this is save log
      let newdatas =
        "create by: " +
        userData.emailorphone +
        ", ccid " +
        ccid;

      //this is save log
      const savelog = await this.countrycheckpointService.savelogsystem({
        form: "Delete CountryCheckpoint",
        newdata: newdatas,
        olddata: "",
        createby: userData.emailorphone,
      });
      let datas = { ccid};
      return SendCreate(res, 200, "Success.", datas);
    } catch (error) {
      console.error(
        "Error Delete item countrycheckpoint in Controller:",
        error
      );
      return SendError(res, 500, "Internal Server Error");
    }
  }
}
module.exports = CountryCheckpointController;
