const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path if your db.js is elsewhere

const vm_villages = sequelize.define(
  "Vm_villages",
  {
    vlid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    villa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    vilen: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dstid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    roadname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descriptions: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    disla: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ADD",
    },
    disen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    prid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    prola: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    proen: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "vm_villages",  ///always table name should be lowwer character.
  }
);
module.exports = vm_villages;
