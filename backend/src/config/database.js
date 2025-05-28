import 'dotenv/config';
import pg from 'pg';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectModule: pg,
    dialectOptions: {
      ssl: true, // 尝试启用 SSL
    },
  },
);

export default sequelize;
