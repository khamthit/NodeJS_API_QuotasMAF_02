const express = require("express"); // Though not used in the current snippet, convert for consistency
const { Sequelize } = require("sequelize"); // Import Sequelize
const {
  SendCreate,
  SendSuccess,
  SendError400,
  SendError,
  SendDuplicateData,
  SendSuccessLogin,
} = require("../utils/response");

const User = require("../models/User");
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const Userlogin = require("../models/userlogin");

class UserloginController {
  constructor(userloginService) {
    this.userloginService = userloginService; // Dependency Injection
  }

  async Userlogin(req, res, next) {
    try {
      const { emails, passwords } = req.body;
      const readUser = await this.userloginService.Userlogin(emails, passwords);
      // console.log("ReadUser : : ", readUser.success);

      if (readUser.success === false) {
        return SendError400(
          res,
          "Your user and password is not match.",
          readUser
        );
      } else {
        return SendSuccessLogin(res, 200, readUser);
      }

      return SendSuccess(res, 200, "Login register successfully", readUser);
    } catch (error) {
      console.log("Userlogin Controller Error: ", error);
      return SendError(res, 500, "Failed to login register");
    }
  }
  async verifyEmail(req, res, next) {
    try {
      const { emails } = req.body;
      const readUser = await this.userloginService.verifyEmail(emails);
      console.log("ReadUser : : ", readUser.success);
      if (readUser.success === false) {
        return SendError400(res, "Your Emails is not match.", readUser);
      } else {
        return SendSuccessLogin(res, 200, readUser);
      }
    } catch (error) {
      console.log("Userlogin controller error: ", error);
      return SendError(res, 500, "Failed to verify email");
    }
  }

  async updatePassword(req, res, next) {
    try {
      const {emails, passwords} = req.body;
      const readUser = await this.userloginService.updatePassword(emails, passwords);
      console.log("ReadUser : : ", readUser.success);
      if (readUser.success === false) {
        return SendError400(res, "Your Emails is not match.", readUser);
      } else {
        return SendSuccessLogin(res, 200, readUser);
      }
    } catch (error) {
      console.log("UpdatePassowrd controller error :", error);
      return SendError(res, 500, "Failed to update password");
    }
  }
}

module.exports = UserloginController;
