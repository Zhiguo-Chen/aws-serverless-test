const Category = require('../../models/Category.model');
const loadData = require('../../utils/loadData');

const seedData2Table = async () => {
  await Promise.all([loadData(Category, 'categories.csv')]);
  process.exit();
};

seedData2Table();
