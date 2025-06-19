const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

const Gender = require("../models/Gender");
const Employee = require("../models/Employee");
const GroupApprove = require("../models/GroupApprove");


const EmployeeGroupApproval = sequelize.define(
  "EmployeeGroupApproval",
  {
    egpid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "egpid",
    },
    eid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "eid",
    },
    gpaid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "gpaid",
    },
    moreinfo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "moreinfo",
    },
    createby: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "createby",
    },
    createdate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "createdate",
      get() {
        const rawValue = this.getDataValue("createdate");
        return rawValue ? moment(rawValue).format("YYYY-MM-DD HH:mm:ss") : null;
      },
    },
    statustype: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: "statustype",
    },
  },
  {
    timestamps: false,
    tableName: "tb_empgroupapproval",
  }
);

EmployeeGroupApproval.belongsTo(Employee, {
  foreignKey: "eid",
  as: "employee",
});

EmployeeGroupApproval.belongsTo(GroupApprove, {
  foreignKey: "gpaid",
  as: "groupapprove",
});

module.exports = EmployeeGroupApproval;
