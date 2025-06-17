const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const CategoryApprove = require("../models/CategoryApprove"); // Assuming User model
const sequelize = require("../config/db");

class CategoryApproveService {
  async checkDataFirst(catename) {
    try {
      const categoryapprove = await CategoryApprove.findOne({
        where: {
          catename: catename,
          statustype: "ADD",
        },
      });
      return categoryapprove;
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
      throw new Error("Failed to create CategoryApprove log.");
    }
  }
  async newCategoryApprove(getData) {
    try {
      //if you using procedure, you should do coding like this on always.
      const { categoryapprove, createby } = getData;
      //this is call procedure
      const result = await sequelize.query(
        `CALL pd_newcategoryapprove(:categoryapprove, :createby)`,
        {
          replacements: { categoryapprove, createby },
          type: sequelize.QueryTypes.RAW,
        }
      );
      return result;
    } catch (error) {
      console.error("Error in newCategoryApprove Service:", error);
      //   throw error;
    }
  }

  async getAllCategoryApprove({ page, limit, searchtext }) {
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      let whereClause = { statustype: "ADD" };

      if (searchtext && searchtext.trim() !== "") {
        // If searchtext is provided, combine it with the rectype filter using Op.and
        whereClause = {
          [Op.and]: [
            { statustype: "ADD" }, // Keep the rectype filter
            { // Add the search conditions
              [Op.or]: [
                { catename: { [Op.iLike]: `%${searchtext}%` } },
              ],
            }
          ]
        };
      }
      const { count, rows } = await CategoryApprove.findAndCountAll({
        where: whereClause,
        limit: pageLimit,
        offset: offset,
        order: [["catename", "ASC"]], // Sorting as an example
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

  async updateCategoryApprove(catename, capid){
    try {
        const update = await CategoryApprove.update(
            {
                catename: catename,
            },
            {
                where: {
                    statustype: "ADD",
                    capid: capid,
                },
            }
        );
        return update;

    } catch (error) {
        console.log("Error message Service :", error);
        throw new Error(`Failed to update CategoryApprove: ${error.message}`);
    }
  }

  async deleteCategoryApprove(capid){
    try {
        const deletedata = await CategoryApprove.update(
            {
                statustype: "DEL",
            },
            {
                where: {
                    capid: capid,
                },
            });
            return deletedata;
    } catch (error) {
        console.log("Error message Service :", error);
        throw new Error("Failed to delete CategoryApprove");
    }
  }


}
module.exports = CategoryApproveService;
