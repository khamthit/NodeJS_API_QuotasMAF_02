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
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const Country = require("../models/Country"); // Assuming User model

class CountryController{
    constructor(countryService) {
        this.countryService = countryService;
    }

    async getAllCountry(req, res, next) {
        try {
            console.log("Show all country");
            const data = await this.countryService.showingdata();
            return SendSuccess(res, 200, "Country data retrieved successfully", data);
        } catch (error) {
            console.error("Error fetching country in Controller:", error);
            SendError(res, 500, "Internal Server Error", error);
        }
    }
}
module.exports = CountryController;


