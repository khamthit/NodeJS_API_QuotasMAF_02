// src/app.js
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables FIRST

const express = require('express');
const sequelize = require('./config/db'); // This is the actual sequelize instance
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes'); // Assuming addressRoutes is for provinces
const districtRoutes = require('./routes/districtRoutes'); // Assuming districtRoutes is for districts
const villageRoutes = require('./routes/villageRoutes'); // Assuming villageRoutes is for villages

const errorHandler = require('./middleware/errorHandler');

const app = express();

// Function to establish and test database connection
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

initializeDatabase(); // Call the function to attempt DB connection when the app starts

// Middleware
app.use(express.json()); // Body parser

// Routes
app.use('/api/Users/getUsers', userRoutes);
app.use('/api/Users/createUser', userRoutes);
app.use('/api/Users', userRoutes);  //this is for login
app.use('/api/Users/updatePasswords', userRoutes);
app.use('/api/Users/updateUserLogin', userRoutes);
app.use('/api/Users/deleteUserLogin', userRoutes);
app.use('/api/Users/updateUserLoginActive', userRoutes);
//this is for province
app.use('/api/Address/getProvinces', addressRoutes); // Assuming addressRoutes is for provinces
app.use('/api/Address/newProvince', addressRoutes); // Assuming addressRoutes is for creating provinces
app.use('/api/Address/updateProvinces', addressRoutes); // Assuming addressRoutes is for updating provinces
app.use('/api/Address/deleteProvince', addressRoutes); // Assuming addressRoutes is for deleting provinces
//this is for district
app.use('/api/District/getDistricts', districtRoutes); // Assuming addressRoutes is for getting provinces
app.use('/api/District/newDistricts', districtRoutes); // Assuming addressRoutes is for creating provinces
app.use('/api/District/updateDistrict', districtRoutes);
app.use('/api/District/deleteDistrict', districtRoutes);
//this is for village
app.use('/api/Village/getVillages', villageRoutes);
app.use('/api/Village/newVillages', villageRoutes);




// Global Error Handler (must be the last middleware)
app.use(errorHandler);

module.exports = app;