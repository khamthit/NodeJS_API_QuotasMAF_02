const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path if your db.js is elsewhere

const LogSystem = sequelize.define(
  "LogSystem",
  {
    // Model attributes are defined here
    lgsyid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Define usid as the primary key,
      autoIncrement: true, // Auto-increment for primary key
    },
    form: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    newdata: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    olddata: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    createby: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "tb_logsystem",
  }
);

module.exports = LogSystem;
