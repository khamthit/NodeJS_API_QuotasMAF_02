const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path if your db.js is elsewhere

const vm_district = sequelize.define(
  "vm_district",
  {
    dstid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true, // Define dstid as the primary key
      autoIncrement: true, // Auto-increment for primary key
    },
    disla: {
      type: DataTypes.STRING,
      allowNull: false, // In Sequelize, 'required: true' translates to 'allowNull: false'
    },
    disen: {
      type: DataTypes.STRING,
      allowNull: false, // In Sequelize, 'required: true' translates to 'allowNull: false'
    },
    prid: {
      type: DataTypes.INTEGER,
      allowNull: false, // Foreign key to Province
      references: {
        model: "Province", // Name of the referenced model
        key: "prid", // Key in the referenced model
      },
    },
    prola: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ADD", // Default value for status types
    },
    proen: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ADD", // Default value for status types
    },
    createdate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Default to current date and time
    },
  },
  {
    timestamps: false,
    tableName: "vm_district",
  }
);

module.exports = vm_district;
