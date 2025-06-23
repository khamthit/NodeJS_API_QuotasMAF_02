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
const Register = require("../models/register");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators

class RequestQuotasController {
  constructor(requestquotasService) {
    this.requestquotasService = requestquotasService; // Dependency Injection
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

  async getAllRequestQuotas(req, res, next) {
    try {
      console.log("show HScode");
      const { page, limit, tokenKey, searchtext } = req.query;
      // Validate token
      const userDetails = await RequestQuotasController.fetchTokenKeyForCustomer(tokenKey);
      if (!userDetails) {
        return SendError400(res, "Invalid token key or user not found");
      }
      let getbusinessid = userDetails.businessid;
    //   console.log("Getbusiness : ", userDetails.businessid);
      // Fetch the Bank data
      const response = await this.requestquotasService.getRequestQuotas({
        page,
        limit,
        searchtext,
        businessid: getbusinessid,
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
        "RequestQuotas items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching requestquotas in Controller:", error);
      SendError(res, 500, "Internal Server Error", error);
    }
  }

  async newrequestquotas(req, res, next) {
    try {
        const {tokenKey} = req.query;
        const {
            hscode,
            requestquota,
            capacity,
            registercapital,
            governementcommitment,
            imagename
          } = req.body;
        
        //check userdata
        const userData = await RequestQuotasController.fetchTokenKeyForCustomer(tokenKey);
        if (!userData){
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

  async deleterequestquotas (req, res, next){
    try {
        const {tokenKey} = req.query;
        const {qtrid} = req.body;
        //check userdata}
        const userData = await RequestQuotasController.fetchTokenKeyForCustomer(tokenKey);
        if (!userData){
            return SendError400(res, "Invalid token key or user not found");
        }
        let createby = userData.businessid;
        const deletedata = await this.requestquotasService.deleterequestquotas({
            qtrid,
        });

        let newdatas =
        "Delete by: " +
        createby +
        ", qtrid " +
        qtrid;
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
}
module.exports = RequestQuotasController;
