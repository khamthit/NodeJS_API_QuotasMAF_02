const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path if your db.js is elsewhere

const District = sequelize.define(
  "District",
  {
    // Model attributes are defined here
    dstid: {
      type: DataTypes.INTEGER, // Use INTEGER for auto-incrementing primary key
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
    statustype: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "ADD", // Default value for status types
    },
    createby: {
      type: DataTypes.STRING,
      allowNull: false, // Assuming this is a string field for the creator's identifier
    },
    createdate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // Default to current date and time}
      // defaultValue: () => new Date(),
    },
  },
  {
    timestamps: false,
    tableName: "tb_district",
  }
);

module.exports = District;
