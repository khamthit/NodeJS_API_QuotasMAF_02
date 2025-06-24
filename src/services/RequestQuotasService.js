const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const sequelize = require("../config/db");
const Quotas = require("../models/Quotas"); // Assuming User model
const HSCodel3 = require("../models/HScode"); // Assuming User model
const RequestQuotas = require("../models/RequestQuotas"); // Assuming User model
const HSCodel2 = require("../models/HSCodel2"); // Assuming User model
const vm_empgroupapprovalactive = require("../models/vm_empgroupapprovalactive");

class RequestQuotasService {
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
      throw new Error("Failed to approve quotas log.");
    }
  }
  async getRequestQuotas({ page, limit, searchtext, businessid }) {
    console.log("Showing all RequestQuotas Services");
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      //   console.log("Business Id service :", businessid);
      // Start with an array of conditions for Op.and to allow combining filters
      const whereConditions = [{ statustype: "ADD" }];

      // Determine if searchtext is provided and not empty
      const hasSearchText =
        searchtext &&
        typeof searchtext === "string" &&
        searchtext.trim() !== "";

      // If searchtext is provided, apply the search like condition
      if (hasSearchText) {
        const searchPattern = `%${searchtext.trim()}%`;
        whereConditions.push({ imagename: { [Op.iLike]: searchPattern } });
      }

      // If businessid is provided, filter by createby (independent of searchtext)
      if (businessid) {
        whereConditions.push({ createby: businessid });
      }

      // Combine all conditions. If only one condition, it's just the object itself.
      const whereClause =
        whereConditions.length > 1
          ? { [Op.and]: whereConditions }
          : whereConditions[0];

      //console.log("Whereclause :", whereClause);
      const { count, rows } = await RequestQuotas.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ["requestquot"] }, // Exclude the non-existent column
        include: [
          {
            model: HSCodel3,
            as: "HSCodel3",
            include: [{ model: HSCodel2, as: "HSCodel2" }],
            required: false, // Use false if you want HistoryRegister even if no associated User
            duplicating: false,
          },
          // Merged the two include arrays into one
          {
            model: Quotas,
            as: "Quotas", // Corrected alias to match the model name
          },
        ],
        limit: pageLimit,
        offset: offset,
        order: [["qtrid", "asc"]], // Sorting as an example
      });
      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / pageLimit),
        currentPage: currentPage,
      };
    } catch (error) {
      console.error("Error message Service :", error); // Use console.error for errors
      throw new Error(`Failed to fetch HSCode Service: ${error.message}`);
    }
  }

  async getRequestQuotasAdmin({ page, limit, searchtext, levels }) {
    console.log("Showing all RequestQuotasAdmin Services");
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      //   console.log("Business Id service :", businessid);
      // Start with an array of conditions for Op.and to allow combining filters
      const whereConditions = [{ statustype: "ADD" }];

      // Determine if searchtext is provided and not empty
      const hasSearchText =
        searchtext &&
        typeof searchtext === "string" &&
        searchtext.trim() !== "";

      // If searchtext is provided, apply the search like condition
      if (hasSearchText) {
        const searchPattern = `%${searchtext.trim()}%`;
        whereConditions.push({ imagename: { [Op.iLike]: searchPattern } });
      }

      // If businessid is provided, filter by createby (independent of searchtext)
      if (levels) {
        whereConditions.push({ levelapprove: levels });
      }

      // Combine all conditions. If only one condition, it's just the object itself.
      const whereClause =
        whereConditions.length > 1
          ? { [Op.and]: whereConditions }
          : whereConditions[0];

      //console.log("Whereclause :", whereClause);
      const { count, rows } = await RequestQuotas.findAndCountAll({
        where: whereClause,
        attributes: { exclude: ["requestquot"] }, // Exclude the non-existent column
        include: [
          {
            model: HSCodel3,
            as: "HSCodel3",
            include: [{ model: HSCodel2, as: "HSCodel2" }],
            required: false, // Use false if you want HistoryRegister even if no associated User
            duplicating: false,
          },
          // Merged the two include arrays into one
          {
            model: Quotas,
            as: "Quotas", // Corrected alias to match the model name
          },
        ],
        limit: pageLimit,
        offset: offset,
        order: [["qtrid", "asc"]], // Sorting as an example
      });
      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / pageLimit),
        currentPage: currentPage,
      };
    } catch (error) {
      console.error("Error message Service :", error); // Use console.error for errors
      throw new Error(`Failed to fetch HSCode Service: ${error.message}`);
    }
  }

  async newrequestquotas(data) {
    try {
      const {
        hscode,
        requestquota,
        capacity,
        registercapital,
        governementcommitment,
        imagename,
        createby,
      } = data;
      //this is insert by procedure
      const result = await sequelize.query(
        `
        CALL pd_newrequestQuota(:hscode, :requestquota, :capacity, :registercapital, :governementcommitment, :imagename, :createby)
        `,
        {
          replacements: {
            hscode,
            requestquota,
            capacity,
            registercapital,
            governementcommitment,
            imagename,
            createby,
          },
          type: sequelize.QueryTypes.RAW,
        }
      );
      return result;
    } catch (error) {
      console.error("Error message Service :", error); // Use console.error for errors
      throw new Error("Failed to add item request quotas Service");
    }
  }

  async deleterequestquotas(data) {
    try {
        const {qtrid} = data;
        //delete data without procedure
        const deletedata = await RequestQuotas.update(
            {
                statustype: "DEL",
            },
            {
                where: {
                    qtrid: qtrid,
                },
            }
        );
        return deletedata;  
        
    } catch (error) {
        console.error("Error delete requestQuotas", error);
        throw new Error("Failed to delete requestQuotas");
    }
  }

  async approvequotas(data) {
    try {
        const { qtrid, approveby, moreinfo, statusapprove} = data;
        //approve data by procedure
        const approvequotas = await sequelize.query(
            `
            CALL pd_newapprovehistoryquotas(:qtrid, :approveby, :moreinfo, :statusapprove)
            `,
            {
                replacements: {
                    qtrid,
                    approveby,
                    moreinfo,
                    statusapprove,
                },
                type: sequelize.QueryTypes.RAW,
            }
        );
        return approvequotas

    } catch (error) {
      console.error("Error new approve Quotas", error);
        throw new Error("Failed to approve Quotas");
    }
  }
}
module.exports = RequestQuotasService;
