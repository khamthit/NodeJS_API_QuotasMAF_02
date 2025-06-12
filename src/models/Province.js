const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust path if your db.js is elsewhere

const Province = sequelize.define('Province', {
    // Model attributes are defined here
    prid: {
        type: DataTypes.INTEGER,
        // defaultValue: sequelize.UUIDV4, // Optional: Auto-generate UUIDs
        allowNull: false,
        primaryKey: true, // Define usid as the primary key,
        autoIncrement: true // Auto-increment for primary key
    },
    prola: {
        type: DataTypes.STRING,
        allowNull: false // In Sequelize, 'required: true' translates to 'allowNull: false'
    },
    proen :{
        type: DataTypes.STRING,
        allowNull: false // In Sequelize, 'required: true' translates to 'allowNull: false'
    },
    rectype: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ADD' // Default value for status types
    },
},  {
    timestamps: false, 
    tableName: 'tb_province'
});
module.exports = Province;