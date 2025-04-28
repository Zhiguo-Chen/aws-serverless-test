// models/ProductImage.js
module.exports = (sequelize, DataTypes) => {
  const ProductImage = sequelize.define(
    'ProductImage',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isPrimary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      altText: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'product_images',
    },
  );

  ProductImage.associate = (models) => {
    ProductImage.belongsTo(models.Product, { foreignKey: 'productId' });
  };

  return ProductImage;
};
