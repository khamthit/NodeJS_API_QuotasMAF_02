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
// const Register = require("../models/Register");
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

class RegisterService {
  async checkDataFirst(emails) {
    try {
      const checkdata = await Register.findOne({
        where: {
          emails: emails,
          statustype: "ADD",
        },
      });
      return checkdata;
    } catch (error) {
      console.log("Error message Service :", error);
    }
  }

  async getRegisterAll({ page, limit, searchtext }) {
    try {
      const currentPage = page ? parseInt(page, 10) : 1;
      const pageLimit = limit ? parseInt(limit, 10) : 10;
      const offset = (currentPage - 1) * pageLimit;

      let whereClause = {};
      if (searchtext && searchtext.trim() !== "") {
        whereClause = {
          [Op.or]: [
            { emails: { [Op.iLike]: `%${searchtext}%` } },
            { firstname: { [Op.iLike]: `%${searchtext}%` } },
            { lastname: { [Op.iLike]: `%${searchtext}%` } },
            { mobiles: { [Op.iLike]: `%${searchtext}%` } },
            { businessid: { [Op.iLike]: `%${searchtext}%` } },
            { engenterprise: { [Op.iLike]: `%${searchtext}%` } },
            { laoenterprise: { [Op.iLike]: `%${searchtext}%` } },
            { investmenttype: { [Op.iLike]: `%${searchtext}%` } },
            // You might want to add disla, disen, prola, proen from Vm_villages if they are part of the view and searchable
          ],
        };
      }
      const { count, rows } = await Register.findAndCountAll({
        where: whereClause,
        limit: pageLimit,
        offset: offset,
        order: [["emails", "ASC"]], // Sorting as an example
      });
      return {
        items: rows,
        totalItems: count,
        totalPages: Math.ceil(count / pageLimit),
        currentPage: currentPage,
      };
    } catch (error) {
      console.error("Error fetching villages in Service:", error);
      // Re-throw the error so the controller can handle it
      //   throw new Error(`Failed to fetch Register: ${error.message}`);
    }
  }

  async newRegister(emails, createby) {
    try {
      const result = await sequelize.query(
        `CALL pd_createRegister(:emails, :createby)`,
        {
          replacements: {
            emails, // Ensure emails is defined correctly
            createby, // Ensure createby is defined correctly
          },
          type: sequelize.QueryTypes.RAW,
        }
      );

      //this is showing id
      const id = result[0][0]?.id;

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
        <p>ສະບາຍດີ,</p>
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
      return result; // Returning the result of the procedure
    } catch (error) {
      console.log("Error message new register Service :", error);
      throw new Error("Failed to create register");
    }
  }

  async verifyOTP(emails) {
    try {
      //this is verify otp in redis
      const otp = await redisClient.get(emails);
      console.log("OTP : ", otp);
      return otp;
    } catch (error) {
      console.log("Error message verifyOTP service :", error);
      throw new Error("Failed to verifyOTP service");
    }
  }

  async registerGeneralInfo(updateData) {
    try {
      console.log("registerGeneralInfo");
      const {
        emails,
        typeregister,
        firstname,
        lastname,
        mobiles,
        passwords,
        images,
      } = // Assuming typelogin was meant to be typeregister
        updateData;

      if (!emails) {
        throw new Error(
          "Email is required to identify the registration to update."
        );
      }

      console.log("typeregister : ", typeregister);

      const payloadToUpdate = {};
      // Add fields to payload only if they are provided in updateData
      if (typeof typeregister !== "undefined")
        payloadToUpdate.typeregister = typeregister;
      if (typeof firstname !== "undefined")
        payloadToUpdate.firstname = firstname;
      if (typeof lastname !== "undefined") payloadToUpdate.lastname = lastname;
      if (typeof mobiles !== "undefined") payloadToUpdate.mobiles = mobiles;
      if (typeof images !== "undefined") payloadToUpdate.images = images;
      // Hash the password only if it's provided for update
      if (passwords) {
        const hashedPassword = await bcrypt.hash(passwords, 10);
        payloadToUpdate.passwords = hashedPassword;
      }

      if (Object.keys(payloadToUpdate).length === 0) {
        // Nothing to update if only email was provided and no other fields
        return { updated: 0, message: "No fields provided for update." };
      }

      const [numberOfAffectedRows] = await Register.update(payloadToUpdate, {
        where: {
          emails: emails,
          statustype: "ADD", // Only update active records
        },
      });

      if (numberOfAffectedRows === 0) {
        // Check if the record exists to provide a more specific message
        const existingRecord = await Register.findOne({
          where: { emails: emails, statustype: "ADD" },
        });
        if (!existingRecord) {
          throw new Error(
            `Registration with email ${emails} not found or not active.`
          );
        }
      }
      return { updated: numberOfAffectedRows };
    } catch (error) {
      console.log("Error message registerGeneralInfo service :", error);
      throw new Error(
        `Failed to update registration general info: ${error.message}`
      );
    }
  }

