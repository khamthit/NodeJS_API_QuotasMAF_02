const District = require("../models/District"); // Assuming District modelcl
const vm_district = require("../models/Vm_district"); // Assuming vm_district model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
// UserService will be imported if static logging is used, or this service handles its own logging
const sequelize = require("../config/db"); // Import the sequelize instance
const UserService = require("./UserService"); // For static saveLogSystem
const { SendError, SendError400 } = require("../utils/response");

class DistrictService {
  async getAllDistrict(options = {}) {
    try {
      const page = parseInt(options.page, 10) || 1;
      const limit = parseInt(options.limit, 10) || 10; // Default limit to 10
      const offset = (page - 1) * limit;
      const { searchtext } = options;

      let whereClause = {}; // Default filter

      if (searchtext) {
        whereClause[Op.or] = [
          { disla: { [Op.iLike]: `%${searchtext}%` } }, // Case-insensitive search for Lao name
          { disen: { [Op.iLike]: `%${searchtext}%` } }, // Case-insensitive search for English name
          { prola: { [Op.iLike]: `%${searchtext}%` } }, // Case-insensitive search for English name
          { proen: { [Op.iLike]: `%${searchtext}%` } }, // Case-insensitive search for English name
        ];
      }
      const { count, rows } = await vm_district.findAndCountAll({
        limit,
        offset,
        where: whereClause, // Apply the where clause
        order: [["disen", "ASC"]], // Optional: Add default ordering
      });

      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      };
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw new Error("Failed to fetch districts");
    }
  }

  async checkDataFirst(disla, disen, prid) {
    try {
      const district = await District.findOne({
        where: {
          disla: disla,
          disen: disen,
          prid: prid,
          statustype: "ADD",
        },
      });
      return district;
    } catch (error) {}
  }

  async createDistrict(districtData) {
    const { disla, disen, prid, createby } = districtData;
    try {
      const result = await sequelize.query(
        `CALL pd_createDistrict(:disla, :disen, :prid, :createby)`,
        {
          replacements: {
            disla, // Disla value to pass to the procedure
            disen, // Disen value to pass to the procedure
            prid, // Prid value to pass to the procedure
            createby,
          },
          type: sequelize.QueryTypes.RAW, // Use RAW query type
        }
      );
      return result; // Returning the result of the procedure
    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error("Failed to create district");
    }
  }

  async createLogSystem(logData) {
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
      throw new Error("Failed to create district");
    }
  }

  async updateDistrict(districtData) {
    const { dstid, disla, disen, prid, createby } = districtData;
    try {
      const updateData = await District.update(
        {
          disla: disla,
          disen: disen,
          prid: prid,
          createby: createby,
        },
        {
          where: {
            dstid: dstid,
          },
        }
      );
      return updateData;
    } catch (error) {
      console.log("Showing Error: ", error);
      throw new Error("Failed to update district");
    }
  }

  async deleteDistrict(districtData) {
    try {
      const { dstid } = districtData;
      const deleteData = await District.update(
        {
          statustype: "DEL",
        },
        {
          where: {
            dstid: dstid,
          },
        }
      );
      return deleteData;
    } catch (error) {
      console.log("Showing Error: ", error);
      throw new Error("Failed to delete district");
    }
  }
}
module.exports = DistrictService;
