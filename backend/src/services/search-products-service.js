import { Op } from 'sequelize';
import db from '../models/index.js';

export const searchProducts = async (query) => {
  const { Product, Category } = db;
  console.log('Searching products with query:', query);
  return Product.findAll({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
      ],
    },
    include: [
      {
        model: Category,
        as: 'Category',
        where: {
          name: { [Op.iLike]: `%${query}%` },
        },
        required: false,
      },
    ],
  });
};
