const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const moment = require("moment"); // Import moment.js for date formatting

const Gender = require("../models/Gender");

const Employee = sequelize.define(
  "Employee",
  {
    eid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: "eid",
    },
    empcode: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "empcode",
    },
    emailorphone: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "emailorphone",
    },
    laname: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "laname",
    },
    lasurname: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "lasurname",
    },
    enname: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "enname",
    },
    ensurname: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "ensurname",
    },
    mobile1: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "mobile1",
    },
    mobile2: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "mobile2",
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
        const rawValue = this.getDataValue("createdate");
        return rawValue ? moment(rawValue).format("YYYY-MM-DD HH:mm:ss") : null;
      },
    },
    gid :{
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "gid",
    }
  },
  {
    timestamps: false,
    tableName: "tb_employee",
  }
);

//this is join table
Employee.belongsTo(Gender, { foreignKey: 'gid', targetKey: 'gid' });

module.exports = Employee;
