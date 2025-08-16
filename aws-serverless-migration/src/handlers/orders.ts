import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';

export const createOrder = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = event.requestContext.authorizer?.userId;

    if (!userId) {
      return errorResponse('User not authenticated', 401);
    }

    const { items, shippingAddress, paymentMethod } = JSON.parse(
      event.body || '{}',
    );

    if (!items || !Array.isArray(items) || items.length === 0) {
      return errorResponse('Order items are required', 400);
    }

    if (!shippingAddress) {
      return errorResponse('Shipping address is required', 400);
    }

    // 计算总价
    const total = items.reduce((sum: number, item: any) => {
      return sum + item.price * item.quantity;
    }, 0);

    // 创建订单
    const order = {
      id: `order-${Date.now()}`,
      userId,
      items,
      total,
      shippingAddress,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // 这里应该是实际的数据库保存逻辑
    console.log('Creating order:', order);

    return successResponse(order, 201);
  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse('Failed to create order', 500);
  }
};
