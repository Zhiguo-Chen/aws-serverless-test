import { Category } from '../../models';
import { loadData } from '../../utils/loadData';

const seedData2Table = async () => {
  await Promise.all([loadData(Category, 'categories.csv')]);
  process.exit();
};

seedData2Table();
