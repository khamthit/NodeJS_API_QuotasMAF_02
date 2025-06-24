const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const sequelize = require("../config/db");

const EmployeeGroupApproval = require("../models/EmployeeGroupApproval");
const Gender = require("../models/Gender");
const GroupApprove = require("../models/GroupApprove");
const CategoryApprove = require("../models/CategoryApprove");
const Employee = require("../models/Employee");
const vm_empgroupapprovalactive = require("../models/vm_empgroupapprovalactive");



class EmployeeGroupApprovalService {
  async checkDataFirst(eid) {
    try {
      const groupapprove = await EmployeeGroupApproval.findOne({
        where: {
          eid: eid,
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

  async newemployeegroupapproval(datas){
    try {
        const { eid, gpaid, moreinfo, createby } = datas;
        console.log("datas :", datas);
        const result = await sequelize.query(
          `CALL pd_newempgroupapproval(:eid, :gpaid, :moreinfo, :createby)`,
          {
            replacements: {
              eid,
              gpaid,
              moreinfo,
              createby,
            },
            type: sequelize.QueryTypes.RAW,
          }
        );
        return result;    
    } catch (error) {
        console.log("Error message Service :", error);
        throw new Error(`Failed to fetch EmployeeGroupApprovalService: ${error.message}`);
    }
  }

  async getAllEmployeeGroupApproval({ page, limit, searchtext, onlygroup }) {
    console.log("Showing all EmployeeGroupApproval");
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      let whereClause = { statustype: "ADD" };
        //this is search like
      if (searchtext && searchtext.trim() !== "") {
        const searchPattern = `%${searchtext}%`; 
        // If searchtext is provided, combine it with the rectype filter using Op.and
        whereClause = {
            [Op.and]: [
              { statustype: "ADD" }, // Keep the rectype filter
              {
                // Add the search conditions
                [Op.or]: [
                  { moreinfo: { [Op.iLike]: `%${searchPattern }%` } },
                  { '$groupapprove.groupname$': { [Op.iLike]: searchPattern } },
                  { '$groupapprove.groupcode$': { [Op.iLike]: searchPattern } },
                  // Search in fields of the 'employee' (Employee model)
                  { '$employee.enname$': { [Op.iLike]: searchPattern } },
                  { '$employee.emailorphone$': { [Op.iLike]: searchPattern } },
                ],
              },
            ],
          };
      }
      //this is search only category approve's ID, when onlycapid != empty then system will showing data by capid's id.
      if (searchtext.trim() == "" && onlygroup != ""){
        whereClause = {
            [Op.and]: [
              { statustype: "ADD" }, // Keep the rectype filter
              {
                // Add the search conditions
                [Op.or]: [
                   { gpaid: parseInt(onlygroup, 10) }, 
                ],
              },
            ],
          };
      }
      const { count, rows } = await EmployeeGroupApproval.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: GroupApprove,
            as: "groupapprove", // Use the alias defined in the model
            include:[
              {model: CategoryApprove}
              ],
              required: false,
              duplicating: false,
          },{
            model: Employee,
            as: "employee", // Use the alias defined in the model
            include: [ // Nested include for Gender
              { model: Gender } // Include the Gender model (no 'as' needed if not defined in Employee model)
            ],
            required: false,
              duplicating: false,
          }], 
        limit: pageLimit,
        offset: offset,
        order: [["eid", "ASC"]], // Sorting as an example
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

  async updateemployeegroupapprove(getdata){
    try {
        const {eid, gpaid, moreinfo, egpid} = getdata;
        //this is update without procedure
        const update = await EmployeeGroupApproval.update(
          {
            eid: eid,
            gpaid: gpaid,
            moreinfo: moreinfo,
          },
          {
            where: {
              egpid: egpid,
            },
          }
        );
        return update;
      
    } catch (error) {
      console.log("Error message service update employeegroupapproval:", error);
      throw new Error("Internal Server Error");
    }
  }
  async deleteemployeegroupapprove(getdata){
    try {
        const {egpid} = getdata;
        //this is update without procedure
        const update = await EmployeeGroupApproval.update(
          {
            statustype: "DEL",
          },
          {
            where: {
              egpid: egpid,
            },
          }
        );
        return update;
      
    } catch (error) {
      console.log("Error message service update employeegroupapproval:", error);
      throw new Error("Internal Server Error");
    }
  }

  async getemployeegroupapprovalbylevelcategory(getdata) {
    try {
      const { eid, capid } = getdata;
      let whereClause = {
        capid: capid, 
        eid: eid,
      };
      //this is showing data
      const data = await vm_empgroupapprovalactive.findOne({
        where: whereClause,
      });
      console.log("Service admin :", data);
      return data;
    } catch (error) {
      console.error("Error fetching employee group approval by level category:", error);
      // Propagate a more informative error to help with debugging.
      throw new Error(`Failed to fetch employee group approval by level category: ${error.message}`);
    }
  }
}
module.exports = EmployeeGroupApprovalService;