  async updateLicenseDetails(updateData) {
    try {
      console.log("UpdateLicenseDetails");
      const {
        emails,
        businessid,
        laoenterprise,
        engenterprise,
        registerby,
        capitalregistration,
        investmenttype,
        registerationdate,
        province,
        district,
        village,
        taxinfo,
        taxregistration,
        status,
      } = updateData;

      //console.log("Email : ", businessid);

      if (!emails){
        throw new Error("Email is required to identify the registration to update");
      }

      console.log("Update Data :", updateData);

      const payloadToUpdate = {};
      if (typeof businessid !== "undefined")
        payloadToUpdate.businessid = businessid;
      if (typeof laoenterprise !== "undefined")
        payloadToUpdate.laoenterprise = laoenterprise;
      if (typeof engenterprise !== "undefined")
        payloadToUpdate.engenterprise = engenterprise;
      if (typeof registerby !== "undefined")
        payloadToUpdate.registerby = registerby;
      if (typeof capitalregistration !== "undefined")
        payloadToUpdate.capitalregistration = capitalregistration
      if (typeof investmenttype !== "undefined")
        payloadToUpdate.investmenttype = investmenttype;
      if (typeof registerationdate !== "undefined")
        payloadToUpdate.registerationdate = registerationdate;
      if (typeof province !== "undefined") payloadToUpdate.province = province
      if (typeof district !== "undefined") payloadToUpdate.district = district
      if (typeof village !== "undefined") payloadToUpdate.village = village
      if (typeof taxinfo !== "undefined") payloadToUpdate.taxinfo = taxinfo
      if (typeof taxregistration !== "undefined")
        payloadToUpdate.taxregistration = taxregistration;
      if (typeof status !== "undefined") payloadToUpdate.status = status;

      if (Object.keys(payloadToUpdate).length === 0) {
          return {update: 0, message: "No fields provided for update."};
      }
      const [numberOfAffectedRows] = await Register.update(payloadToUpdate, {
        where: {
          emails: emails,
        },});
        if (numberOfAffectedRows === 0) {
          const existingRecord = await Register.findOne({
            where: { emails: emails },
          });
          if (!existingRecord) {
            throw new Error(`Registration with email ${emails} not found.`);
          }
        }
        return {update: numberOfAffectedRows};    
    } catch (error) {
      console.log("Error message updatelicense service :", error);
      throw new Error(
        `Failed to update updatelicense service: ${error.message}`
      );
    }
  }

  async updateRegisterDoc(updateData) {
    try {
      console.log("Service: updateRegisterDoc, Input Data:", updateData);
      const {
        emails,
        taxstartdate,
        taxexpiredate,
        taxfile,
        imexstartdate,
        imexexpiredate,
        imexfile,
        accountstartdate,
        accountexpiredate,
        accountfile,
        bankstartdate,
        bankexpiredate,
        bankfile,
        registerstartdate,
        registerexpiredate,
        registerfile,
        approvestartdate,
        approveexpiredate,
        approvefile,
        registertaxstartdate,
        registertaxenddate, // This will be mapped to :registertaxexpiredate
        registertaxfile,
      } = updateData;

      if (!emails) {
        throw new Error("Email is required for updating register documents.");
      }

      const result = await sequelize.query(
        `CALL pd_registerAttachDoc(
          :emails, :taxstartdate, :taxexpiredate, :taxfile, 
          :imexstartdate, :imexexpiredate, :imexfile, 
          :accountstartdate, :accountexpiredate, :accountfile, 
          :bankstartdate, :bankexpiredate, :bankfile, 
          :registerstartdate, :registerexpiredate, :registerfile, 
          :approvestartdate, :approveexpiredate, :approvefile, 
          :registertaxstartdate, :registertaxexpiredate, :registertaxfile
        )`,
        {
        replacements: {
            emails,
            taxstartdate,
            taxexpiredate,
            taxfile,
            imexstartdate,
            imexexpiredate,
            imexfile,
            accountstartdate,
            accountexpiredate,
            accountfile,
            bankstartdate,
            bankexpiredate,
            bankfile,
            registerstartdate,
            registerexpiredate,
            registerfile,
            approvestartdate,
            approveexpiredate,
            approvefile, // Corrected from 'approve'
            registertaxstartdate,
            registertaxexpiredate: registertaxenddate, // Map controller's 'registertaxenddate' to SP's 'registertaxexpiredate'
            registertaxfile,
        },
        type: sequelize.QueryTypes.RAW,
      });

      // Attempt to determine updated count (highly dependent on DB and SP implementation)
      let updatedCount = 0;
      if (result && result[0] && result[0][0] && result[0][0].hasOwnProperty('updated_count')) {
        updatedCount = parseInt(result[0][0].updated_count, 10);
      } else if (result && Array.isArray(result) && result.length > 1 && typeof result[1] === 'object' && result[1] !== null && result[1].hasOwnProperty('rowCount')) {
        updatedCount = parseInt(result[1].rowCount, 10);
      }
      // console.log("Service: updateRegisterDoc result", result, "Updated count:", updatedCount);
      return { updated: updatedCount, rawResult: result };
    } catch (error) {
      console.error("Service Error: Failed to updateRegisterDoc:", error);
      throw new Error(`Failed to update register documents in service: ${error.message}`);
    }
  }

  async updateRegisterBank(bkid, emails, bankaccountname, salebkid, salebankaccountname){
    try {
      const updateData = await Register.update({
        bkid: bkid,
        statustype: "PENDING",
        logingstatus: "Y",
        bankaccountname: bankaccountname,
        sale_bkid: salebkid,
        sale_bankaccountname: salebankaccountname
      }, {
        where: {
          emails: emails
        }
      });
      return updateData;
    } catch (error) {
       console.error("Service Error: Failed to updateRegisterBank:", error);
      throw new Error(`Failed to update updateRegisterBank in service: ${error.message}`);
    }
  }

}
module.exports = RegisterService;
