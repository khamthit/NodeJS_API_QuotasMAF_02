const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
const sequelize = require("../config/db");
const Countrry = require("../models/Country"); // Assuming User model


class CountryService {
    //this is display data
    async showingdata(){
        try {
            const data = await Countrry.findAll({
                attributes: ['countryid', 'region', 'country']
            });
            return data;
            
        } catch (error) {
            console.error
        }
    }

}

module.exports = CountryService;