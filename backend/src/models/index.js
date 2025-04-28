// models/index.js
const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
const fs = require('fs');
const path = require('path');

const basename = path.basename(__filename);
const db = {};

// 自动加载所有模型文件
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach((file) => {
    console.log(file);
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// 设置模型关联
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
