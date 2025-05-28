import 'dotenv/config';
import pg from 'pg';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DB_URL, {
  logging: false,
  dialect: 'postgres',
  dialectModule: pg,
});

export default sequelize;
