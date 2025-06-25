const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting
const Country = require("./Country");

const CountryCheckpoint = sequelize.define(
  "countrycheckpoint",
  {
    ccid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "ccid",
    },
    countryid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "countryid",
    },
    locations: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "locations",
    },
    statustype: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "statustype",
    },
    createby: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "createby",
    },
    createdate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "createdate",
      get() {
        const rawValue = this.getDataValue("createdate");
        return rawValue ? moment(rawValue).format("YYYY-MM-DD HH:mm:ss") : null;
      },
    },
  },
  {
    timestamps: false,
    tableName: "tb_countrycheckpoint",
  }
);
CountryCheckpoint.belongsTo(Country, {
  foreignKey: "countryid",
  as: "country",
});
module.exports = CountryCheckpoint;
