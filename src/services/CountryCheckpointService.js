const CountryCheckpoint = require("../models/CountryCheckpoint"); // Assuming District modelcl
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
// UserService will be imported if static logging is used, or this service handles its own logging
const sequelize = require("../config/db"); // Import the sequelize instance
const { SendError, SendError400 } = require("../utils/response");
const Country = require("../models/Country");

class CountryCheckpointService {
  async checkDataFirst(countryid, locations) {
    try {
      const countrycheckpoint = await CountryCheckpoint.findOne({
        where: {
          countryid: countryid,
          locations: locations,
          statustype: "ADD",
        },
      });
      return countrycheckpoint;
    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error("Failed to check data first.");
    }
  }
  async savelogsystem(logData) {
    const { form, newdata, olddata, createby } = logData;
    try {
      const result = await sequelize.query(
        `CALL pd_logsystem(:form, :newdata, :olddata, :createby)`,
        {
          replacements: {
            form, // Disla value to pass to the procedure
            newdata, // Disen value to pass to the procedure
            olddata, // Prid value to pass to the procedure
            createby,
          },
          type: sequelize.QueryTypes.RAW, // Use RAW query type
        }
      );
      return result; // Returning the result of the procedure
    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error("Failed to create CategoryApprove log.");
    }
  }
  async getAllCountryCheckpoint({ page, limit, searchtext, countryid }) {
    console.log("Showing all countrycheckpoint.");
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      let whereClause = {
        statustype: "ADD", // Add the approveby filter here
      };
      //this is search like
      if (searchtext && searchtext.trim() !== "" && countryid == "") {
        const searchPattern = `%${searchtext}%`;
        // If searchtext is provided, combine it with the rectype filter using Op.and
        whereClause = {
          [Op.and]: [
            whereClause, // Keep existing statustype and approveby filters
            {
              // Add the search conditions
              [Op.or]: [{ locations: { [Op.iLike]: `%${searchPattern}%` } }],
            },
          ],
        };
      }
      //this is search only category approve's ID, when onlycapid != empty then system will showing data by capid's id.
      if (searchtext.trim() == "" && countryid != "") {
        whereClause = {
          [Op.and]: [
            { statustype: "ADD" }, // Keep the rectype filter
            {
              // Add the search conditions
              [Op.or]: [{ countryid: parseInt(countryid, 10) }],
            },
          ],
        };
      }
      const { count, rows } = await CountryCheckpoint.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Country,
            as: "country", // Assuming the default alias is Register
            required: false,
          },
        ],
        limit: pageLimit,
        offset: offset,
        order: [["ccid", "asc"]], // Sorting as an example
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
        `Failed to fetch countrycheckpoint Service: ${error.message}`
      );
    }
  }

  async createCountryCheckpoint(data) {
    try {
      const { countryid, locations, createby } = data;
      //this is insert data by procedure
      const result = await sequelize.query(
        `CALL pd_newcountrycheckpoint(:countryid, :locations, :createby)`,
        {
          replacements: { countryid, locations, createby },
          type: sequelize.QueryTypes.RAW,
        }
      );
      return result;
    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error(
        `Failed to Add item countrycheckpoint Service: ${error.message}`
      );
    }
  }
  async updatecountrycheckpoint(data) {
    try {
        const {ccid, countryid, locations} = data;
        const update = await CountryCheckpoint.update(
            {
                countryid: countryid,
                locations: locations,
            },
            {
                where: {
                    ccid: ccid,
                },
            }
        );
        return update;

    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error(
        `Failed to update item countrycheckpoint Service: ${error.message}`
      );
    }
  }
  async deletecountrycheckpoint(data) {
    try {
        const {ccid} = data;
        const update = await CountryCheckpoint.update(
            {
                statustype: "DEL",
            },
            {
                where: {
                    ccid: ccid,
                },
            }
        );
        return update;

    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error(
        `Failed to update item countrycheckpoint Service: ${error.message}`
      );
    }
  }
}

module.exports = CountryCheckpointService;
