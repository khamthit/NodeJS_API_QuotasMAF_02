// d:\Project\NodeJS\QuotasMAF02\src\models\Bank.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Gender = sequelize.define('Gender', {
    gid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'gid' // Explicitly map to column name if different
    },
    genname: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'genname'
    },
    statustype: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'ADD',
        field: 'statustype'
    },
}, {
    tableName: 'tb_gender', // Explicitly set the table name
    timestamps: false, // Disable Sequelize's default timestamps if your table doesn't have createdAt/updatedAt
});

module.exports = Gender;
