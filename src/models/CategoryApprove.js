const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require('moment'); // Import moment.js for date formatting

const CategoryApprove = sequelize.define(
  "CategoryApprove",
  {
    capid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "capid",
    },
    catename: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "catename",
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
        const rawValue = this.getDataValue('createdate');
        return rawValue ? moment(rawValue).format('YYYY-MM-DD HH:mm:ss') : null;
      }
    },
  },
  {
    timestamps: false,
    tableName: "tb_categoryapproval",
  }
);

module.exports = CategoryApprove;
