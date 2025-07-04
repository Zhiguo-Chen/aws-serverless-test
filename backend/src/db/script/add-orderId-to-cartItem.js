const { Sequelize } = require('sequelize');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

// 请根据你的实际数据库配置修改
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: console.log,
});

async function addOrderIdToCartItem() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.query(`ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS "orderId" UUID;`);
    console.log('Column orderId added to cart_items successfully!');
  } catch (error) {
    console.error('Unable to add column:', error);
  } finally {
    await sequelize.close();
  }
}

addOrderIdToCartItem();
