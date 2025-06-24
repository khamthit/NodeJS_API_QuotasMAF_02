const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); // Adjust path if your db.js is elsewhere

const vm_empgroupapprovalActive = sequelize.define(
  'vm_empgroupapprovalactive',
  {
    egpid: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    levelapprove:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    eid:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    capid:{
        type: DataTypes.INTEGER,
        allowNull: false,
    },
  },
  {
    timestamps: false,
    tableName: "vm_empgroupapprovalactive",
    freezeTableName: true,
  }
);

module.exports = vm_empgroupapprovalActive;