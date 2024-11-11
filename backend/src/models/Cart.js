const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Cart extends Model {}

Cart.init(
  {},
  {
    sequelize,
    modelName: "cart",
    tableName: "carts",
    timestamps: true
  }
);

module.exports = Cart;
