import 'dotenv/config';
import path from 'path';
import pg from 'pg';
import { Sequelize } from 'sequelize-typescript';

const sequelize = new Sequelize({
  database: process.env.DB_NAME || 'database',
  username: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  dialect: 'postgres',
  dialectModule: pg,
  models: [path.join(__dirname, '../models/**/*.model.{ts,js}')],
  modelMatch: (filename, member) => {
    // 排除 MongoDB 模型文件
    const lower = filename.toLowerCase();
    if (lower.includes('mongo') || lower.includes('index')) {
      return false;
    }
    // 默认匹配规则
    return (
      member.toLowerCase() === filename.toLowerCase().replace('.model', '')
    );
  },
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? true : false,
  },
});

export default sequelize;
