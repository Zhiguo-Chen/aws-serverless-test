import { Op } from 'sequelize';
// import sequelize from '../models';
// import { Product } from '../models/Product.model';
// import { Category } from '../models/Category.model';
import sequelize, { Category, Product } from '../models';

export const searchProducts = async (query: any) => {
  console.log('==============');
  console.log('Searching products with query:', query);
  console.log('==============');
  console.log('Available models:', Object.keys(sequelize.models));
  console.log('Product model:', sequelize.models.Product);
  console.log('==============');
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
        as: 'category',
        where: {
          name: { [Op.iLike]: `%${query}%` },
        },
        required: false,
      },
    ],
  });
};
