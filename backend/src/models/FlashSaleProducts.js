// models/FlashSaleProducts.js
module.exports = (sequelize, DataTypes) => {
  const FlashSaleProducts = sequelize.define(
    'FlashSaleProducts',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      flashSaleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'flash_sales',
          key: 'id',
        },
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id',
        },
      },
      specialDiscount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      tableName: 'flash_sale_products',
    },
  );

  return FlashSaleProducts;
};
