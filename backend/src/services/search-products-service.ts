import { Op } from 'sequelize';
import { Category, Product } from '../models';

export const searchProducts = async (query: any) => {
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
