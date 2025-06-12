const Province = require("../models/Province"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
// UserService will be imported if static logging is used, or this service handles its own logging
const UserService = require("./UserService"); // For static saveLogSystem
const { SendError, SendError400 } = require("../utils/response");

class AddressService {
  async getAllProvinces(options = {}) {
    try {
      const page = parseInt(options.page, 10) || 1;
      const limit = parseInt(options.limit, 10) || 10; // Default limit to 10
      const offset = (page - 1) * limit;
      const { searchtext } = options;

      let whereClause = { rectype: "ADD" }; // Default filter

      if (searchtext) {
        whereClause[Op.or] = [
          { prola: { [Op.iLike]: `%${searchtext}%` } }, // Case-insensitive search for Lao name
          { proen: { [Op.iLike]: `%${searchtext}%` } }, // Case-insensitive search for English name
        ];
      }

      const { count, rows } = await Province.findAndCountAll({
        limit,
        offset,
        where: whereClause, // Apply the where clause
        order: [["proen", "ASC"]], // Optional: Add default ordering
      });

      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw new Error("Failed to fetch provinces");
    }
  }

  async findeProvinceByNames(prola, proen) {
    try {
      const province = await Province.findOne({
        where: {
          prola: prola,
          proen: proen,
          rectype: "ADD", // Assuming you want to check for active provinces
        },
      });
      return province;
    } catch (error) {
      console.error("Error finding province by names:", error);
      throw new Error("Failed to find province by names");
    }
  }

  // Service method should accept data, not req/res
  async createProvince(provinceData, createBy) {
    // provinceData is expected to be an object like { prola: '...', proen: '...', rectype: '...' (optional) }
    // createBy is the identifier of the user performing the action, for logging
    const { prola, proen } = provinceData;
    const rectype = provinceData.rectype || "ADD"; // Default rectype if not provided
    try {
      const newProvince = await Province.create({
        prola,
        proen,
        rectype,
      });
      return newProvince; // Return the newly created province
    } catch (error) {
      console.error("[AddressService] Error creating province:", error.message);
      throw error; // Re-throw the original error or a new one wrapping it
    }
  }

  async updateProvince(provinceData) {
    try {
      const {prid, prola, proen } = provinceData;
      const [updateProvince] = await Province.update(
        {
          prola: provinceData.prola,
          proen: provinceData.proen,
        },
        {
          where: {
            prid: provinceData.prid, // Use the provided prid
          },
        }
      );
      return updateProvince;
    } catch (error) {
      throw error; // Re-throw the original error or a new one wrapping it
    }
  }

  async deleteProvince(provinceData){
    try {
      const {prid} = provinceData;
      const [deleteProvince] = await Province.update(
        {
          rectype: "DEL", // Assuming 'DEL' is the status for deleted provinces
        },
        {
          where: {
            prid: provinceData.prid, // Use the provided prid
          },
        }
      );
      return deleteProvince;
      
    } catch (error) {
      console.error("[AddressService] Error deleting province:", error.message);
      throw error; // Re-throw the original error or a new one wrapping it
      
    }
  }

}
module.exports = AddressService;
