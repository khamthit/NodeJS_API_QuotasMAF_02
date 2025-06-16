const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const { Op } = require("sequelize"); // Import Op for Sequelize operators
// UserService will be imported if static logging is used, or this service handles its own logging
const sequelize = require("../config/db"); // Import the sequelize instance
const bcrypt = require("bcrypt");
const {
  SendError,
  SendError400,
  SendDuplicateData,
} = require("../utils/response");

const Userlogin = require("../models/userlogin");

class UserloginService {
  async Userlogin(emails, passwords) {
    try {
      console.log("userlogin service:", emails);
      // 2. Find the user
      const user = await Userlogin.findOne({
        where: {
          emails: emails,
          logingstatus: "Y",
        //   statustype: { [Op.ne]: "DEL" }, ///statustype != DEL
        },
      });

      if (!user) {
        console.log(`User not found or not active for email: ${emails}`);
        return { success: false, message: "Invalid email or password." }; // Generic message for security
      }

      // 5. Compare the provided password with the stored hash
      const isPasswordMatch = await bcrypt.compare(passwords, user.passwords);

      if (!isPasswordMatch) {
        console.log(`Password mismatch for user: ${emails}`);
        return { success: false, message: "Invalid email or password." }; // Generic message
      }

      // 6. Password matches: Proceed with login
      try {
        console.log(`User ${emails} authenticated successfully.`);
        const newTokenKey = `${user.rgstid}-${Date.now()}`;
        await Userlogin.update(
          {
            tokenkey: newTokenKey,
            logingstatus: "Y", // Reaffirm status, or update last_login_date etc.
          },
          {
            where: {
              rgstid: user.rgstid,
            },
          }
        );
        return {
          token: newTokenKey,
          user: {
            // Return necessary, non-sensitive user data
            success: true,
            usid: user.rgstid,
            emails: user.emails,
            isPasswordMatch: isPasswordMatch,
            statustype: user.statustype,
            logingstatus: user.logingstatus,
            firstname: user.firstname,
            lastname: user.lastname,
            mobiles: user.mobiles,
            // Add other relevant fields like typelogin if they exist on the Userlogin model
          },
        };
      } catch (updateError) {
        console.error(`Error updating token for user ${emails}:`, updateError);
        throw new Error("Failed to finalize login. Please try again.");
      }
    } catch (error) {
      console.error("Error during Userlogin service execution:", error);
      throw new Error(
        "An unexpected error occurred during the login process. Please try again."
      );
    }
  }
}

module.exports = UserloginService;
