import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { getModels, getSequelize } from '../utils/sequelize-simple';

export const getProducts = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== GET PRODUCTS (REAL ORM) ===');
    console.log('Request path:', event.path);

    // 获取 Sequelize 模型
    const { Product, Category } = await getModels();

    // 使用真正的 Sequelize ORM 查询
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // 格式化数据，添加计算属性
    const formattedProducts = products.map((product: any) => {
      const data = product.toJSON();
      return {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice
          ? parseFloat(data.originalPrice)
          : null,
        category: data.category?.name || 'Uncategorized',
        // ORM 计算属性
        inStock: data.stock > 0,
        discountPercentage:
          data.originalPrice && data.originalPrice > 0
            ? Math.round(
                (1 - parseFloat(data.price) / parseFloat(data.originalPrice)) *
                  100,
              )
            : 0,
      };
    });

    console.log(`✅ REAL ORM: Returning ${formattedProducts.length} products`);
    return successResponse(formattedProducts, 200, event);
  } catch (error) {
    console.error('❌ REAL ORM Error fetching products:', error);
    return errorResponse('Failed to fetch products', 500, null, event);
  }
};

export const listAll = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== LIST ALL PRODUCTS (REAL ORM) ===');
    console.log('Request path:', event.path);

    const sequelize = await getSequelize();
    const { Product, Category } = await getModels();

    // 使用 Sequelize ORM 获取产品
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    // 使用 Sequelize 聚合查询获取分类统计
    const categoryStats = await Category.findAll({
      attributes: [
        'name',
        [sequelize.fn('COUNT', sequelize.col('products.id')), 'productCount'],
      ],
      include: [
        {
          model: Product,
          as: 'products',
          attributes: [],
        },
      ],
      group: ['Category.id', 'Category.name'],
      raw: true,
    });

    // 格式化产品数据
    const formattedProducts = products.map((product: any) => {
      const data = product.toJSON();
      return {
        ...data,
        price: parseFloat(data.price),
        originalPrice: data.originalPrice
          ? parseFloat(data.originalPrice)
          : null,
        category: data.category?.name || 'Uncategorized',
        inStock: data.stock > 0,
        discountPercentage:
          data.originalPrice && data.originalPrice > 0
            ? Math.round(
                (1 - parseFloat(data.price) / parseFloat(data.originalPrice)) *
                  100,
              )
            : 0,
      };
    });

    const response = {
      products: formattedProducts,
      total: formattedProducts.length,
      inStockCount: formattedProducts.filter((p) => p.inStock).length,
      categories: categoryStats.map((cat: any) => ({
        name: cat.name,
        productCount: parseInt(cat.productCount),
      })),
      priceRange:
        formattedProducts.length > 0
          ? {
              min: Math.min(...formattedProducts.map((p) => p.price)),
              max: Math.max(...formattedProducts.map((p) => p.price)),
            }
          : { min: 0, max: 0 },
      timestamp: new Date().toISOString(),
    };

    console.log(
      `✅ REAL ORM: Returning detailed info for ${formattedProducts.length} products`,
    );
    return successResponse(response, 200, event);
  } catch (error) {
    console.error('❌ REAL ORM Error listing all products:', error);
    return errorResponse('Failed to list all products', 500, null, event);
  }
};

export const getProduct = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== GET SINGLE PRODUCT (REAL ORM) ===');
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Product ID is required', 400, null, event);
    }

    const { Product, Category } = await getModels();

    // 使用 Sequelize ORM 的 findByPk
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!product) {
      return errorResponse(`Product with ID ${id} not found`, 404, null, event);
    }

    const data = (product as any).toJSON();
    const formattedProduct = {
      ...data,
      price: parseFloat(data.price),
      originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
      category: data.category?.name || 'Uncategorized',
      inStock: data.stock > 0,
      discountPercentage:
        data.originalPrice && data.originalPrice > 0
          ? Math.round(
              (1 - parseFloat(data.price) / parseFloat(data.originalPrice)) *
                100,
            )
          : 0,
    };

    console.log(`✅ REAL ORM: Found product "${formattedProduct.name}"`);
    return successResponse(formattedProduct, 200, event);
  } catch (error) {
    console.error('❌ REAL ORM Error fetching product:', error);
    return errorResponse('Failed to fetch product', 500, null, event);
  }
};

