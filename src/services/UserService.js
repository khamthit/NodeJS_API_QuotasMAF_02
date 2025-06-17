// src/services/UserService.js
const User = require("../models/User"); // Assuming User model
const LogSystem = require("../models/logsystem"); // Assuming LogSystem model
const bcrypt = require("bcrypt");
const { Op } = require("sequelize"); // Import Op for Sequelize operators

class UserService {
  async getAllUsers(options = {}) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10; // Default limit to 10
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({
      limit,
      offset,
      where: { statustypes: "ADD" },
    });
    return {
      items: rows,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    };
  }

  /**
   * Authenticates a user by their email/phone and password.
   * @param {object} credentials - The user's login credentials.
   * @param {string} credentials.emailorphone - The user's email or phone number.
   * @param {string} credentials.password - The user's plain text password.
   * @returns {Promise<User|null>} The authenticated Sequelize User instance or null if authentication fails.
   * @throws {Error} If there's an issue during the authentication process (e.g., database error).
   */
  async loginUser(emailorphone, password) {
    try {
      console.log(
        `[UserService - loginUser] Attempting to log in user with emailorphone: ${emailorphone}`
      );
      if (!emailorphone || !password) {
        // This validation could also be in the controller, but good for defense in depth
        throw new Error("Email/phone and password are required for login.");
      }
      console.log("email and password in service :", emailorphone, password);
      const user = await User.findOne({
        where: {
          emailorphone: emailorphone,
          statustypes: "ADD", // Ensure the user account is active
        },
      });

      if (!user) {
        console.log(
          `[UserService - loginUser] User not found or not active for emailorphone: ${emailorphone}`
        );
        return null; // User not found
      }
      console.log(
        "[UserService - loginUser] User found:",
        user.emailorphone,
        user.passwords
      );

      if (!user.passwords) {
        console.error(
          `[UserService - loginUser] Stored password hash is missing for user: ${emailorphone}.`
        );
        // Potentially throw an error or return null, as login cannot proceed
        return null;
      }
      const isPasswordMatch = await bcrypt.compare(password, user.passwords);
      if (!isPasswordMatch) {
        console.log(
          `[UserService - loginUser] Password mismatch for user: ${emailorphone}`
        );
        return null; // Password does not match
      }

      // If password matches, update token and return user
      console.log(
        `[UserService - loginUser] Password match for user: ${emailorphone}. Updating token.`
      );
      const newTokenKey = `${user.usid}-${Date.now()}`;
      await UserService.updateTokenkeyForUser(user.emailorphone, newTokenKey); // Ensure this static method handles errors
      user.tokenkey = newTokenKey; // Update the token key in the current user instance
      return user; // Return the Sequelize User instance
    } catch (error) {
      console.error("Error during loginUser service:", error);
      throw new Error(`Authentication failed: ${error.message}`); // Propagate a more specific error
    }
  }

  async loginUser2(emails, passwords) {
    try {
      console.log("userlogin service:", emails);
      // 2. Find the user
      const user = await User.findOne({
        where: {
          emailorphone: emails,
          statustypes: "ADD",
        },
      });
      console.log("UserService :", user);

      if (!user) {
        console.log(`User not found or not active for email: ${emails}`);
        return { success: false, message: "Your email is not found." }; // Generic message for security
      }

      // 5. Compare the provided password with the stored hash
      const isPasswordMatch = await bcrypt.compare(passwords, user.passwords);

      console.log("password match :", isPasswordMatch, passwords);

      if (!isPasswordMatch) {
        console.log(`Password mismatch for user: ${emails}`);
        return { success: false, message: "Your password is not match." }; // Generic message
      }
      // 6. Password matches: Proceed with login
      try {
        console.log(`User ${emails} authenticated successfully.`);
        const newTokenKey = `${user.usid}-${Date.now()}`;
        await User.update(
          {
            tokenkey: newTokenKey,
            // logingstatus: "Y", // Reaffirm status, or update last_login_date etc.
          },
          {
            where: {
              usid: user.usid,
            },
          }
        );
        return {
          token: newTokenKey,
          user: {
            // Return necessary, non-sensitive user data
            success: true,
            usid: user.usid,
            emails: user.emailorphone,
            isPasswordMatch: isPasswordMatch,
            statustype: user.statustypes,
            logintype: user.typelogin,
            // Add other relevant fields like typelogin if they exist on the Userlogin model
          },
        };
      } catch (updateError) {
        console.error(
          `Error updating token for user ${emailorphone}:`,
          updateError
        );
        throw new Error("Failed to finalize login. Please try again.");
      }
    } catch (error) {
      console.error("Error during Userlogin service execution:", error);
      throw new Error(
        "An unexpected error occurred during the login process. Please try again."
      );
    }
  }

  static async updateTokenkeyForUser(emailorphone, newTokenKey) {
    try {
      const user = await User.findOne({
        where: {
          emailorphone: emailorphone,
          statustypes: "ADD", // Ensure the user account is active
        },
      });

      if (!user) {
        console.log(
          `[UserService - updateTokenkeyForUser] User not found or not active for usid: ${userId}`
        );
        return null; // User not found
      }

      user.tokenkey = newTokenKey; // Update the token key
      await user.save(); // Save the changes to the database
      return user; // Return the updated user instance
    } catch (error) {
      console.error("Error updating token key for user:", error);
      throw new Error("Failed to update token key for user.");
    }
  }

  async updatePasswords(emailorphone, newPassword) {
    try {
      const user = await User.findOne({
        where: {
          emailorphone: emailorphone,
          statustypes: "ADD", // Ensure the user account is active
        },
      });

      if (!user) {
        console.log(
          `[UserService - updatePasswords] User not found or not active for emailorphone: ${emailorphone}`
        );
        return null; // User not found
      }

      // Hash the new password before saving
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.passwords = hashedPassword; // Update the password
      await user.update({ passwords: hashedPassword }); // Save the changes to the database
      await user.save(); // Save the changes to the database
      return user; // Return the updated user instance
    } catch (error) {
      console.error("Error updating password for user:", error);
      throw new Error("Failed to update password for user.");
    }
  }

  async updateUserLoginService(newemailorphone, newTypeLogin) {
    try {
      const user = await User.findOne({
        where: {
          emailorphone: newemailorphone,
          statustypes: "ADD", // Ensure the user account is active
        },
      });

      // Update the user with the provided data
      await user.update({
        emailorphone: newemailorphone,
        typelogin: newTypeLogin,
      });
      await user.save(); // Save the changes to the database
      await user.update({ typelogin: newTypeLogin }); // Update the type login
      return user; // Return the updated user instance
    } catch (error) {
      console.error("Error updating user login:", error);
      throw new Error("Failed to update user login.");
    }
  }

  async deleteUserLoginSerivce(emailorphone, createby) {
    try {
      const user = await User.findOne({
        where: {
          emailorphone: emailorphone,
          statustypes: "ADD", // Ensure the user account is active
        },
      });
      if (!user) {
        console.log(
          `[UserService - deleteUserLoginSerivce] User not found or not active for emailorphone: ${emailorphone}`
        );
        return null; // User not found
      }
      user.statustypes = "DEL"; // Mark the user as deleted
      await user.save(); // Save the changes to the database

      return { user: user }; // Return both user and log
    } catch (error) {
      console.error("Error deleting user login:", error);
      throw new Error("Failed to delete user login.");
    }
  }

  async updateUserLoginActiveService(emailorphone, createby) {
    try {
      const user = await User.findOne({
        where: {
          emailorphone: emailorphone,
          statustypes: "DEL", // Ensure the user account is active
        },
      });
      if (!user) {
        console.log(
          `[UserService - updateUserLoginActiveService] User not found or not active for emailorphone: ${emailorphone}`
        );
        return null; // User not found
      }
      user.statustypes = "ADD"; // Mark the user as active
      await user.save(); // Save the changes to the database

      return { user: user }; // Return both user and log
    } catch (error) {
      console.error("Error updating user login active:", error);
      throw new Error("Failed to update user login active.");
    }
  }
}

module.exports = UserService;
