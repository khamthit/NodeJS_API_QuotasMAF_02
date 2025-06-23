const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

const hscodel3 = require("../models/HScode");
const Quotas = require("../models/Quotas");


const RequestQuotas = sequelize.define(
  "RequestQuotas",
  {
    qtrid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
    },
    hsl3id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    qtid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    requestquot: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    capacity:{
        type: DataTypes.FLOAT,
        allowNull: false,
    }, 
    registercapital:{
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    governmentcommitment:{
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    imagename:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    statustype:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    statusapprove:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    approveby:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    levelapprove:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createby:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdate:{
        type: DataTypes.DATE,
        allowNull: false,
        get() {
        const rawValue = this.getDataValue("createdate");
        return rawValue ? moment(rawValue).format("YYYY-MM-DD HH:mm:ss") : null;
      },
    },
  },
  {timestamps: false, tableName: "tb_quotasdetails" }
);

RequestQuotas.belongsTo(hscodel3, {
  foreignKey: "hsl3id",
  as: "HSCodel3",
});

RequestQuotas.belongsTo(Quotas, {
  foreignKey: "qtid",
  as: "Quotas",
});

module.exports = RequestQuotas;
