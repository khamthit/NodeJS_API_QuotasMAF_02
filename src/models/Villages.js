const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path if your db.js is elsewhere

const Village = sequelize.define("villages", {
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
  roadname:{
    type: DataTypes.STRING,
    allowNull: false,
  }, 
  descriptions:{
    type: DataTypes.STRING,
    allowNull: false,
  }, 
  createby: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  statustype: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "ADD",
  },
  createdate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
  tableName: "tb_villages",
});
module.exports = Village;
