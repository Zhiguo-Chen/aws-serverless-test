const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const { sequelize, Category } = require('../models');

const seedCategories = async () => {
  try {
    const results = [];
    const filePath = path.join(__dirname, 'categories.csv');

    // 读取 CSV 文件
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        console.log('CSV file successfully processed');

        // 同步数据库
        await sequelize.sync();

        // 清空现有分类
        await Category.destroy({ truncate: true });

        // 插入新分类
        await Category.bulkCreate(results);

        console.log(`${results.length} categories seeded successfully`);
        process.exit(0);
      });
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
};

seedCategories();
