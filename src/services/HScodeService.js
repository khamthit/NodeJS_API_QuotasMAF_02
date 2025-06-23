const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const sequelize = require("../config/db");
const HSCodel2 = require("../models/HSCodel2"); // Assuming User model
const HSCodel1 = require("../models/HSCodel1"); // Assuming User model
const HSCode = require("../models/HScode");


class HScodeService{
async getAllHScode({ page, limit, searchtext }) {
    console.log("Showing all HScode");
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      let whereClause = {
        statustype: "ADD",
        actives: "Y"// Add the approveby filter here
      };
      //this is search like
      if (searchtext && searchtext.trim() !== "") {
        const searchPattern = `%${searchtext}%`;
        // If searchtext is provided, combine it with the rectype filter using Op.and
        whereClause = {
          [Op.and]: [
            whereClause, // Keep existing statustype and approveby filters
            {
              // Add the search conditions
              [Op.or]: [
                { codeen: { [Op.iLike]: `%${searchPattern}%` } },
                { codela: { [Op.iLike]: `%${searchPattern}%` } },
                { l2code: { [Op.iLike]: `%${searchPattern}%` } },
              ],
            },
          ],
        };
      }
      //this is search only category approve's ID, when onlycapid != empty then system will showing data by capid's id.
      if (searchtext.trim() == "") {
        whereClause = {
          [Op.and]: [
            { statustype: "ADD" }, // Keep the rectype filter
            { actives: "Y" },
          ],
        };
      }
      const { count, rows } = await HSCode.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: HSCodel2,
            as: "HSCodel2", // Corrected alias to match the model name
            include: [
              {
                model: HSCodel1,
                as: "HSCodel1", // Corrected alias to match the model name"
                required: false, // Use false if you want HistoryRegister even if no associated Employee
              },
            ],
            required: false, // Use false if you want HistoryRegister even if no associated User
            duplicating: false,
          },          
        ],
        limit: pageLimit,
        offset: offset,
        order: [["hsl3id", "asc"]], // Sorting as an example
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
        `Failed to fetch HSCode Service: ${error.message}`
      );
    }
  }
  async updatehscodeactive(dataAdd){
    try {
        const {hsl3id, actives} = dataAdd;
        const udpate = await HSCode.update(
            {
                actives: actives,
            },
            {
                where: {
                    hsl3id: hsl3id,
                },
            }
        );
        return udpate;

    } catch (error) {
        console.log("Error message Service :", error);
        throw new Error(
          `Failed to update HSCode Service: ${error.message}`
        );
    }
  }
}
module.exports = HScodeService;