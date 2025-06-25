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

class EmployeeGroupApprovalController {
  constructor(employeeGroupApprovalService) {
    this.employeeGroupApprovalService = employeeGroupApprovalService; // Dependency Injection
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

  async newemployeegroupapproval(req, res, next) {
    console.log("new employee group approval controller");
    try {
      const { tokenKey } = req.query;
      const { eid, gpaid, moreinfo } = req.body;
      if (!eid || !gpaid || !moreinfo) {
        return SendError400(res, "Missing required fields");
      }

      //this is check tokenkey
      const userData =
        await EmployeeGroupApprovalController.fetchTokenKeyForUser(tokenKey);

      if (!userData) {
        return SendError400(res, 400, "Invalid token key or user not found");
      }
      // If we reach here, userData is valid, and userData.tokenkey equals tokenKey.

      //this is check data first
      const checkDataFirst =
        await this.employeeGroupApprovalService.checkDataFirst(eid);
      if (checkDataFirst) {
        return SendDuplicateData(res, 409, "Duplicate data, an user can using only one group.");
      }
      //this is save data
      const newdata =
        await this.employeeGroupApprovalService.newemployeegroupapproval({
          eid,
          gpaid,
          moreinfo,
          createby: userData.emailorphone,
        });

      //this is save log
      let newdatas =
        "create by: " +
        userData.emailorphone +
        ", eid " +
        eid +
        ", gpaid " +
        gpaid +
        ", moreinfo " +
        moreinfo;

      //this is save log
      const savelog = await this.employeeGroupApprovalService.savelogsystem({
        form: "New EmployeeGroupApproval",
        newdata: newdatas,
        olddata: "",
        createby: userData.emailorphone,
      });

      const datas = { eid, gpaid, moreinfo, createby: userData.emailorphone };
      return SendSuccess(res, 200, "Success", datas);
    } catch (error) {
      console.log("Error message Controller :", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async getAllEmployeeGroupApproval(req, res, next) {
    try {
      console.log("show CategoryApprove");
      const { page, limit, tokenKey, searchtext, onlygroup } = req.query;
      // Fetch the Bank data
      const response =
        await this.employeeGroupApprovalService.getAllEmployeeGroupApproval({
          page,
          limit,
          searchtext,
          onlygroup,
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
      const userDetails =
        await EmployeeGroupApprovalController.fetchTokenKeyForUser(tokenKey);
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
        "EmployeeGroupApproval items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error(
        "Error fetching EmployeeGroupApproval in Controller:",
        error
      );
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async updateemployeegroupapproval(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { eid, gpaid, moreinfo, egpid } = req.body;
      if (!eid || !gpaid || !egpid) {
        return SendError400(res, "Missing required fields");
      }

      //this is check token
       const UserData =
        await EmployeeGroupApprovalController.fetchTokenKeyForUser(tokenKey);
      if (!UserData) {
        return SendError400(res, "Invalid token key or user not found");
      }
      //this is update data
      const update =
        await this.employeeGroupApprovalService.updateemployeegroupapprove({
          eid,
          gpaid,
          moreinfo,
          egpid,
        });

      //this is save log
      let newdatas =
        "update by: " +
        UserData.emailorphone +
        ", eid " +
        eid +
        ", gpaid " +
        gpaid +
        ", moreinfo " +
        moreinfo;

      //this is save log
      const savelog = await this.employeeGroupApprovalService.savelogsystem({
        form: "Update EmployeeGroupApproval",
        newdata: newdatas,
        olddata: "",
        createby: UserData.emailorphone,
      });

      const datas = { eid, gpaid, moreinfo, createby: UserData.emailorphone };
      return SendSuccess(res, 200, "Success", datas);
    } catch (error) {
      console.error("Error update EmployeeGroupApproval in Controller:", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async deleteemployeegroupapproval(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { egpid } = req.body;
      if (!egpid) {
        return SendError400(res, "Missing required fields");
      }

      //this is check token
       const UserData =
        await EmployeeGroupApprovalController.fetchTokenKeyForUser(tokenKey);
      if (!UserData) {
        return SendError400(res, "Invalid token key or user not found");
      }
      //this is update data
      const update =
        await this.employeeGroupApprovalService.deleteemployeegroupapprove({
          egpid
        });

      //this is save log
      let newdatas =
        "delete by: " +
        UserData.emailorphone +
        ", egpid " +
        egpid;       

      //this is save log
      const savelog = await this.employeeGroupApprovalService.savelogsystem({
        form: "Delete EmployeeGroupApproval",
        newdata: newdatas,
        olddata: "",
        createby: UserData.emailorphone,
      });

      const datas = { egpid, createby: UserData.emailorphone };
      return SendSuccess(res, 200, "Success", datas);
    } catch (error) {
      console.error("Error update EmployeeGroupApproval in Controller:", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }
}
module.exports = EmployeeGroupApprovalController;
