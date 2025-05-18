// models/FlashSale.js
module.exports = (sequelize, DataTypes) => {
  const FlashSale = sequelize.define(
    'FlashSale',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      discountPercentage: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: 'flash_sales',
    },
  );

  FlashSale.associate = (models) => {
    FlashSale.belongsToMany(models.Product, {
      through: 'FlashSaleProducts',
      foreignKey: 'flashSaleId',
    });
  };

  return FlashSale;
};
