const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const GroupApprove = require("../models/GroupApprove"); // Assuming User model
const sequelize = require("../config/db");
const CategoryApprove = require("../models/CategoryApprove"); // Assuming User model
const ApproveHistoryRegister = require("../models/ApproveHistoryRegister"); // Assuming User model
// const ApproveRegister = require("../models/ApproveRegister"); // Assuming User model
const EmployeeGroupApprove = require("../models/EmployeeGroupApproval");
const Register = require("../models/Register");


class ApproveHistoryRegisterService {
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

  async newapprovehistory (getData){
    try {
        const {rgstid, approveby, approvecomments, statusapprove} = getData;
        const result = await sequelize.query(
          `CALL pd_newapprovehistoryRegister(:rgstid, :approveby, :approvecomments, :statusapprove)`,
          {
            replacements: { rgstid, approveby, approvecomments, statusapprove },
            type: sequelize.QueryTypes.RAW,
          }
        );
        return result;  
    } catch (error) {
        console.log("Error message Service new approvehistory :", error);
        throw new Error(`Failed to fetch New approveHistory Service: ${error.message}`);
    }
  }

  async getRegisterAdminLevel({ page, limit, searchtext, levelapprove }) {
     try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      // Base conditions that always apply
      const baseConditions = {
        levelapproval: levelapprove,
        statustype: { [Op.ne]: "ADD" }
      };

      let whereClause = baseConditions;

      if (searchtext && searchtext.trim() !== "") {
        const searchConditions = {
          [Op.or]: [
            { emails: { [Op.iLike]: `%${searchtext}%` } },
            { firstname: { [Op.iLike]: `%${searchtext}%` } },
            { lastname: { [Op.iLike]: `%${searchtext}%` } },
            { mobiles: { [Op.iLike]: `%${searchtext}%` } },
            { businessid: { [Op.iLike]: `%${searchtext}%` } },
            { engenterprise: { [Op.iLike]: `%${searchtext}%` } },
            { laoenterprise: { [Op.iLike]: `%${searchtext}%` } },
            { investmenttype: { [Op.iLike]: `%${searchtext}%` } },
            // You might want to add disla, disen, prola, proen from Vm_villages if they are part of the view and searchable
          ],
        };
        // Combine baseConditions with searchConditions using Op.and
        whereClause = {
          [Op.and]: [
            baseConditions,
            searchConditions
          ]
        };
      }
      // If no searchtext, whereClause remains baseConditions

      const { count, rows } = await Register.findAndCountAll({
        where: whereClause,
        limit: pageLimit,
        offset: offset,
        order: [["emails", "ASC"]], // Sorting as an example
      });
      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / pageLimit),
        currentPage: currentPage,
      };
    } catch (error) {
      console.error("Error fetching Register in Service:", error); // Corrected error message
      // Re-throw the error so the controller can handle it
      throw new Error(`Failed to fetch Register: ${error.message}`);
    }
  }


}
module.exports = ApproveHistoryRegisterService;
