const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path if your db.js is elsewhere

const Register = sequelize.define(
  "Register",
  {
    // Model attributes are defined here
    rgstid: {
      type: DataTypes.UUID, // UUID type for the primary key
      defaultValue: DataTypes.UUIDV4, // Automatically generates UUIDv4
      primaryKey: true, // Define as primary key
    },
    typeregister: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    emails: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    firstname: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastname: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    mobiles: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    passwords: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    businessid: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    enterprise: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    laoenterprise: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    engenterprise: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    registerby: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    capitalregistration: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    investmenttype: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    registerationdate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    province: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    district: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    village: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taxinfo: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    taxregistration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    statustype: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    createby: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    createdate: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW, // Default to current date and time}
    },
    tokenkey: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    timestamps: false,
    tableName: "tb_register",
  }
);
module.exports = Register;
