const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Product extends Model {}

Product.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false
    },
    stock: {
      type: DataTypes.INTEGER
    }
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
    timestamps: true // createdAt: false, updatedAt: false
  }
);

module.exports = Product;
