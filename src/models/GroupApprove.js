const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

const CategoryApprove = require('./CategoryApprove'); // Import CategoryApprove model
const GroupApprove = sequelize.define(
  "GroupApprove",
  {
    gpaid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "gpaid",
    },
    capid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "capid",
    },
    groupcode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "groupcode",
    },
    groupname: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "groupname",
    },
    statustype: {
      type: DataTypes.STRING(10),
      allowNull: true,
      defaultValue: "ADD",
      field: "statustype",
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
  },
  {
    timestamps: false,
    tableName: "tb_groupapproval",
  }
);

// Define association: GroupApprove belongs to CategoryApprove
GroupApprove.belongsTo(CategoryApprove, { foreignKey: 'capid', targetKey: 'capid' });

module.exports = GroupApprove;