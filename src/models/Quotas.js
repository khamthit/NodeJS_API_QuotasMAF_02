const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

const Quotas = sequelize.define(
  "Quotas",
  {
    qtid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    qno: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createby: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdate: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        const rawValue = this.getDataValue("createdate");
        return rawValue ? moment(rawValue).format("YYYY-MM-DD HH:mm:ss") : null;
      },
    },
  },
  { timestamps: false, tableName: "tb_quotas" }
);
module.exports = Quotas;
