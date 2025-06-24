const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const sequelize = require("../config/db");
const Quotas = require("../models/Quotas"); // Assuming User model
const RequestQuotas = require("../models/RequestQuotas"); // Assuming User model
const ApproveHistoryQuotas = require("../models/ApproveHistoryQuotas"); // Assuming User model



class ApproveHistoryQuotasService {
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
      throw new Error("Failed to create log system log.");
    }
  }

  async showdataapprovequotashistory (getdata){
    try {
      const {qtrid} = getdata;
      //showing data without procedure
      const result = await ApproveHistoryQuotas.findAll({
        where: {
          qtrid: qtrid,
        },
        order: [['hqtrid', 'DESC']], // Order by createdate in descending order
        include: [
          {
            model: RequestQuotas, // Include the HSCode model
            as: "requestquotas", // Corrected alias to match the model definition
            required: false, // Use false if you want HistoryRegister even if no associated User
            duplicating: false,
          },          
        ],
      });
      return result;      
    } catch (error) {
      console.error("Error message Service :", error);
      throw new Error(`Failed to show approvequotashistory: ${error.message}`);
    }
  }
   
}
module.exports = ApproveHistoryQuotasService;