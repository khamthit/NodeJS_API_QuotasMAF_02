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

const HSCodel3 = require("../models/HScode"); // Assuming District model
const User = require("../models/User");
const Register = require("../models/Register");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const EmployeeGroupApproval = require("../models/EmployeeGroupApproval");
const EmployeeGrouopApprovalService = require("../services/EmployeeGroupApprovalService");

class RequestQuotasAdminController {
  constructor(requestquotasService, EmployeeGrouopApprovalService) {
    this.requestquotasService = requestquotasService; // Dependency Injection
    this.EmployeeGrouopApprovalService = EmployeeGrouopApprovalService;
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

  async newrequestquotas(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const {
        hscode,
        requestquota,
        capacity,
        registercapital,
        governementcommitment,
        imagename,
      } = req.body;

      //check userdata
      const userData = await RequestQuotasController.fetchTokenKeyForCustomer(
        tokenKey
      );
      if (!userData) {
        return SendError400(res, "Invalid token key or user not found");
      }
      let createby = userData.businessid;
      const savedata = await this.requestquotasService.newrequestquotas({
        hscode,
        requestquota,
        capacity,
        registercapital,
        governementcommitment,
        imagename,
        createby,
      });
      //this is save log
      //this is save log
      let newdatas =
        "create by: " +
        createby +
        ", hscode " +
        hscode +
        ", requestquota " +
        requestquota +
        ", capacity " +
        capacity +
        ", registercapital " +
        registercapital +
        ", governementcommitment " +
        governementcommitment +
        ", imagename " +
        imagename;

      //this is save log
      const savelog = await this.requestquotasService.savelogsystem({
        form: "Add item request Quotas.",
        newdata: newdatas,
        olddata: "",
        createby: createby,
      });

      //this is return success
      return SendCreate(res, 200, "Created", newdatas);
    } catch (error) {
      console.error("Error new requestquotas in Controller:", error);
      SendError(res, 500, "Internal Server Error", error);
    }
  }

  async deleterequestquotas(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { qtrid } = req.body;
      //check userdata}
      const userData = await RequestQuotasController.fetchTokenKeyForCustomer(
        tokenKey
      );
      if (!userData) {
        return SendError400(res, "Invalid token key or user not found");
      }
      let createby = userData.businessid;
      const deletedata = await this.requestquotasService.deleterequestquotas({
        qtrid,
      });

      let newdatas = "Delete by: " + createby + ", qtrid " + qtrid;
      //this is save log
      const savelog = await this.requestquotasService.savelogsystem({
        form: "Delete item request Quotas.",
        newdata: newdatas,
        olddata: "",
        createby: createby,
      });

      return SendCreate(res, 200, "Deleted", newdatas);
    } catch (error) {
      console.error("Error delete requestquotas in Controller:", error);
      SendError(res, 500, "Internal Server Error", error);
    }
  }

  async getAllRequestQuotasAdmin(req, res, next) {
    try {
      console.log("show requestquotasAdmin");
      const { page, limit, tokenKey, searchtext, levels } = req.query;
      // Validate token
      const userDetails =
        await RequestQuotasAdminController.fetchTokenKeyForUser(tokenKey);
      if (!userDetails) {
        return SendError400(res, "Invalid token key or user not found");
      }
      //console.log("userDetails :", userDetails);
      let eid = userDetails.eid;
      let capid = 2; //because request Quotas should be capid = 2

      //this is fect data in employeegroupapprovalservice
      const getdata =
        await this.EmployeeGrouopApprovalService.getemployeegroupapprovalbylevelcategory(
          { capid, eid }
        );
      console.log("getdata :", getdata);

      if (!getdata || getdata.levelapprove === undefined) {
        console.log("Admin's approval level not found for this category.");
        return SendError400(
          res,
          "Admin's approval level not found for this category. Cannot filter requests."
        );
      }

      const adminApprovalLevel = getdata.levelapprove;
      console.log("Admin's approval level:", adminApprovalLevel);

      // Fetch the quotas data
      const response = await this.requestquotasService.getRequestQuotasAdmin({
        page,
        limit,
        searchtext,
        levels: adminApprovalLevel, // Use the fetched admin's approval level
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

      return SendSuccess(
        res,
        "RequestQuotasAdmin items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching requestquotas in Controller:", error);
      SendError(res, 500, "Internal Server Error", error);
    }
  }
  async approvequotas(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { qtrid, moreinfo, statusapprove } = req.body;
      //check userdata
      const userData = await RequestQuotasAdminController.fetchTokenKeyForUser(
        tokenKey
      );
      if (!userData) {
        return SendError400(res, "Invalid token key or user not found");
      }

      const approveby = userData.eid;
      //this is approve data
      const approve = await this.requestquotasService.approvequotas({
        qtrid,
        approveby: approveby,
        moreinfo,
        statusapprove,
      });

      //this is save log
       let newdatas = "Delete by: " + approveby + ", qtrid " + qtrid;
      //this is save log
      const savelog = await this.requestquotasService.savelogsystem({
        form: "Approve item request Quotas.",
        newdata: newdatas,
        olddata: "",
        createby: userData.emailorphone,
      });

      return SendCreate(res, 200, "Approved", newdatas);

      //this is approve data
    } catch (error) {
      console.error("Error fetching approve quotas in Controller:", error);
      SendError(res, 500, "Internal Server Error", error);
    }
  }
}
module.exports = RequestQuotasAdminController;
