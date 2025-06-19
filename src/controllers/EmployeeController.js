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

class EmployeeController {
  constructor(employeeService) {
    this.employeeService = employeeService; // Dependency Injection
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

  async newemployee(req, res, next) {
    console.log("new employee controller");
    try {
      const { tokenKey } = req.query;
      const {
        empcode,
        emailorphone,
        laname,
        lasurname,
        enname,
        ensurname,
        mobile1,
        mobile2,
        gid,
      } = req.body;
      if (
        !empcode ||
        !emailorphone ||
        !laname ||
        !lasurname ||
        !enname ||
        !ensurname ||
        !gid
      ) {
        return SendError400(res, "Missing required fields");
      }

      //this is check tokenkey
      const userData = await EmployeeController.fetchTokenKeyForUser(tokenKey);

      if (!userData) {
        return SendError400(res, 400, "Invalid token key or user not found");
      }
      // If we reach here, userData is valid, and userData.tokenkey equals tokenKey.

      //this is check data first
      const checkDataFirst = await this.employeeService.checkDataFirst(
        empcode,
        emailorphone,
        laname,
        lasurname,
        enname,
        ensurname
      );
      if (checkDataFirst) {
        return SendDuplicateData(res, 409, "Duplicate data.");
      }
      //this is save data
      const newdata = await this.employeeService.newemployee({
        empcode,
        emailorphone,
        laname,
        lasurname,
        enname,
        ensurname,
        mobile1,
        mobile2,
        createby: userData.emailorphone,
        gid,
      });

      //this is save log
      let newdatas =
        "create by: " +
        userData.emailorphone +
        ", empcode " +
        empcode +
        ", emailorphone " +
        emailorphone +
        ", laname " +
        laname +
        ", lasurname " +
        lasurname +
        ", enname " +
        enname +
        ", ensurname " +
        ensurname +
        ", gid " +
        gid;

      //this is save log
      const savelog = await this.employeeService.savelogsystem({
        form: "New Employee",
        newdata: newdatas,
        olddata: "",
        createby: userData.emailorphone,
      });

      let data = {
        empcode: empcode,
        emailorphone: emailorphone,
        laname: laname,
        lasurname: lasurname,
        enname: enname,
        ensurname: ensurname,
        gid: gid,
      };
      return SendCreate(res, 201, "Success", data);
    } catch (error) {
      console.log("Error message controller:", error);
      return SendError(
        res,
        500,
        "Internal Server Error in new employee controller",
        next
      );
    }
  }
  async getAllEmployee(req, res, next) {
    try {
      console.log("show All Employee");
      const { page, limit, tokenKey, searchtext, onlygender } = req.query;
      // Fetch the Bank data
      const response = await this.employeeService.getAllEmployee({
        page,
        limit,
        searchtext,
        onlygender,
      });

      // Ensure the response is valid and has the required properties
      if (!response || !response.items) {
        return SendError400(
          res,
          "Failed to fetch employee or invalid response format"
        );
      }

      let { items, totalItems, totalPages, currentPage } = response;
      const paginationData = {
        totalItems,
        totalPages,
        currentPage,
      };
      // Validate token
      const userDetails = await EmployeeController.fetchTokenKeyForUser(
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
        "Employee items retrieved successfully", // Corrected message
        items,
        paginationData
      );
    } catch (error) {
      console.error("Error fetching employee in Controller:", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }

  async updateemployee(req, res, next) {
    console.log("new employee controller");
    try {
      const { tokenKey } = req.query;
      const {
        empcode,
        emailorphone,
        laname,
        lasurname,
        enname,
        ensurname,
        mobile1,
        mobile2,
        gid,
        eid,
      } = req.body;
      if (
        !empcode ||
        !emailorphone ||
        !laname ||
        !lasurname ||
        !enname ||
        !ensurname ||
        !gid ||
        !eid
      ) {
        return SendError400(res, "Missing required fields");
      }

      //this is check tokenkey
      const userData = await EmployeeController.fetchTokenKeyForUser(tokenKey);

      if (!userData) {
        return SendError400(res, 400, "Invalid token key or user not found");
      }
      // If we reach here, userData is valid, and userData.tokenkey equals tokenKey.

      //this is check data first
      const checkDataFirst = await this.employeeService.checkDataFirst(
        empcode,
        emailorphone,
        laname,
        lasurname,
        enname,
        ensurname
      );
      if (checkDataFirst) {
        return SendDuplicateData(res, 409, "Duplicate data.");
      }

      //this is save data
      const updatedata = await this.employeeService.updateemployee({
        empcode,
        emailorphone,
        laname,
        lasurname,
        enname,
        ensurname,
        mobile1,
        mobile2,
        createby: userData.emailorphone,
        gid,
        eid,
      });

      //this is save log
      let newdatas =
        "create by: " +
        userData.emailorphone +
        ", empcode " +
        empcode +
        ", emailorphone " +
        emailorphone +
        ", laname " +
        laname +
        ", lasurname " +
        lasurname +
        ", enname " +
        enname +
        ", ensurname " +
        ensurname +
        ", gid " +
        gid;

      //this is save log
      const savelog = await this.employeeService.savelogsystem({
        form: "Update Employee",
        newdata: newdatas,
        olddata: "",
        createby: userData.emailorphone,
      });

      let data = {
        empcode: empcode,
        emailorphone: emailorphone,
        laname: laname,
        lasurname: lasurname,
        enname: enname,
        ensurname: ensurname,
        gid: gid,
      };
      return SendCreate(res, 201, "Success", data);
    } catch (error) {
      console.log("Error message controller:", error);
      return SendError(
        res,
        500,
        "Internal Server Error in update employee controller",
        next
      );
    }
  }

  async deleteemployee(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { eid } = req.body;
      if (!eid) {
        return SendError400(res, "Missing required fields");
      }
      //this is fect tokenkey
      const userData = await EmployeeController.fetchTokenKeyForUser(tokenKey);

      if (!userData) {
        return SendError400(res, 400, "Invalid token key or user not found");
      }
      // If we reach here, userData is valid, and userData.tokenkey equals tokenKey.
      console.log("User authorized. Proceeding with delete. User email/phone:", userData.emailorphone);

      //this is delete data
      const deletedata = await this.employeeService.deleteemployee(
        eid,
        userData.emailorphone
      );
      //this is save log
      let newdatas = "create by: " + userData.emailorphone + ", eid " + eid;
      const savelog = await this.employeeService.savelogsystem({
        form: "Update Employee",
        newdata: newdatas,
        olddata: "",
        createby: userData.emailorphone,
      });

      return SendCreate(res, 201, "Success");
    } catch (error) {
      return SendError(
        res,
        500,
        "Internal Server Error in update employee controller",
        next
      );
    }
  }
}
module.exports = EmployeeController;
