const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Payment extends Model {}

Payment.init(
  {
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Payment",
    tableName: "payments",
    timestamps: true
  }
);

module.exports = Payment;
