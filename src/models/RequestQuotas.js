const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

const hscodel3 = require("../models/HScode");
const Quotas = require("../models/Quotas");
const Country = require("./Country");
const CountryCheckpoint = require("./CountryCheckpoint");


const RequestQuotas = sequelize.define(
  "requestquotas",
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
    requestquota: {
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
    typeweight:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    destinationcountry:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    countrycheckpoint:{
        type: DataTypes.INTEGER,
        allowNull: false,
    }
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

RequestQuotas.belongsTo(Country, {
  foreignKey: "destinationcountry",
  as: "country",
});

RequestQuotas.belongsTo(CountryCheckpoint, {
  foreignKey: "countrycheckpoint",
  as: "checkpoint", // Using a different alias to avoid conflict
});


module.exports = RequestQuotas;
