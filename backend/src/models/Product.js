const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class Product extends Model {}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    stock: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'Products',
    timestamps: true, // createdAt: false, updatedAt: false
    hooks: {
      beforeCreate: (product) => {
        product.id = uuidv4();
      },
    },
  },
);

module.exports = Product;
