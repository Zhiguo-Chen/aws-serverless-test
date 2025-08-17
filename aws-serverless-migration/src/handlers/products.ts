import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { Product, Category, ProductImage, Review, sequelize } from '../models';
import { Op } from 'sequelize';

export const getProducts = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== GET PRODUCTS (ORM) ===');
    console.log('Request path:', event.path);

    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: ProductImage,
          as: 'productImages',
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

    // Format average rating (exactly like backend)
    const formattedProducts = products.map((product) => {
      const productJson = product.toJSON();
      productJson.averageRating = productJson.averageRating
        ? parseFloat(productJson.averageRating).toFixed(1)
        : 0;
      return productJson;
    });

    console.log(`✅ ORM: Returning ${formattedProducts.length} products`);
    return successResponse(formattedProducts, 200, event);
  } catch (error) {
    console.error('❌ ORM Error fetching products:', error);
    return errorResponse('Failed to fetch products', 500, null, event);
  }
};

export const listAll = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== LIST ALL PRODUCTS (ORM) ===');
    console.log('Request path:', event.path);

    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: ProductImage,
          as: 'productImages', // Ensure it matches your association alias
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

    // Format average rating
    const formattedProducts = products.map((product) => {
      const productJson = product.toJSON();
      productJson.averageRating = productJson.averageRating
        ? parseFloat(productJson.averageRating).toFixed(1)
        : 0;
      return productJson;
    });

    console.log(
      `✅ ORM: Returning detailed info for ${formattedProducts.length} products`,
    );
    return successResponse(formattedProducts, 200, event);
  } catch (error) {
    console.error('❌ ORM Error listing all products:', error);
    return errorResponse('Failed to list all products', 500, null, event);
  }
};

export const getProduct = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== GET SINGLE PRODUCT (ORM) ===');
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Product ID is required', 400, null, event);
    }

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
        {
          model: ProductImage,
          as: 'productImages',
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
    });

    if (!product) {
      return errorResponse(`Product with ID ${id} not found`, 404, null, event);
    }

    const productData = product.toJSON();

    // Format average rating
    productData.averageRating = productData.averageRating
      ? parseFloat(productData.averageRating).toFixed(1)
      : 0;

    console.log(`✅ ORM: Found product "${productData.name}"`);
    return successResponse(productData, 200, event);
  } catch (error) {
    console.error('❌ ORM Error fetching product:', error);
    return errorResponse('Failed to fetch product', 500, null, event);
  }
};

export const createProduct = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== CREATE PRODUCT (ORM) ===');

    const body = JSON.parse(event.body || '{}');
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      stockQuantity,
      isFeatured,
      isHotSale,
      isNewArrival,
      isFlashSale,
      flashSaleEndsAt,
    } = body;

    if (!name || !description || !price || !category) {
      return errorResponse(
        'Name, description, price, and category are required',
        400,
        null,
        event,
      );
    }

    const categoryRecord = await Category.findOne({
      where: { name: category },
    });

    if (!categoryRecord) {
      return errorResponse('Category not found', 400, null, event);
    }

    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice
        ? parseFloat(originalPrice)
        : parseFloat(price),
      discountPercentage: originalPrice
        ? Math.round((1 - parseFloat(price) / parseFloat(originalPrice)) * 100)
        : 0,
      categoryId: categoryRecord.id,
      stockQuantity: stockQuantity || 0,
      isFeatured: isFeatured || false,
      isNewArrival: isNewArrival || false,
      isHotSale: isHotSale || false,
      isFlashSale: isFlashSale || false,
      flashSaleEndsAt: flashSaleEndsAt || null,
    });

    console.log(`✅ ORM: Created product "${product.name}"`);
    return successResponse(product.toJSON(), 201, event);
  } catch (error) {
    console.error('❌ ORM Error creating product:', error);
    return errorResponse('Failed to create product', 500, null, event);
  }
};

export const updateProduct = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== UPDATE PRODUCT (ORM) ===');
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Product ID is required', 400, null, event);
    }

    const body = JSON.parse(event.body || '{}');
    const { category: categoryName, ...otherUpdates } = body;

    const product = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: 'productImages' }],
    });

    if (!product) {
      return errorResponse(`Product with ID ${id} not found`, 404, null, event);
    }

    // Update other product attributes
    const updates: { [key: string]: any } = { ...otherUpdates };
    if (categoryName) {
      const category = await Category.findOne({
        where: { name: categoryName },
      });
      if (category) {
        updates.categoryId = category.id;
      } else {
        return errorResponse('Category not found', 400, null, event);
      }
    }

    if (updates.price !== undefined || updates.originalPrice !== undefined) {
      const price =
        updates.price !== undefined ? parseFloat(updates.price) : product.price;
      const originalPrice =
        updates.originalPrice !== undefined
          ? parseFloat(updates.originalPrice)
          : product.originalPrice;
      updates.discountPercentage = originalPrice
        ? Math.round((1 - price / originalPrice) * 100)
        : 0;
    }

    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key],
    );

    await product.update(updates);

    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'productImages' },
      ],
    });

    console.log(`✅ ORM: Updated product "${product.name}"`);
    return successResponse(updatedProduct?.toJSON(), 200, event);
  } catch (error) {
    console.error('❌ ORM Error updating product:', error);
    return errorResponse('Failed to update product', 500, null, event);
  }
};

export const deleteProduct = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== DELETE PRODUCT (ORM) ===');
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Product ID is required', 400, null, event);
    }

    const product = await Product.findByPk(id, {
      include: [{ model: ProductImage, as: 'productImages' }],
    });

    if (!product) {
      return errorResponse(`Product with ID ${id} not found`, 404, null, event);
    }

    // Delete all associated image database records
    await ProductImage.destroy({
      where: { productId: product.id },
    });

    // Delete the product itself
    await product.destroy();

    console.log(`✅ ORM: Deleted product "${product.name}"`);
    return successResponse(
      { message: 'Product deleted successfully' },
      200,
      event,
    );
  } catch (error) {
    console.error('❌ ORM Error deleting product:', error);
    return errorResponse('Failed to delete product', 500, null, event);
  }
};

export const searchProductsByStr = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return errorResponse('Query parameter is required', 400, null, event);
    }

    const products = await Product.findAll({
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
        {
          model: ProductImage,
          as: 'productImages',
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
    });

    return successResponse(products, 200, event);
  } catch (error) {
    console.error('Error searching products:', error);
    return errorResponse('Failed to search products', 500, null, event);
  }
};

export const searchByCategory = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { category } = event.pathParameters || {};

    if (!category || typeof category !== 'string') {
      return errorResponse('Category parameter is required', 400, null, event);
    }

    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          where: {
            name: { [Op.iLike]: `%${category}%` },
          },
        },
        {
          model: ProductImage,
          as: 'productImages',
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
    });

    return successResponse(products, 200, event);
  } catch (error) {
    console.error('Error searching products by category:', error);
    return errorResponse(
      'Failed to search products by category',
      500,
      null,
      event,
    );
  }
};
