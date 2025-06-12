// src/models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust path if your db.js is elsewhere

const User = sequelize.define('User', {
    // Model attributes are defined here
    emailorphone: {
        type: DataTypes.STRING,
        allowNull: false // In Sequelize, 'required: true' translates to 'allowNull: false'
    },
    typelogin: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        // validate: {
        //     isEmail: false // Optional: add email validation
        // }
        validate: {}
    },
    usid:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4, // Optional: Auto-generate UUIDs
        allowNull: false,
        primaryKey: true // Define usid as the primary key
    },

    tokenkey: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdate: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    passwords: {
        type: DataTypes.STRING,
        allowNull: false
    },
    statustypes: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'ADD' // Default value for status types
    },
    tokenkey: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    timestamps: false, 
    tableName: 'tb_userlogin'
});

module.exports = User;