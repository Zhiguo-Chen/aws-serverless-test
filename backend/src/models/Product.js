// models/Product.js
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    'Product',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      originalPrice: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      discountPercentage: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      stockQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isNewArrival: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isFlashSale: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      flashSaleEndsAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      tableName: 'products',
    },
  );

  Product.associate = (models) => {
    Product.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'Category',
    });
    Product.hasMany(models.Review, { foreignKey: 'productId' });
    Product.hasMany(models.ProductImage, { foreignKey: 'productId' });
  };

  return Product;
};
