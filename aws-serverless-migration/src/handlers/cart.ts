import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';

export const getCart = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    // 从authorizer context获取用户信息
    const userId = event.requestContext.authorizer?.userId;
    const userEmail = event.requestContext.authorizer?.email;
    const userRole = event.requestContext.authorizer?.role;

    console.log('Authenticated user:', { userId, userEmail, userRole });

    if (!userId) {
      return errorResponse('User not authenticated', 401, null, event);
    }

    // 这里应该是实际的数据库查询逻辑
    const cartItems = [
      // 示例数据
      {
        id: '1',
        productId: 'prod-1',
        productName: 'Sample Product',
        price: 29.99,
        quantity: 2,
        imageUrl: 'https://example.com/image.jpg',
      },
    ];

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    return successResponse(
      {
        userId,
        userEmail,
        items: cartItems,
        total,
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
      200,
      event,
    );
  } catch (error) {
    console.error('Get cart error:', error);
    return errorResponse('Failed to get cart', 500, null, event);
  }
};

export const addToCart = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.userId;

    if (!userId) {
      return errorResponse('User not authenticated', 401);
    }

    const { productId, quantity = 1 } = JSON.parse(event.body || '{}');

    if (!productId) {
      return errorResponse('Product ID is required', 400);
    }

    // 这里应该是实际的数据库操作逻辑
    const cartItem = {
      id: Date.now().toString(),
      userId,
      productId,
      quantity,
      addedAt: new Date().toISOString(),
    };

    return successResponse(cartItem, 201);
  } catch (error) {
    console.error('Add to cart error:', error);
    return errorResponse('Failed to add to cart', 500);
  }
};
