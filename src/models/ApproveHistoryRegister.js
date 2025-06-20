const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const ApproveHistoryRegister = sequelize.define(
  "ApproveHistoryRegister",
  {
    ahid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
      field: "ahid",
    },
    egpid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "egpid",
    },
    approveby: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "approveby",
    },
    rgstid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "rgstid",
    },
    approvecomments: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "approvecomments",
    },
    typeapprove: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "typeapprove",
    },
    statusapprove: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "statusapprove",
    },
    statustype: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "statustype",
    },
    createby: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "createby",
    },
    createdate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "createdate",
      get() {
        const rawValue = this.getDataValue("createdate");
        return rawValue ? moment(rawValue).format("YYYY-MM-DD HH:mm:ss") : null;
      },
    },
  },
  {
    timestamps: false,
    tableName: "tb_approvehistory",
  }
);

module.exports = ApproveHistoryRegister;
