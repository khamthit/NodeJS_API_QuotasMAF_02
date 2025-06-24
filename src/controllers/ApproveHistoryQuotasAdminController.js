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
const User = require("../models/User");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const ApproveHistoryQuotas = require("../models/ApproveHistoryQuotas"); // Assuming User model

class ApproveHistoryQuotasAdminController {
    constructor(approvehistoryquotasService) {
        this.approvehistoryquotasService = approvehistoryquotasService;
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

  async getapprovehistoryquotasadmin(req, res, next) {
    try {
      const {tokenKey} = req.query;
      const {qtrid} = req.body;
      if (!qtrid){
        return SendError(res, 400, "Not found qtrid");
      }
      //this is fecting data
      const userData = await ApproveHistoryQuotasAdminController.fetchTokenKeyForUser(tokenKey);
      if (!userData){
        return SendError(res, 400, "Not found your tokenkey");
      }
      //this is showing data
      const data = await this.approvehistoryquotasService.showdataapprovequotashistory({qtrid});
      if (!data){
        return SendError(res, 400, "Not found data");
      }else{
        return SendSuccess(res, "Success", data);
      }

    } catch (error) {
      console.log("Error approvehistoryquotasAdmin in controller", error);
      return SendError(res, 500, error.message);
    }
  }
}
module.exports = ApproveHistoryQuotasAdminController;