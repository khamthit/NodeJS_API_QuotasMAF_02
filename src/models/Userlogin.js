// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust path if your db.js is elsewhere

const Userlogin = sequelize.define('Userlogin', {
    // Model attributes are defined here
    rgstid: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    emails: {
        type: DataTypes.STRING,
        allowNull: false // In Sequelize, 'required: true' translates to 'allowNull: false'
    },
    passwords: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tokenkey: {
        type: DataTypes.STRING,
        allowNull: false
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    mobiles:{
        type: DataTypes.STRING,
        allowNull: false
    },
    statustype: {
        type: DataTypes.STRING,
        allowNull: false
    },
    logingstatus: {
        type: DataTypes.STRING,
        allowNull: false
    },

}, {
    timestamps: false, 
    tableName: 'tb_register'
});

module.exports = Userlogin;