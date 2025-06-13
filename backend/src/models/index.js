// models/index.js
import fs from 'fs';
import path from 'path';
import { DataTypes, Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import sequelize from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const db = {};

// 自动加载所有模型文件（ESM 动态导入）
const loadModels = async () => {
  const files = fs.readdirSync(__dirname).filter(
    (file) =>
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1 &&
      !file.includes('mongo'), // 排除文件名
  );

  for (const file of files) {
    console.log(file);
    const module = await import(path.join(__dirname, file));
    const modelFactory = module.default || module;
    const model = modelFactory(sequelize, DataTypes);
    db[model.name] = model;
  }

  // 设置模型关联
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
};

export { loadModels };
export default db;
