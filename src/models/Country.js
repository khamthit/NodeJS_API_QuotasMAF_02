const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

const Country = sequelize.define(
  "Country",
  {
    countryid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "countryid",
    },
    region: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "region",
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "country",
    },
  },
  {
    timestamps: false,
    tableName: "tb_country",
  }
);

module.exports = Country;
