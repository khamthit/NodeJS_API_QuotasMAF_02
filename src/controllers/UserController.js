const express = require("express"); // Though not used in the current snippet, convert for consistency
const { Sequelize } = require("sequelize"); // Import Sequelize
const bcrypt = require("bcrypt");
const {
  SendCreate,
  SendSuccess,
  SendError400,
  SendError,
} = require("../utils/response");

// src/controllers/UserController.js
const User = require("../models/User"); // Assuming User model

class UserController {
  constructor(userService) {
    this.userService = userService; // Dependency Injection
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

  async getUsers(req, res, next) {
    try {
      const { page, limit, tokenKey } = req.query;
      const { items, totalItems, totalPages, currentPage } =
        await this.userService.getAllUsers({ page, limit });
      const paginationData = {
        totalItems,
        totalPages,
        currentPage,
      };
      // return SendSuccess(res, "Users retrieved successfully", items, paginationData);

      const userDetails = await UserController.fetchTokenKeyForUser(tokenKey);
      if (!userDetails) {
        return SendError400(res, "Invalid token key or user not found");
      }
      if (userDetails.tokenkey !== tokenKey
      ) {
        return SendError(
          res,
          400,
          "User type login does not match the provided type login"
        );
      }
      return SendSuccess(
        res,
        "Users retrieved successfully",
        items,
        paginationData
      ); // Note: SendSuccess in response.js doesn't expect a 5th arg for userDetails
    } catch (error) {
      next(error);
    }
  }
  async getloginUser(req, res, next) {
    try {
      const { emailorphone, passwords } = req.body; // Get credentials from request body
      if (!emailorphone || !passwords) {
        return SendError400(
          res, // SendError400 implies 400 status
          "Missing required fields: emailorphone or passwords"
        );
      }      
      const userData = await this.userService.loginUser2(
        emailorphone,
        passwords
      );

      if (userData.success === false) {
        return SendError(res, 401, userData.message); // 401 for unauthorized
      }
      console.log("Login successful :", userData);
      return SendSuccess(res, "Login successful.", userData)

    } catch (error) {
      console.error("Error in loginUser controller:", error.message);
      next(error); // Pass to global error handler
    }
  }

  async createUser(req, res, next) {
    try {
      const { tokenKey } = req.query; // For authorization/context
      const { userorphone, passwords, getTypeLogin } = req.body; // User data to create

      if (!userorphone || !passwords || !getTypeLogin) {
        return SendError400(
          res, // SendError400 implies 400 status
          "Missing required fields: userorphone, passwords, or getTypeLogin"
        );
      }
      const userDetails = await UserController.fetchTokenKeyForUser(tokenKey);
      if (
        !userDetails ||
        userDetails.tokenkey !== tokenKey
      ) {
        return SendError400(
          res,
          "Authorization failed: Invalid token key or type login mismatch."
        );
      }

      //this is check data first
      const userExists = await User.findOne({
        where: {
          emailorphone: userorphone,
          statustypes: "ADD", // Assuming 'statustypes' is a valid column in 'tb_userlogin'
        },
      });
      if (userExists) {
        return SendError400(res, "User already exists.");
      }
      // Use named placeholders for security
      const procedureQuery = `CALL pd_newsuerlogin(
            :get_emailorphone, 
            :get_passwords, 
            :get_typelogin, 
            :get_createby
        )`;

      //this is encrypt passwords before sending to the stored procedure
      const hashedPasswords = await bcrypt.hash(passwords, 10); // Hash the password with bcrypt
      const getpasswords = hashedPasswords; // Use the hashed password
      const [result] = await User.sequelize.query(procedureQuery, {
        replacements: {
          get_emailorphone: userorphone,
          get_passwords: getpasswords, // IMPORTANT: Ensure passwords are hashed before sending to DB or within SP
          get_typelogin: getTypeLogin,
          get_createby: userDetails.emailorphone, // Assuming tokenKey is used as createBy
        },
        type: Sequelize.QueryTypes.RAW, // Use Sequelize.QueryTypes
      });
      return SendCreate(
        res,
        201, // statuscode for the JSON body, 201 for created
        "User created successfully via stored procedure.",
        userorphone
      );
    } catch (error) {
      // console.error("Error in createUser:", error);
      if (error.original) {
        // Check for Sequelize's wrapped DB error
        return SendError(
          res,
          500,
          `Database error during user creation: ${error.original.message}`
        );
      }
      next(error);
    }
  }

  async updatePasswords(req, res, next) {
    const { tokenKey } = req.query; // Authorization context from query
    const { emailorphone, newPassword } = req.body; // Target user and new password from body
    try {
      if (!emailorphone || !newPassword) {
        return SendError400(
          res,
          "Missing required fields: emailorphone or newPassword in request body."
        );
      }
      // Authorize the action
      const userDetails = await UserController.fetchTokenKeyForUser(tokenKey);
      if (
        !userDetails ||
        userDetails.tokenkey !== tokenKey
      ) {
        return SendError400(
          res,
          "Authorization failed: Invalid token key or type login mismatch."
        );
      }
      // Call the service to update the password
      const updatedUser = await this.userService.updatePasswords(
        emailorphone,
        newPassword
      );

      if (!updatedUser) {
        return SendError(res, 404, "User not found or password update failed.");
      }
      // Exclude password from the response
      const { passwords: _, ...userResponseData } = updatedUser.get({
        plain: true,
      });
      return SendSuccess(res, "Password updated successfully.", {
        user: userResponseData,
      });
    } catch (error) {
      console.error(
        `Error in updatePasswords controller for ${emailorphone}:`,
        error.message
      );
      next(error);
    }
  }
  async updateUserLogin(req, res, next) {
    console.log("updateUserLogin called");
    const { tokenKey, typeLogin } = req.query; // Authorization context from query
    const { emailorphone, newTypeLogin } = req.body; // Target user and new type login from body
    try {
      if (!emailorphone || !newTypeLogin) {
        return SendError400(
          res,
          "Missing required fields: emailorphone or newTypeLogin in request body."
        );
      }
      // Authorize the action
      const userDetails = await UserController.fetchTokenKeyForUser(tokenKey);
      if (
        !userDetails ||
        userDetails.typelogin !== typeLogin ||
        userDetails.tokenkey !== tokenKey
      ) {
        return SendError400(
          res,
          "Authorization failed: Invalid token key or type login mismatch."
        );
      }
      // Call the service to update the user login type
      const updatedUser = await this.userService.updateUserLoginService(
        emailorphone,
        newTypeLogin
      );

      if (!updatedUser) {
        return SendError(res, 404, "User not found or update failed.");
      }
      const userData = updatedUser.get
        ? updatedUser.get({ plain: true })
        : updatedUser;
      // Exclude password and other sensitive fields from the response
      const { emailorphone: userEmailorPhone, typelogin: userTypeLogin } =
        userData;
      const userResponseData = {
        emailorphone: userEmailorPhone,
        typelogin: userTypeLogin,
      };

      return SendSuccess(res, "User login type updated successfully.", {
        user: userResponseData,
      });
    } catch (error) {
      console.error(
        `Error in updateUserLogin controller for ${emailorphone}:`,
        error.message
      );
      next(error);
    }
  }

  async deleteUserLogin(req, res, next) {
    const { tokenKey } = req.query; // Authorization context from query
    const { emailorphone } = req.body; // Target user from body
    try {
      if (!emailorphone) {
        return SendError400(
          res,
          "Missing required field: emailorphone in request body."
        );
      }
      // Authorize the action
      const userDetails = await UserController.fetchTokenKeyForUser(tokenKey);
      if (
        !userDetails ||
        userDetails.tokenkey !== tokenKey
      ) {
        return SendError400(
          res,
          "Authorization failed: Invalid token key or type login mismatch."
        );
      }
      // Call the service to delete the user login
      const deletedUser = await this.userService.deleteUserLoginSerivce(emailorphone, userDetails.emailorphone);
      if (!deletedUser) {
        return SendError(res, 404, "User not found or deletion failed.");
      }      
      return SendSuccess(res, "User login deleted successfully.", {deletedUser});
    } catch (error) {
      console.error(
        `Error in deleteUserLogin controller for ${emailorphone}:`,
        error.message
      );
      next(error);
    }
  }

  async updateUserLoginActive(req, res, next) {
    const { tokenKey, typeLogin } = req.query; // Authorization context from query
    const { emailorphone } = req.body; // Target user and new status from body
    try {
      if (!emailorphone) {
        return SendError400(
          res,
          "Missing required fields: emailorphone or newStatus in request body."
        );
      }
      // Authorize the action
      const userDetails = await UserController.fetchTokenKeyForUser(tokenKey);
      if (
        !userDetails ||
        userDetails.typelogin !== typeLogin ||
        userDetails.tokenkey !== tokenKey
      ) {
        return SendError400(
          res,
          "Authorization failed: Invalid token key or type login mismatch."
        );
      }
      // Call the service to update the user login status
      const updatedUser = await this.userService.updateUserLoginActiveService(
        emailorphone, userDetails.emailorphone
      );

      if (!updatedUser) {
        return SendError(res, 404, "User not found or update failed.");
      }
      
      return SendSuccess(res, "User login status updated successfully.", {
        user: updatedUser,
      });
    } catch (error) {
      console.error(
        `Error in updateUserLoginActive controller for ${emailorphone}:`,
        error.message
      );
      next(error);
    }
  }


}

module.exports = UserController;
