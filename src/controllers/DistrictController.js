const express = require("express"); // Though not used in the current snippet, convert for consistency
const { Sequelize } = require("sequelize"); // Import Sequelize
const {
  SendCreate,
  SendSuccess,
  SendError400,
  SendError,
  SendDuplicateData,
} = require("../utils/response");

const District = require("../models/District"); // Assuming District model
const User = require("../models/User");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators


class DistrictController {
  constructor(districtService) {
    this.districtService = districtService; // Dependency Injection
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
  async getAllDistrict(req, res, next) {
    console.log("Show District:");
    try {
      const { page, limit, tokenKey, searchtext } = req.query;
      const { items, totalItems, totalPages, currentPage } =
        await this.districtService.getAllDistrict({ page, limit, searchtext });
      const paginationData = {
        totalItems,
        totalPages,
        currentPage,
      };
      // return SendSuccess(res, "Users retrieved successfully", items, paginationData);

      const userDetails = await DistrictController.fetchTokenKeyForUser(
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
        "District retrieved successfully",
        items,
        paginationData
      ); // Note: SendSuccess in response.js doesn't expect a 5th arg for userDetails
    } catch (error) {
      console.error("Error fetching districts:", error);
      next(error);
    }
  }

  async newDistrict(req, res, next) {
    const { tokenKey } = req.query; // Authorization context from query
    const { disla, disen, prid } = req.body; // Target user and new password from body

    try {
        if (!disla || !disen || !prid) {
            return SendError400(res, "Missing required fields");
        };
        const userDetails = await DistrictController.fetchTokenKeyForUser(tokenKey);
        if (userDetails.tokenkey !== tokenKey) {
            return SendError(res, 400, "Authorization failed: Invalid token key or type login mismatch.");
        }
        
        const existingDistrict = await this.districtService.checkDataFirst(disla, disen, prid);
        if (existingDistrict) {
            return SendDuplicateData(res, "Duplicate Data.");
        }

        //this is save data
        const createDistrict = await this.districtService.createDistrict({
            disla,
            disen,
            prid,
            createby: userDetails.emailorphone
        }); 

        //this is save log
        let form="District";
        let newdata = disla + " " + disen + " "+ prid;
        let olddata="";
        const savelog = await this.districtService.createLogSystem({
            form,
            newdata,
            olddata,
            createby: userDetails.emailorphone
        });
        return SendCreate(res, 200, "District created successfully");


    } catch (error) {
        console.log("Error message :", error);
        return SendError(res, 500, "Internal Server Error");
    }
  }

  async updateDistrict(req, res, next) {
    try {
        const {tokenKey} = req.query;
        const {dstid, disla, disen, prid} = req.body;
        if (!dstid || !disla || !disen || !prid) {
            return SendError400(res, "Missing required fields");
        }
        //this is fect tokenkey
        const userDetail = await DistrictController.fetchTokenKeyForUser(tokenKey);
        if (userDetail.tokenkey != tokenKey){
            return SendError400(res, 400, "Authorization failed: Invalid token key");
        }
        const updateDistrict = await this.districtService.updateDistrict({
            dstid,
            disla,
            disen,
            prid,
            createby: userDetail.emailorphone
        });

        //this is get olddta
        const oldData = await District.findOne({
            where: {
                dstid: dstid
            }
        });
        //this is save log
        let form="District - Update";
        let newdata = disla + ", nameEn: " + disen + ", province id: " + String(prid);
        let olddata= "";
        const savelog = await this.districtService.createLogSystem({
            form,
            newdata,
            olddata,
            createby: userDetail.emailorphone
        });
        return SendSuccess(res, "District updated successfully");

    } catch (error) {
        return SendError(res, 500, "Internal Server Error");
    }
  }

  async deleteDistrict(req, res, next) {
    try {
        const {tokenKey} = req.query;
        const {dstid} = req.body;
        if (!dstid) {
            return SendError400(res, "Missing required fields");
        }
        //this is fect tokenkey
        const userDetail = await DistrictController.fetchTokenKeyForUser(tokenKey);
        if (userDetail.tokenkey != tokenKey){
            return SendError400(res, 400, "Authorization failed: Invalid token key");
        }
        const deleteDistrict = await this.districtService.deleteDistrict({
            dstid
        });

        //this is save log
        let form="District - Delete";
        let newdata = "District ID :"+ dstid;
        let olddata= "";
        const savelog = await this.districtService.createLogSystem({
            form,
            newdata,
            olddata,
            createby: userDetail.emailorphone
        });
        return SendSuccess(res, "District delete successfully");
        
        
    } catch (error) {   
        return SendError(res, 500, "Internal Server Error");
        
    }
  }


}
module.exports = DistrictController;
