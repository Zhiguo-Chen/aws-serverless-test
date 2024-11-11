const { DataTypes, Model } = require("sequelize");
const sequelize = require("../config/database");

class Category extends Model {}

Category.init(
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    timestamps: false
  }
);

module.exports = Category;
