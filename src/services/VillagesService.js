const Village = require("../models/Villages"); // Assuming Village model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
// UserService will be imported if static logging is used, or this service handles its own logging
const sequelize = require("../config/db"); // Import the sequelize instance
const { SendError, SendError400 } = require("../utils/response");
const Vm_villages = require("../models/Vm_villages");

class VillageService {
  async checkDataFirst(villa, vilen, dstid) {
    try {
      const villages = await Village.findOne({
        where: {
          villa: villa,
          vilen: vilen,
          dstid: dstid,
          statustype: "ADD",
        },
      });
      return villages;
    } catch (error) {
        console.log("Error message Service :", error);
    }
  }

  async getAllVillage({ page, limit, searchtext }) {
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      let whereClause = {};
      if (searchtext && searchtext.trim() !== "") {
        whereClause = {
          [Op.or]: [
            { villa: { [Op.iLike]: `%${searchtext}%` } },
            { vilen: { [Op.iLike]: `%${searchtext}%` } },
            { roadname: { [Op.iLike]: `%${searchtext}%` } },
            { descriptions: { [Op.iLike]: `%${searchtext}%` } },
            { disen: { [Op.iLike]: `%${searchtext}%` } },
            { disla: { [Op.iLike]: `%${searchtext}%` } },
            { prola: { [Op.iLike]: `%${searchtext}%` } },
            { proen: { [Op.iLike]: `%${searchtext}%` } },
            // You might want to add disla, disen, prola, proen from Vm_villages if they are part of the view and searchable
          ],
        };
      }

      const { count, rows } = await Vm_villages.findAndCountAll({
        where: whereClause,
        limit: pageLimit,
        offset: offset,
        order: [["villa", "ASC"]], // Sorting as an example
      });
      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / pageLimit),
        currentPage: currentPage,
      };
    } catch (error) {
      console.error("Error fetching villages in Service:", error);
      // Re-throw the error so the controller can handle it
      throw new Error(`Failed to fetch villages: ${error.message}`);
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

  async createVillage(villageData) {
    try {
        const {villa, vilen, dstid, roadname, descriptions, createby } = villageData;
        const result = await sequelize.query(
            `CALL pd_createVillage(:villa, :vilen, :dstid, :roadname, :descriptions, :createby)`,
            {
              replacements: {
                villa,
                vilen,
                dstid,
                roadname,
                descriptions,
                createby,
              },
              type: sequelize.QueryTypes.RAW,
            }
          );
          return result;
    } catch (error) {
        console.log("Error message Service :", error);
    }
  }
}
module.exports = VillageService;
