const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

// const Employee = require("./Employee"); // Import CategoryApprove model for join table
// const Register = require("./Register"); // Import CategoryApprove model for join table
// const User = require("./User"); // Import CategoryApprove model for join table
const HSCodel1 = require("../models/HSCodel1");

const HSCodel2 = sequelize.define(
  "HSCodel2",
  {
    hsl2id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "hsl2id",
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
    l1code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "l1code",
    },
    statustype: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "statustype",
    },
  },
  { timestamps: false, tableName: "tb_hscodel2" }
);

HSCodel2.belongsTo(HSCodel1, {
  foreignKey: "l1code",
  as: "HSCodel1",
});

module.exports = HSCodel2;
