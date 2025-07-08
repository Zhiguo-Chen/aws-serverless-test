import { Product } from '../models/Product.model';
import { MongoOrder } from '../models/Order.mongo';
import { Op } from 'sequelize';
import mongoose from 'mongoose';
import sequelize, { Category, ProductImage } from '../models';

/**
 * Fetches the 4 most popular products from the same category as the given product,
 * using the MongoDB orders collection.
 *
 * @param productId The ID of the product to base recommendations on.
 * @returns A promise that resolves to an array of up to 4 recommended products.
 */
export const getRecommendationsForProduct = async (
  productId: string,
): Promise<Product[]> => {
  // 1. Find the original product to get its category ID
  const originalProduct = await Product.findByPk(productId, {
    attributes: ['categoryId'],
    raw: true,
  });

  if (!originalProduct) {
    throw new Error('Product not found');
  }
  // console.log(originalProduct.toJSON());
  const categoryId = originalProduct.categoryId;
  console.log('Category ID:', categoryId);
  if (!categoryId) {
    return []; // or throw new Error('categoryId is required');
  }

  // 2. Find all products belonging to the same category to create a pool for matching
  const productsInCategory = await Product.findAll({
    where: { categoryId },
    attributes: ['id'],
  });
  const productIdsInCategory = productsInCategory.map((p) => p.id);

  // 3. Use MongoDB Aggregation to find the most popular products from the category pool
  const popularProducts = await MongoOrder.aggregate([
    // Deconstruct the products array field from the input documents to output a document for each element.
    { $unwind: '$products' },

    // Filter to only include products that are in the same category and not the original product itself
    {
      $match: {
        'products.productId': {
          $in: productIdsInCategory,
          $ne: productId,
        },
      },
    },

    // Group by productId and count occurrences
    {
      $group: {
        _id: '$products.productId',
        orderCount: { $sum: 1 }, // or $sum: '$products.quantity' to count by quantity sold
      },
    },

    // Sort by the number of orders in descending order
    { $sort: { orderCount: -1 } },

    // Limit to the top 4
    { $limit: 4 },

    // Rename _id to productId for clarity
    {
      $project: {
        _id: 0,
        productId: '$_id',
      },
    },
  ]);

  const popularProductIds = popularProducts.map((p) => p.productId);

  if (popularProductIds.length === 0) {
    // Fallback or return empty: If no recommendations, maybe suggest top sellers from the category?
    // For now, we return empty.
    return [];
  }

  // 4. Fetch the full details of these popular products from the relational database
  const recommendedProducts = await Product.findAll({
    where: {
      id: {
        [Op.in]: popularProductIds,
      },
    },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name'],
      },
      {
        model: ProductImage,
        as: 'productImages', // Make sure it matches your association alias
        attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'createdAt'],
      },
    ],
    attributes: {
      include: [
        // Number of ratings
        [
          sequelize.literal(
            '(SELECT COUNT(*) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
          ),
          'reviewCount',
        ],
        // Average rating
        [
          sequelize.literal(
            '(SELECT AVG(rating) FROM "reviews" WHERE "reviews"."productId" = "Product"."id")',
          ),
          'averageRating',
        ],
      ],
    },
    order: [['createdAt', 'ASC']],
  });

  // Re-order the results to match the popularity ranking from the aggregation
  recommendedProducts.sort((a, b) => {
    return popularProductIds.indexOf(a.id) - popularProductIds.indexOf(b.id);
  });

  return recommendedProducts;
};