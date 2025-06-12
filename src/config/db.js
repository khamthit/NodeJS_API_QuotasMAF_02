const { Sequelize } = require('sequelize');
// For instance, it might be:
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres' // <-- ADD THIS LINE
    // Make sure to replace 'your_database_dialect' with your actual dialect
    // e.g., 'mysql', 'postgres', 'sqlite', 'mariadb', 'mssql'
});
module.exports = sequelize;
