const express = require("express"); // Though not used in the current snippet, convert for consistency
const { Sequelize } = require("sequelize"); // Import Sequelize
const {
  SendCreate,
  SendSuccess,
  SendError400,
  SendError,
  SendDuplicateData,
} = require("../utils/response");

const Province = require("../models/Province"); // Assuming Province model
const District = require("../models/District"); // Assuming District model
const User = require("../models/User");

class AddressController {
  constructor(provinceService) {
    this.provinceService = provinceService; // Dependency Injection
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

  async getProvinces(req, res, next) {
    try {
      const { page, limit, tokenKey, searchtext } = req.query;
      const { items, totalItems, totalPages, currentPage } =
        await this.provinceService.getAllProvinces({ page, limit, searchtext });
      const paginationData = {
        totalItems,
        totalPages,
        currentPage,
      };
      // return SendSuccess(res, "Users retrieved successfully", items, paginationData);

      const userDetails = await AddressController.fetchTokenKeyForUser(
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
        "Province retrieved successfully",
        items,
        paginationData
      ); // Note: SendSuccess in response.js doesn't expect a 5th arg for userDetails
    } catch (error) {
      next(error);
    }
  }

  async createProvince(req, res, next) {
    try {
      console.log("Create Province");
      const { tokenKey } = req.query;
      const { prola, proen } = req.body; // Destructure the request body

      if (!prola || !proen) {
        return SendError400(res, "Missing required fields");
      }

      const userDetails = await AddressController.fetchTokenKeyForUser(
        tokenKey
      );
      if (!userDetails || userDetails.tokenkey !== tokenKey) {
        return SendError400(
          res,
          400,
          "Authorization failed: Invalid token key or type login mismatch."
        );
      }
      // this is check data first
      const provinceExists = await this.provinceService.findeProvinceByNames(
        prola,
        proen
      );

      if (provinceExists) {
        return SendDuplicateData(res, "Duplicate data.");
      }

      const newProvince = await this.provinceService.createProvince({
        prola,
        proen,
      });

      return SendCreate(res, 200, "Province created successfully", newProvince);
    } catch (error) {
      console.error("Error creating province:", error);
      if (error instanceof Sequelize.ValidationError) {
        return SendError400(res, "Validation error", error.errors);
      }
    }
  }

  async updateProvinces(req, res, next) {
    // Log the request body for debugging
    console.log("Update Province");
    try {
      const { tokenKey } = req.query; // Assuming provinceId is passed as a URL parameter
      const { prid, prola, proen } = req.body; // Destructure the request body

      if (!prola || !proen) {
        return SendError400(res, "Missing required fields");
      }

      const userDetails = await AddressController.fetchTokenKeyForUser(
        tokenKey
      );
      if (!userDetails || userDetails.tokenkey !== tokenKey) {
        return SendError400(
          res,
          400,
          "Authorization failed: Invalid token key or type login mismatch."
        );
      }
      const updatedProvinces = await this.provinceService.updateProvince({
        prid,
        prola,
        proen,
      });
      return SendSuccess(res, "Province updated successfully");
    } catch (error) {
      console.error("Error updating province:", error);
      if (error instanceof Sequelize.ValidationError) {
        return SendError400(res, "Validation error", error.errors);
      }
    }
  }

  async deleteProvince(req, res, next) {
    try {
      const { tokenKey } = req.query;
      const { prid } = req.body; // Assuming prid is passed in the request body

      if (!prid) {
        return SendError400(res, "Missing required fields");
      }

      const userDetails = await AddressController.fetchTokenKeyForUser(
        tokenKey
      );
      if (!userDetails || userDetails.tokenkey !== tokenKey) {
        return SendError400(
          res,
          400,
          "Authorization failed: Invalid token key or type login mismatch."
        );
      }

      const deletedProvince = await this.provinceService.deleteProvince({
        prid,
      });
      if (!deletedProvince) {
        return SendError(res, 404, "Province not found");
      }
      return SendSuccess(res, "Province deleted successfully");
    } catch (error) {
      console.error("Error deleting province:", error);
      if (error instanceof Sequelize.ValidationError) {
        return SendError400(res, "Validation error", error.errors);
      }
    }
  }

  async getDistricts(req, res, next) {
    console.log("Get Districts");
    try {
      const { page, limit, tokenKey, searchtext } = req.query;
      const { items, totalItems, totalPages, currentPage } =
        await this.districtService.getAllDistricts({ page, limit, searchtext });
      const paginationData = {
        totalItems,
        totalPages,
        currentPage,
      };
      const userDetails = await AddressController.fetchTokenKeyForUser(
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
        "Districts retrieved successfully",
        items,
        paginationData
      );
    } catch (error) {
      next(error);
    }
  }
}
module.exports = AddressController; // Export the controller class
