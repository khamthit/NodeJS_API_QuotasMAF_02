// d:\Project\NodeJS\QuotasMAF02\src\models\Bank.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Bank = sequelize.define('Bank', {
    bkid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: 'bkid' // Explicitly map to column name if different
    },
    bankshortname: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'bankshortname'
    },
    bankfullname: {
        type: DataTypes.STRING,
        allowNull: true, // Or false, depending on your schema
        field: 'bankfullname'
    },
    rectype: {
        type: DataTypes.STRING(10),
        allowNull: true,
        defaultValue: 'ADD',
        field: 'rectype'
    },
}, {
    tableName: 'tb_bank', // Explicitly set the table name
    timestamps: false, // Disable Sequelize's default timestamps if your table doesn't have createdAt/updatedAt
});

module.exports = Bank;