export const createProduct = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== CREATE PRODUCT (REAL ORM) ===');

    const body = JSON.parse(event.body || '{}');
    const {
      name,
      description,
      price,
      originalPrice,
      categoryId,
      stock,
      imageUrl,
    } = body;

    if (!name || !description || !price || !categoryId) {
      return errorResponse(
        'Name, description, price, and categoryId are required',
        400,
        null,
        event,
      );
    }

    const { Product, Category } = await getModels();

    // 使用 Sequelize ORM 验证分类存在
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return errorResponse('Invalid categoryId', 400, null, event);
    }

    // 使用 Sequelize ORM 创建产品
    const newProduct = await Product.create({
      name,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : null,
      categoryId: parseInt(categoryId),
      stock: stock || 0,
      imageUrl: imageUrl || null,
    });

    // 重新获取包含分类信息的产品
    const productWithCategory = await Product.findByPk((newProduct as any).id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    const data = (productWithCategory as any).toJSON();
    const formattedProduct = {
      ...data,
      price: parseFloat(data.price),
      originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
      category: data.category?.name || 'Uncategorized',
      inStock: data.stock > 0,
      discountPercentage:
        data.originalPrice && data.originalPrice > 0
          ? Math.round(
              (1 - parseFloat(data.price) / parseFloat(data.originalPrice)) *
                100,
            )
          : 0,
    };

    console.log(`✅ REAL ORM: Created product "${formattedProduct.name}"`);
    return successResponse(formattedProduct, 201, event);
  } catch (error) {
    console.error('❌ REAL ORM Error creating product:', error);
    return errorResponse('Failed to create product', 500, null, event);
  }
};

export const updateProduct = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== UPDATE PRODUCT (REAL ORM) ===');
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Product ID is required', 400, null, event);
    }

    const body = JSON.parse(event.body || '{}');
    const { Product, Category } = await getModels();

    // 使用 Sequelize ORM 查找产品
    const product = await Product.findByPk(id);
    if (!product) {
      return errorResponse(`Product with ID ${id} not found`, 404, null, event);
    }

    // 准备更新数据
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.price !== undefined) updateData.price = parseFloat(body.price);
    if (body.originalPrice !== undefined) {
      updateData.originalPrice = body.originalPrice
        ? parseFloat(body.originalPrice)
        : null;
    }
    if (body.categoryId !== undefined) {
      // 验证分类存在
      const category = await Category.findByPk(body.categoryId);
      if (!category) {
        return errorResponse('Invalid categoryId', 400, null, event);
      }
      updateData.categoryId = parseInt(body.categoryId);
    }
    if (body.stock !== undefined) updateData.stock = parseInt(body.stock);
    if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl;

    if (Object.keys(updateData).length === 0) {
      return errorResponse('No fields to update', 400, null, event);
    }

    // 使用 Sequelize ORM 更新
    await (product as any).update(updateData);

    // 重新获取更新后的产品
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    const data = (updatedProduct as any).toJSON();
    const formattedProduct = {
      ...data,
      price: parseFloat(data.price),
      originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
      category: data.category?.name || 'Uncategorized',
      inStock: data.stock > 0,
      discountPercentage:
        data.originalPrice && data.originalPrice > 0
          ? Math.round(
              (1 - parseFloat(data.price) / parseFloat(data.originalPrice)) *
                100,
            )
          : 0,
    };

    console.log(`✅ REAL ORM: Updated product "${formattedProduct.name}"`);
    return successResponse(formattedProduct, 200, event);
  } catch (error) {
    console.error('❌ REAL ORM Error updating product:', error);
    return errorResponse('Failed to update product', 500, null, event);
  }
};

export const deleteProduct = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== DELETE PRODUCT (REAL ORM) ===');
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Product ID is required', 400, null, event);
    }

    const { Product, Category } = await getModels();

    // 使用 Sequelize ORM 查找产品
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!product) {
      return errorResponse(`Product with ID ${id} not found`, 404, null, event);
    }

    const data = (product as any).toJSON();
    const deletedProductInfo = {
      id: data.id,
      name: data.name,
      category: data.category?.name || 'Uncategorized',
    };

    // 使用 Sequelize ORM 删除
    await (product as any).destroy();

    console.log(`✅ REAL ORM: Deleted product "${deletedProductInfo.name}"`);
    return successResponse(
      {
        message: 'Product deleted successfully',
        id,
        deletedProduct: deletedProductInfo,
      },
      200,
      event,
    );
  } catch (error) {
    console.error('❌ REAL ORM Error deleting product:', error);
    return errorResponse('Failed to delete product', 500, null, event);
  }
};
