const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const GroupApprove = require("../models/GroupApprove"); // Assuming User model
const sequelize = require("../config/db");

class CategoryApproveService {
  async checkDataFirst(groupname, groupcode, capid) {
    try {
      const groupapprove = await GroupApprove.findOne({
        where: {
          groupname: groupname,
          groupcode: groupcode,
          capid: capid,
          statustype: "ADD",
        },
      });
      return groupapprove;
    } catch (error) {
      console.log("Error message Service :", error);
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

  async newgroupapprove(getData) {
    try {
      const { capid, groupcode, groupname, createby } = getData;
      const result = await sequelize.query(
        `CALL pd_newgroupapproval(:capid, :groupcode, :groupname, :createby)`,
        {
          replacements: { capid, groupcode, groupname, createby },
          type: sequelize.QueryTypes.RAW,
        }
      );
      return result;
    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error(`Failed to fetch BankService: ${error.message}`);
    }
  }
  async updategroupapprove(capid, groupcode, groupname, gpaid) {
    try {
      const update = await GroupApprove.update(
        {
          groupname: groupname,
          groupcode: groupcode,
          capid: capid,
        },
        {
          where: {
            statustype: "ADD",
            gpaid: gpaid,
          },
        }
      );
      return update;
    } catch (error) {
      console.log("Error message Service : ", error);
      throw new Error(`Failed to fetch BankService: ${error.message}`);
    }
  }
  async getAllGroupapprove({ page, limit, searchtext, onlycapid }) {
    console.log("Showing all groupapprove");
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      let whereClause = { statustype: "ADD" };
        //this is search like
      if (searchtext && searchtext.trim() !== "") {
        // If searchtext is provided, combine it with the rectype filter using Op.and
        whereClause = {
            [Op.and]: [
              { statustype: "ADD" }, // Keep the rectype filter
              {
                // Add the search conditions
                [Op.or]: [
                  { groupcode: { [Op.iLike]: `%${searchtext}%` } },
                  { groupname: { [Op.iLike]: `%${searchtext}%` } },
                ],
              },
            ],
          };
      }
      //this is search only category approve's ID, when onlycapid != empty then system will showing data by capid's id.
      if (searchtext.trim() == "" && onlycapid != ""){
        whereClause = {
            [Op.and]: [
              { statustype: "ADD" }, // Keep the rectype filter
              {
                // Add the search conditions
                [Op.or]: [
                   { capid: parseInt(onlycapid, 10) }, 
                ],
              },
            ],
          };
      }

      

      const { count, rows } = await GroupApprove.findAndCountAll({
        where: whereClause,
        limit: pageLimit,
        offset: offset,
        order: [["groupcode", "ASC"]], // Sorting as an example
      });
      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / pageLimit),
        currentPage: currentPage,
      };
    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error(`Failed to fetch Groupapprove Service: ${error.message}`);
    }
  }

  async deletegroupapprove(gpaid) {
    try {
      const update = await GroupApprove.update(
        {
          statustype: "DEL",
        },
        {
          where: {
            gpaid: gpaid,
          },
        }
      );
      return update;
    } catch (error) {
      console.log("Error message Service : ", error);
      throw new Error(`Failed to fetch BankService: ${error.message}`);
    }
  }
}
module.exports = CategoryApproveService;
