const Bank = require("../models/Bank"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
// UserService will be imported if static logging is used, or this service handles its own logging
const UserService = require("./UserService"); // For static saveLogSystem
const { SendError, SendError400 } = require("../utils/response");
const sequelize = require("../config/db");

class BankService {
    async checkDataFirst(bankshortname, bankfullname) {
    try {
      const banks = await Bank.findOne({
        where: {
          bankshortname: bankshortname,
          bankfullname: bankfullname,          
          rectype: "ADD",
        },
      });
      return banks;
    } catch (error) {
      console.log("Error message Service :", error);
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
  async getBankAll({ page, limit, searchtext }) {
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      let whereClause = { rectype: "ADD" };

      if (searchtext && searchtext.trim() !== "") {
        // If searchtext is provided, combine it with the rectype filter using Op.and
        whereClause = {
          [Op.and]: [
            { rectype: "ADD" }, // Keep the rectype filter
            { // Add the search conditions
              [Op.or]: [
                { bankshortname: { [Op.iLike]: `%${searchtext}%` } },
                { bankfullname: { [Op.iLike]: `%${searchtext}%` } },
              ],
            }
          ]
        };
      }
      const { count, rows } = await Bank.findAndCountAll({
        where: whereClause,
        limit: pageLimit,
        offset: offset,
        order: [["bankshortname", "ASC"]], // Sorting as an example
      });
      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / pageLimit),
        currentPage: currentPage,
      };
    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error(`Failed to fetch BankService: ${error.message}`);
    }
  }

  async newBank (bankshortname, bankname){
    try {
        const result = await sequelize.query(
            `CALL pd_newBank(:bankshortname, :bankname)`,
            {
              replacements: { bankshortname, bankname },
              type: sequelize.QueryTypes.RAW,
            }
          );
          return result;
    } catch (error) {
        console.log("Error message Service :", error);
      throw new Error(`Failed to fetch BankService: ${error.message}`);
    }
  }

  async updateBank (bankshortname, bankname, bkid){
    try {
        const updateBank = await Bank.update({
            bankshortname: bankshortname,
            bankname: bankname
        }, {
            where: {
                bkid: bkid
            }
        });
        return updateBank;
    } catch (error) {
         console.log("Error message Service :", error);
      throw new Error(`Failed to fetch BankService: ${error.message}`);
    }
  }

  async deleteBank (bkid){
    try {
        const updateBank = await Bank.update({
            rectype: "DEL"
        }, {
            where: {
                bkid: bkid
            }
        });
        return updateBank;
    } catch (error) {
         console.log("Error message Service :", error);
      throw new Error(`Failed to fetch BankService: ${error.message}`);
    }
  }


}

module.exports = BankService;
