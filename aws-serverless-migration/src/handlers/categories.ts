import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';

// 示例分类数据
const sampleCategories = [
  {
    id: '1',
    name: 'Electronics',
    description: 'Electronic devices and gadgets',
    imageUrl: 'https://example.com/electronics.jpg',
    productCount: 15,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Clothing',
    description: 'Fashion and apparel',
    imageUrl: 'https://example.com/clothing.jpg',
    productCount: 8,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Home & Garden',
    description: 'Home improvement and garden supplies',
    imageUrl: 'https://example.com/home-garden.jpg',
    productCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Sports & Outdoors',
    description: 'Sports equipment and outdoor gear',
    imageUrl: 'https://example.com/sports.jpg',
    productCount: 6,
    createdAt: new Date().toISOString(),
  },
];

export const getCategories = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== GET CATEGORIES ===');
    console.log('Request path:', event.path);
    console.log('Query parameters:', event.queryStringParameters);

    // 这里应该是实际的数据库查询逻辑
    // await connectToDatabase();
    // const categories = await Category.findAll();

    console.log(`Returning ${sampleCategories.length} categories`);
    return successResponse(sampleCategories, 200, event);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return errorResponse('Failed to fetch categories', 500, null, event);
  }
};

export const getCategory = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== GET SINGLE CATEGORY ===');
    console.log('Request path:', event.path);
    console.log('Path parameters:', event.pathParameters);

    const { id } = event.pathParameters || {};

    if (!id) {
      console.log('No category ID provided');
      return errorResponse('Category ID is required', 400, null, event);
    }

    console.log('Looking for category with ID:', id);
    console.log(
      'Available category IDs:',
      sampleCategories.map((c) => c.id),
    );

    const category = sampleCategories.find((c) => c.id === id);

    if (!category) {
      console.log(`Category with ID ${id} not found`);
      return errorResponse(
        `Category with ID ${id} not found`,
        404,
        null,
        event,
      );
    }

    console.log('Category found:', category.name);
    return successResponse(category, 200, event);
  } catch (error) {
    console.error('Error fetching category:', error);
    return errorResponse('Failed to fetch category', 500, null, event);
  }
};

export const createCategory = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('=== CREATE CATEGORY ===');
    console.log('Request body:', event.body);

    const body = JSON.parse(event.body || '{}');
    const { name, description, imageUrl } = body;

    if (!name || !description) {
      return errorResponse(
        'Name and description are required',
        400,
        null,
        event,
      );
    }

    const category = {
      id: Date.now().toString(),
      name,
      description,
      imageUrl: imageUrl || '',
      productCount: 0,
      createdAt: new Date().toISOString(),
    };

    // 这里应该是实际的数据库保存逻辑
    console.log('Creating category:', category);

    return successResponse(category, 201, event);
  } catch (error) {
    console.error('Error creating category:', error);
    return errorResponse('Failed to create category', 500, null, event);
  }
};

export const updateCategory = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Category ID is required', 400, null, event);
    }

    const body = JSON.parse(event.body || '{}');

    // 这里应该是实际的数据库更新逻辑
    const updatedCategory = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return successResponse(updatedCategory, 200, event);
  } catch (error) {
    console.error('Error updating category:', error);
    return errorResponse('Failed to update category', 500, null, event);
  }
};

export const deleteCategory = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters || {};

    if (!id) {
      return errorResponse('Category ID is required', 400, null, event);
    }

    // 这里应该是实际的数据库删除逻辑
    console.log('Deleting category:', id);

    return successResponse(
      { message: 'Category deleted successfully', id },
      200,
      event,
    );
  } catch (error) {
    console.error('Error deleting category:', error);
    return errorResponse('Failed to delete category', 500, null, event);
  }
};
