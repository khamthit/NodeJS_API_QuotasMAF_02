const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const RequestQuotas = require("../models/RequestQuotas"); // Assuming User model
const moment = require("moment"); // Import moment.js for date formatting

const ApproveHistoryQuotas = sequelize.define(
  "ApproveHistoryQuotas",
  {
    hqtrid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: "hqtrid",
    },
    qtrid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "qtrid",
    },
    approveby: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "approveby",
    },
    approvelevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "approvelevel",
    },

    senttolevel: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "senttolevel",
    },
    moreinfo: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "moreinfo",
    },
    statusapprove: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "statusapprove",
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
  { timestamps: false, tableName: "tb_approvehistoryquotas" }
);

ApproveHistoryQuotas.belongsTo(RequestQuotas, {
  foreignKey: "qtrid",
  as: "requestquotas",
});

module.exports = ApproveHistoryQuotas;
