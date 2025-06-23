const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

// const Employee = require("./Employee"); // Import CategoryApprove model for join table
// const Register = require("./Register"); // Import CategoryApprove model for join table
// const User = require("./User"); // Import CategoryApprove model for join table

const HSCodel1 = sequelize.define(
  "HSCodel1",
  {
    hsl1id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "hsl1id",
    },
    codeen: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "codeen",
    },
    codela: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "codela",
    },
    statustype: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "statustype",
    },
  },
  {timestamps: false,
    tableName: "tb_hscodel1",});

module.exports = HSCodel1;