const { Sequelize } = require('sequelize');
require('dotenv').config({
  path: require('path').resolve(__dirname, '../../../.env'),
});

// 请根据你的实际数据库配置修改
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log,
  },
);

async function addIsHotSaleColumn() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.query(
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS "isHotSale" BOOLEAN DEFAULT false;`,
    );
    console.log('Column isHotSale added successfully!');
  } catch (error) {
    console.error('Unable to add column:', error);
  } finally {
    await sequelize.close();
  }
}

addIsHotSaleColumn();
