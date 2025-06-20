const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

const Employee = require("./Employee"); // Import CategoryApprove model for join table
const Register = require("./Register"); // Import CategoryApprove model for join table
const User = require("./User"); // Import CategoryApprove model for join table


const HistoryRegister = sequelize.define(
  "HistoryRegister",
  {
    ahid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "ahid",
    },
    approveby: {
      type: DataTypes.INTEGER, // Changed from STRING to INTEGER to match User.eid
      allowNull: false,
      field: "approveby",
    },
    approvecomments: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "approvecomments",
    },
    rgstid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "rgstid",
    },
    typeapprove: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "typeapprove",
    },
    statusapprove: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "statusapprove",
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
    createby: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "createby",
    },
    statustype: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "statustype",
    },
  },
  {
    timestamps: false,
    tableName: "tb_approvehistory",
  }
);

HistoryRegister.belongsTo(User, { foreignKey: 'approveby', targetKey: 'eid' })
HistoryRegister.belongsTo(Register, { foreignKey: 'rgstid', targetKey: 'rgstid' });

// Define association: HistoryRegister belongs to Register
module.exports = HistoryRegister;