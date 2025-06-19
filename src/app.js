// src/app.js
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables FIRST

const express = require('express');
const sequelize = require('./config/db'); // This is the actual sequelize instance
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes'); // Assuming addressRoutes is for provinces
const districtRoutes = require('./routes/districtRoutes'); // Assuming districtRoutes is for districts
const villageRoutes = require('./routes/villageRoutes'); // Assuming villageRoutes is for villages
const registerRoutes = require('./routes/registerRoutes'); // Assuming registerRoutes is for villages
const registerlicenseRoutes = require('./routes/registerlicenseRoutes'); // Assuming registerRoutes is for villages
const bankRoutes = require('./routes/bankRoute'); // Assuming registerRoutes is for bank
const userloginRoutes = require('./routes/userloginRoutes'); // Assuming registerRoutes is for bank
const categoryapproveRoutes = require('./routes/categoryapproveRoutes'); // Assuming registerRoutes is for bank
const groupapproveRoutes = require('./routes/gropuapproveRoutes'); // Assuming registerRoutes is for bank
const employeeRoutes = require('./routes/employeeRoutes'); // Assuming registerRoutes is for employee
const employeegroupapprovalRoutes = require('./routes/employeegroupapprovalRoutes'); // Assuming registerRoutes is for employee groupapproval

const errorHandler = require('./middleware/errorHandler');

const multer = require('multer');
const path = require('path');
// const RegisterController = require('./controllers/RegisterController');

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
app.use('/api/Village/updateVillages', villageRoutes);
app.use('/api/Village/deleteVillages', villageRoutes);
//this is for register
app.use('/api/Register/getRegister', registerRoutes);
app.use('/api/Register/newRegister', registerRoutes);
app.use('/api/Register/verifyOTP', registerRoutes);
app.use('/api/Register/addGeneralInfo', registerRoutes);
//this is for register license
app.use('/api/Register/updateLicenseDetails', registerlicenseRoutes);
app.use('/api/Register/updateRegisterDoc', registerlicenseRoutes);
app.use('/api/Register/updateRegisterBank', registerlicenseRoutes);
//this is for bank data
app.use('/api/Bank/getBank', bankRoutes);
app.use('/api/Bank/newBank', bankRoutes);
app.use('/api/Bank/updateBank', bankRoutes);
app.use('/api/Bank/deleteBank', bankRoutes);
//this is for userlogin
app.use('/api/Userlogin/userLogin', userloginRoutes);
app.use('/api/Userlogin/verifyEmail', userloginRoutes);
app.use('/api/Userlogin/updatePassword', userloginRoutes);
//this is for CategoryApprove
app.use('/api/CategoryApprove/newCategoryApprove', categoryapproveRoutes);
app.use('/api/CategoryApprove/getCategoryApprove', categoryapproveRoutes);
app.use('/api/CategoryApprove/updateCategoryApprove', categoryapproveRoutes);
app.use('/api/CategoryApprove/deleteCategoryApprove', categoryapproveRoutes);
//this is for GroupApprove
app.use('/api/GroupApprove/newGroupApprove', groupapproveRoutes);
app.use('/api/GroupApprove/updateGroupApprove', groupapproveRoutes);
app.use('/api/GroupApprove/getGroupApprove', groupapproveRoutes);
app.use('/api/GroupApprove/deleteGroupApprove', groupapproveRoutes);
//this is for Employee
app.use('/api/Employee/newEmployee', employeeRoutes);
app.use('/api/Employee/getEmployee', employeeRoutes);
app.use('/api/Employee/updateEmployee', employeeRoutes);
app.use('/api/Employee/deleteEmployee', employeeRoutes);
//this is for employee groupapproval
app.use('/api/EmployeeGroupApproval/newEmployeeGroupApproval', employeegroupapprovalRoutes);
app.use('/api/EmployeeGroupApproval/getEmployeeGroupApproval', employeegroupapprovalRoutes);
app.use('/api/EmployeeGroupApproval/updateEmployeeGroupApproval', employeegroupapprovalRoutes);
app.use('/api/EmployeeGroupApproval/deleteEmployeeGroupApproval', employeegroupapprovalRoutes);



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Store uploaded files in the 'uploads' directory
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Save file with the original name and add timestamp to avoid conflicts
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // File type validation: only accept image files
        const fileTypes = /jpeg|jpg|png|gif|pdf/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = fileTypes.test(file.mimetype);

        if (extname && mimeType) {
            return cb(null, true); // Accept file
        } else {
            cb(new Error('Only image files are allowed!'), false); // Reject file
        }
    },
    limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5 MB
});

app.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        res.status(200).send({
            message: 'Image uploaded successfully!',
            file: req.file,  // The uploaded file information (path, filename, etc.)
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).send('Error uploading image');
    }
});

app.get('/uploads/:imageName', (req, res) => {
    const { imageName } = req.params;
    const imagePath = path.join(__dirname, '..', 'uploads', imageName);
    console.log('Image path:', imagePath);

    // Check if the image exists
    res.sendFile(imagePath, (err) => {
        if (err) {
            res.status(404).send('Image not found!');
        }
    });
});

// Global Error Handler (must be the last middleware)
app.use(errorHandler);

module.exports = app;