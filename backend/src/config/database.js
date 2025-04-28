const { Sequelize, DataTypes, Model } = require('sequelize');
const { pg } = require('pg');

const sequelize = new Sequelize(process.env.PG_URL || 'postgresql://postgres:welcome321@localhost:5433/E-Commerce', {
  dialect: 'postgres',
  dialectModule: pg
});

module.exports = sequelize;
