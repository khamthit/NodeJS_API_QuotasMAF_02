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

const GroupApprove = require("../models/GroupApprove"); // Assuming District model
const User = require("../models/User");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const ApproveHistoryRegister = require("../models/ApproveHistoryRegister"); // Assuming User model
// const ApproveRegister = require("../models/ApproveRegister"); // Assuming User model
const CategoryApprove = require("../models/CategoryApprove"); // Assuming User
const EmployeeGroupApprove = require("../models/EmployeeGroupApproval");
const registerService = require("../services/RegisterService");
const vm_empgroupapprovalActive = require("../models/vm_empgroupapprovalActive");
const approveHistory = require("../services/ApproveHistoryRegisterService");


class ApproveHistoryRegisterController {
  constructor(approvehistoryregisterService) {
    this.approvehistoryregisterService = approvehistoryregisterService; // Dependency Injection
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

  async newapprovehistoryregister(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { rgstid, approveby, approvecomments, statusapprove } = req.body;
      console.log("Tokenkey :", tokenKey);
      //this is fect data tokenkey
      const userData =
        await ApproveHistoryRegisterController.fetchTokenKeyForUser(tokenKey);
      if (!userData) {
        return SendError(res, 400, "Not found your tokenkey");
      }
      console.log("userData :", userData);
      //this is save data
      const newdata =
        await this.approvehistoryregisterService.newapprovehistory({
          rgstid,
          approveby,
          approvecomments,
          statusapprove,
        });
      //this is save log
      let newdatas =
        "create by: " +
        userData.emailorphone +
        ", approveby " +
        approveby +
        ", approvecomments " +
        approvecomments +
        ", statusapprove " +
        statusapprove;
      //this is save log
      const savelog = await this.approvehistoryregisterService.savelogsystem({
        form: "New ApproveHistoryRegister",
        newdata: newdatas,
        olddata: "",
        createby: userData.emailorphone,
      });
      let datas = {rgstid, approveby, approvecomments, statusapprove};
      return SendCreate(res, 200, "Success.", datas);
    } catch (error) {
      console.log("Error new approvehistory in controller :", error);
      return SendError(res, 500, error.message);
    }
  }

  async getRegisterbyAdmin(req, res, next) {
    console.log("show ApprovehistoryRegister in controller");
    try {
      const { page, limit, tokenKey, searchtext } = req.query;
      //this is fect data tokenkey
      const userData = await ApproveHistoryRegisterController.fetchTokenKeyForUser(
        tokenKey
      );
       console.log("userData :", userData);
      if (!userData){
        return SendError(res, 400, "Not found your tokenkey");
      }
      
      //this is fect data in view vm_empgroupapprovalActive get only levelapprove by eid
      const emp_level_record = await vm_empgroupapprovalActive.findOne({ // Renamed for clarity
        attributes: ["levelapprove"],
        where: {
          eid: userData.eid,
          capid: 1,
        },
        order: [["egpid", "DESC"]],
      });

      // Add a check to ensure emp_level_record is found
      if (!emp_level_record) {
        return SendError(res, 404, "Employee approval level not found.");
      }

      const levelapprove = emp_level_record.levelapprove; // Use levelapprove as the key
      console.log("Levels :", levelapprove);
      // Fetch the register data
      const response = await this.approvehistoryregisterService.getRegisterAdminLevel({
        page,
        limit,
        searchtext, // Pass searchtext
        levelapprove, // Pass levelapprove instead of levels and tokenKey
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
      return SendSuccess(
        res,
        "Register retrieved successfully in Level approve : " +
          levelapprove,
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching Register in Controller:", error);
      next(error);
    }
  }
}
module.exports = ApproveHistoryRegisterController;
