const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const GroupApprove = require("../models/GroupApprove"); // Assuming User model
const sequelize = require("../config/db");

const Employee = require("../models/Employee");
const Gender = require("../models/Gender");

class EmployeeService {
  async checkDataFirst(
    empcode,
    emailorphone,
    laname,
    lasurname,
    enname,
    ensurname
  ) {
    try {
      const groupapprove = await Employee.findOne({
        where: {
          empcode: empcode,
          emailorphone: emailorphone,
          laname: laname,
          lasurname: lasurname,
          enname: enname,
          ensurname: ensurname,
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

  async newemployee(getData) {
    try {
      const {
        empcode,
        emailorphone,
        laname,
        lasurname,
        enname,
        ensurname,
        mobile1,
        mobile2,
        createby,
        gid,
      } = getData;
      console.log("getData :", getData);
      const result = await sequelize.query(
        `CALL pd_newemployee(:empcode, :emailorphone, :laname, :lasurname, :enname, :ensurname, :mobile1, :mobile2, :createby, :gid)`,
        {
          replacements: {
            empcode,
            emailorphone,
            laname,
            lasurname,
            enname,
            ensurname,
            mobile1: mobile1 !== undefined ? mobile1 : "N/A",
            mobile2: mobile2 !== undefined ? mobile2 : "N/A",
            createby,
            gid,
          },
          type: sequelize.QueryTypes.RAW,
        }
      );
      return result;
    } catch (error) {
      console.log("Error message Service :", error);
      throw new Error(`Failed to fetch EmployeeService: ${error.message}`);
    }
  }

  async getAllEmployee({ page, limit, searchtext, onlygender }) {
    console.log("Showing all Employee");
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
                { empcode: { [Op.iLike]: `%${searchtext}%` } },
                { emailorphone: { [Op.iLike]: `%${searchtext}%` } },
                { laname: { [Op.iLike]: `%${searchtext}%` } },
                { lasurname: { [Op.iLike]: `%${searchtext}%` } },
                { enname: { [Op.iLike]: `%${searchtext}%` } },
                { ensurname: { [Op.iLike]: `%${searchtext}%` } },
                { mobile1: { [Op.iLike]: `%${searchtext}%` } },
                { mobile2: { [Op.iLike]: `%${searchtext}%` } },
              ],
            },
          ],
        };
      }
      //this is search only category approve's ID, when onlycapid != empty then system will showing data by capid's id.
      if (searchtext.trim() == "" && onlygender != "") {
        whereClause = {
          [Op.and]: [
            { statustype: "ADD" }, // Keep the rectype filter
            {
              // Add the search conditions
              [Op.or]: [{ gid: parseInt(onlygender, 10) }],
            },
          ],
        };
      }
      const { count, rows } = await Employee.findAndCountAll({
        where: whereClause,
        include: Gender, // Include the CategoryApprove model
        limit: pageLimit,
        offset: offset,
        order: [["empcode", "ASC"]], // Sorting as an example
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

  async updateemployee(updateData) {
    try {
      const {
        empcode,
        emailorphone,
        laname,
        lasurname,
        enname,
        ensurname,
        mobile1,
        mobile2,
        createby,
        gid,
        eid,
      } = updateData;

      //update data without procedure
      const result = await Employee.update(
        {
          empcode: empcode,
          emailorphone: emailorphone,
          laname: laname,
          lasurname: lasurname,
          enname: enname,
          ensurname: ensurname,
          mobile1: mobile1 !== undefined ? mobile1 : null, // Handle optional fields
          mobile2: mobile2 !== undefined ? mobile2 : null, // Handle optional fields
          createby: createby,
          gid: gid,
        },
        {
          where: {
            eid: eid,
          },
        }
      );
      return result;
    } catch (error) {
      console.log("Error message Service upate employee :", error);
      throw new Error(`Failed to update Employee: ${error.message}`);
    }
  }
  async deleteemployee(eid, createby) {
    try {
      ///delete data
      const deletedata = await Employee.update(
        {
          statustype: "DEL",
          createby: createby,
        },
        {
          where: {
            eid: eid,
          },
        }
      );
      return deletedata;
    } catch (error) {
      console.log("Error message delete employee Service :", error);
      return SendError(res, 500, "Internal Server Error");
    }
  }
}
module.exports = EmployeeService;
