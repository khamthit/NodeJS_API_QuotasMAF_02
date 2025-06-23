const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

// const Employee = require("./Employee"); // Import CategoryApprove model for join table
// const Register = require("./Register"); // Import CategoryApprove model for join table
// const User = require("./User"); // Import CategoryApprove model for join table

const hscodel2 = require("../models/HSCodel2");

const HSCode = sequelize.define(
  "HSCode",
  {
    hsl3id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "hsl3id",
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
    l2code: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "l2code",
    },
    statustype: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "statustype",
    },
    actives: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "actives",
    },
  },
  { timestamps: false, tableName: "tb_hscodel3" }
);

HSCode.belongsTo(hscodel2, {
  foreignKey: "l2code",
  as: "HSCodel2",
});

module.exports = HSCode;
