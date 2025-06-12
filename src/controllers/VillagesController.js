const express = require("express"); // Though not used in the current snippet, convert for consistency
const { Sequelize } = require("sequelize"); // Import Sequelize
const {
  SendCreate,
  SendSuccess,
  SendError400,
  SendError,
  SendDuplicateData,
} = require("../utils/response");

const Village = require("../models/Villages"); // Assuming District model
const User = require("../models/User");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators

class VillageController {
  constructor(villageService) {
    this.villageService = villageService; // Dependency Injection
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
  async getAllVillages(req, res, next) {
    console.log("Show District:");
    try {
      const { page, limit, tokenKey, searchtext } = req.query;

      // Fetch the village data
      const response = await this.villageService.getAllVillage({
        page,
        limit,
        searchtext,
      });

      // Ensure the response is valid and has the required properties
      if (!response || !response.items) {
        return SendError400(
          res,
          "Failed to fetch villages or invalid response format"
        );
      }

      const { items, totalItems, totalPages, currentPage } = response;

      const paginationData = {
        totalItems,
        totalPages,
        currentPage,
      };
      // Validate token
      const userDetails = await VillageController.fetchTokenKeyForUser(
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
        "Villages retrieved successfully",
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching villages in Controller:", error);
      next(error);
    }
  }
  async newVillages(req, res, next) {
    try {
        const {tokenKey} = req.query;
        const {villa, vilen, dstid, roadname, descriptions} = req.body;
        if (!villa || !vilen || !dstid || !roadname || !descriptions) {
            return SendError400(res, "Missing required fields");
        }
        console.log("tokenkey :", tokenKey);

        const userDetails = await VillageController.fetchTokenKeyForUser(tokenKey);
        if (userDetails.tokenkey != tokenKey){
            return SendError400(res, 400, "Invalid token key or user not found");        
        }
        //this is check data
        const checkData = await this.villageService.checkDataFirst(villa, vilen, dstid);
        if (checkData){
            return SendDuplicateData(res, "Duplicate data");
        }
        //this is save data
        const savedata = await this.villageService.createVillage({
            villa,
            vilen,
            dstid,
            roadname,
            descriptions,
            createby: userDetails.emailorphone
        });
        //this is save log
        let form="Village - newVillages";
        let newdata = villa + " " + vilen + " " + dstid + " " + roadname + " " + descriptions;
        let olddata="";
        const savelog = await this.villageService.createLogSystem({
            form,
            newdata,
            olddata,
            createby: userDetails.emailorphone
        });
        return SendCreate(res, 200, "Villages created successfully");

        
    } catch (error) {
        return SendError(res, 500, error.message);
    }
  }
}

module.exports = VillageController;
