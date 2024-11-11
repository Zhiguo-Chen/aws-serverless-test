const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Order extends Model {}

Order.init(
  {
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending"
    }
    // Add any other fields you need for your orders
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true
  }
);

module.exports = Order;
