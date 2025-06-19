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

class GroupApproveController {
  constructor(groupapproveService) {
    this.groupapproveService = groupapproveService; // Dependency Injection
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

  async newgroupapprove(req, res, next) {
    console.log("save new groupapprove");
    try {
      const { tokenKey } = req.query;
      const { capid, groupcode, groupname, levelapprove } = req.body;

      if (!capid || !groupcode || !groupname) {
        return SendError400(res, "Missing required fields");
      }
      //this is fect tokenkey
      const userDetail = await GroupApproveController.fetchTokenKeyForUser(
        tokenKey
      );
      if (!userDetail) {
        return SendError400(
          res,
          400,
          "Authorization failed: Invalid token key"
        );
      }
      //this is check data first
      const checkDataFirst = await this.groupapproveService.checkDataFirst(
        groupname,
        groupcode,
        capid
      );

      if (checkDataFirst) {
        return SendDuplicateData(res, 409, "Duplicate data.");
      }
      //this is save data
      const newdata = await this.groupapproveService.newgroupapprove({
        capid,
        groupcode,
        groupname,
        createby: userDetail.emailorphone,
        levelapprove
      });

      let newdatas =
        "create by: " +
        userDetail.emailorphone +
        ", groupname " +
        groupname +
        ", groupcode " +
        groupcode +
        ", capid " +
        capid;

      //this is save log
      const savelog = await this.groupapproveService.savelogsystem({
        form: "New GroupApprove",
        newdata: newdatas,
        olddata: "",
        createby: userDetail.emailorphone,
      });

      return SendSuccess(res, 200, "Success", groupname);
    } catch (error) {
      console.log("Error message controller:", error);
      return SendError(res, 500, "Internal Server Error", next);
    }
  }

  async updategroupapprove(req, res, next) {
    console.log("updategroupapprove");
    try {
        const {tokenKey} = req.query;
        const {capid, groupcode, groupname, gpaid, levelapprove} = req.body;

        //this is fectdata token
        const userData = await GroupApproveController.fetchTokenKeyForUser(tokenKey);
        if (!userData) {
            return SendError400(res, 400, "Invalid token key or user not found");
        }
        //this is check data first
        const checkdata = await this.groupapproveService.checkDataFirst(groupname, groupcode, capid);
        if (checkdata) {
            return SendDuplicateData(res, 404, "Duplicate data.");
        }
        //this is update data
        const update = await this.groupapproveService.updategroupapprove(capid, groupcode, groupname, gpaid, levelapprove);
        let newdatas = "update groupname: " + groupname + ", groupcode: " + groupcode + ", capid: " + capid + ", gpaid: " + gpaid; +", levelapprove :"+ levelapprove;
        const savelog = await this.groupapproveService.savelogsystem({
            form: "Update GroupApprove",
            newdata: newdatas,
            olddata: "",
            createby: userData.emailorphone,
        });
        return SendSuccess(res, 200, "Success", groupname);
    } catch (error) {
        console.log("Error message controller:", error);
      return SendError(res, 500, "Internal Server Error", next);
    }
  }
  async getAllGroupApprove(req, res, next) {
    try {
      console.log("show CategoryApprove");
      const { page, limit, tokenKey, searchtext, onlycapid } = req.query;
      // Fetch the Bank data
      const response = await this.groupapproveService.getAllGroupapprove({
        page,
        limit,
        searchtext,
        onlycapid,
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
      const userDetails = await GroupApproveController.fetchTokenKeyForUser(
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
        "GroupApproval items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching Categoryapprove in Controller:", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }
  async deletegroupapprove(req, res, next) {
    console.log("udeletegroupapprove");
    try {
        const {tokenKey} = req.query;
        const {gpaid} = req.body;

        //this is fectdata token
        const userData = await GroupApproveController.fetchTokenKeyForUser(tokenKey);
        if (!userData) {
            return SendError400(res, 400, "Invalid token key or user not found");
        }
        //this is update data
        const update = await this.groupapproveService.deletegroupapprove(gpaid);
        let newdatas = "gpaid: " + gpaid;
        const savelog = await this.groupapproveService.savelogsystem({
            form: "Delete GroupApprove",
            newdata: newdatas,
            olddata: "",
            createby: userData.emailorphone,
        });
        return SendSuccess(res, 200, "Success", gpaid);
    } catch (error) {
        console.log("Error message controller:", error);
      return SendError(res, 500, "Internal Server Error", next);
    }
  }
}
module.exports = GroupApproveController;
