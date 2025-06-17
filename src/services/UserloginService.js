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
const redisClient = require("../config/redisClient");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Use your email provider, e.g. 'gmail'
  auth: {
    // user: "khamtid@gmail.com",
    // pass: "operator@123",
    user: process.env.EMAIL_USER, // Use environment variable
    pass: process.env.EMAIL_PASS,
  },
});

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

  async verifyEmail(emails) {
    try {
      console.log("verifyEmail service:", emails);
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
        return { success: false, message: "Invalid email." }; // Generic message for security
      }
      //this is random number
      const randomNumber = Math.floor(Math.random() * 900000) + 100000;

      //this is redistClient
      const cachedData = await redisClient.set(
        emails,
        randomNumber.toString(),
        "EX",
        120
      );
      if (cachedData) {
        console.log("Serving getRegisterAll from Redis cache");
      }
      //this is sending email
      const mailOptions = {
        //from: "khamtid@gmail.com", // Sender address
        from: process.env.EMAIL_USER, // Sender address
        to: emails, // Receiver address
        subject: "Your One-Time Password (OTP) for Registration", // Subject line
        text: `Hello,\n\nYour OTP for registration is: ${randomNumber}\nThis code will expire in 2 minutes.\n\nThank you.`, // Plain text body
        html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: Roboto, sans-serif;
            background-color: #f4f4f4;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            background-color: #ffffff;
            padding: 20px;
            margin: auto;
            border-radius: 8px;
            box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
        }
        .email-header {
            background: linear-gradient(145deg, #28a745, #218838); 
            color: white; 
            padding: 50px;
            border-radius: 10px;
            box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2), -1px -1px 2px rgba(255, 255, 255, 0.3); 
            font-size: 40px;
            text-align: center;
            transition: all 0.3s ease; 
        }
        .otp-code {
            font-size: 40px;
            font-weight: bold;
            color: #007bff;
            text-align: center;
            margin: 20px 0;
        }
        .email-footer {
            text-align: center;
            font-size: 12px;
            color: #777777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class='email-container'>
        <div class='email-header'>QUOTA MAF OTP</div>
        <p>Reset-Password,</p>
        <p>ນີ້ແມ່ນລະຫັດ (OTP) ສໍາລັບເຂົ້າເຖິງລະບົບ:</p>
        <div class='otp-code'> ${randomNumber} </div>
        <p>ກະລຸນານໍາເອົາຕົວເລກນີ້ ພີມເຂົ້າໃສ່ປ່ອງ 6 ຕົວເລກຂອງທ່ານ ເພື່ອດໍາເນີນການຕໍ່ໄປ.</p>
        <p>*** ໝາຍເຫດ ຕົວເລກນີ້ ສາມາດຢູ່ໄດ້ພຽງ 2 ນາທີ/ຄັ້ງ ເທົ່ານັ້ນ.</p>
        <hr>
        <p class='email-footer'>© 2025 QUOTA MAF. All rights reserved.</p>
    </div>
</body>
</html>`, // Optional: Send HTML content
      };
      const emailInfo = await transporter.sendMail(mailOptions);
      //console.log("Email sent:", emailInfo.response);
      return {
        success: true,
        emails: user.emails,
      };
    } catch (error) {
      console.error("Error during verifyEmail service execution:", error);
      throw new Error(
        "An unexpected error occurred during the email verification process. Please try again."
      );
    }
  }

  async updatePassword(emails, passwords) {
    try {
      console.log("updatePassword service:", emails);

      ///this is check emails in system first.
      const user = await Userlogin.findOne({
        where: {
          emails: emails,
          logingstatus: "Y",
        },
      });

      if (!user) {
        console.log(`User not found or not active for email: ${emails}`);
      }
      const hashedPassword = await bcrypt.hash(passwords, 10);
      const update = await Userlogin.update(
        {
          passwords: hashedPassword,
        },
        {
          where: {
            emails: emails,
          },
        }
      );
      console.log("new password :", update);

      if (update == 0) {
        return { success: false, message: "Failed to update password." };
      } else {
        return {
          success: true,
          emails: user.emails,
          passwords: hashedPassword,
        };
      }
    } catch (error) {
      console.error("Error during updatePassword service execution:", error);
      throw new Error(
        "An unexpected error occurred during the password update process. Please try again."
      );
    }
  }
}

module.exports = UserloginService;
