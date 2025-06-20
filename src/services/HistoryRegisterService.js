const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const sequelize = require("../config/db");
const Employee = require("../models/Employee"); // Assuming User model
const Register = require("../models/Register"); // Assuming User model
const Gender = require("../models/Gender"); // Assuming User model
const HistoryRegister = require("../models/HistoryRegister"); // Assuming User model

class HistoryRegisterService {
  async getAllHistoryRegister({ page, limit, searchtext, rgstid }) {
    console.log("Showing all History Register");
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      let whereClause = {
        statustype: "ADD",
        rgstid: rgstid, // Add the approveby filter here
      };
      //this is search like
      if (searchtext && searchtext.trim() !== "" && rgstid != "") {
        const searchPattern = `%${searchtext}%`;
        // If searchtext is provided, combine it with the rectype filter using Op.and
        whereClause = {
          [Op.and]: [
            whereClause, // Keep existing statustype and approveby filters
            {
              // Add the search conditions
              [Op.or]: [
                { approvecomment: { [Op.iLike]: `%${searchPattern}%` } },
              ],
            },
          ],
        };
      }
      //this is search only category approve's ID, when onlycapid != empty then system will showing data by capid's id.
      if (searchtext.trim() == "" && rgstid != "") {
        whereClause = {
          [Op.and]: [
            { statustype: "ADD" }, // Keep the rectype filter
            {
              // Add the search conditions
              [Op.or]: [{ rgstid: parseInt(rgstid, 10) }],
            },
          ],
        };
      }
      const { count, rows } = await HistoryRegister.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: "User", // Corrected alias to match the model name
            include: [
              {
                model: Employee,
                required: false, // Use false if you want HistoryRegister even if no associated Employee
              },
            ],
            required: false, // Use false if you want HistoryRegister even if no associated User
            duplicating: false,
          },
          {
            model: Register,
            as: "Register", // Assuming the default alias is Register
            required: false,
          },
        ],
        limit: pageLimit,
        offset: offset,
        order: [["ahid", "desc"]], // Sorting as an example
      });
      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / pageLimit),
        currentPage: currentPage,
      };
    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error(
        `Failed to fetch History Register Service: ${error.message}`
      );
    }
  }
}
module.exports = HistoryRegisterService;
