import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { openaiChatService } from '../services/openai.service';
import { geminiChatService } from '../services/gemini.service';
import { grokChatService } from '../services/grok.service';

export const handleMessage = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    console.log('Chat request:', JSON.stringify(event, null, 2));

    const {
      message,
      model = 'openai',
      sessionId,
      imageBase64,
    } = JSON.parse(event.body || '{}');

    // 验证必需参数
    if (!message || typeof message !== 'string' || message.trim() === '') {
      return errorResponse(
        'Message is required and must be a non-empty string',
        400,
        null,
        event,
      );
    }

    // 获取用户ID（如果需要认证，可以从授权器上下文获取）
    const userId = event.requestContext?.authorizer?.userId || 'anonymous';

    console.log('Chat parameters:', {
      message: message.substring(0, 100) + '...',
      model,
      sessionId,
      userId,
      hasImage: !!imageBase64,
    });

    let modelResponse: any;

    // 根据模型类型调用不同的服务
    switch (model.toLowerCase()) {
      case 'grok':
        modelResponse = await grokChatService(
          message,
          userId,
          sessionId,
          imageBase64,
        );
        break;

      case 'gemini':
        modelResponse = await geminiChatService(
          message,
          userId,
          sessionId,
          imageBase64,
        );
        break;

      case 'openai':
      default:
        modelResponse = await openaiChatService(
          message,
          userId,
          sessionId,
          imageBase64,
        );
        break;
    }

    // 检查服务响应是否有错误
    if (modelResponse?.error) {
      console.error('Chat service error:', modelResponse.error);
      return errorResponse(
        modelResponse.error,
        500,
        modelResponse.details,
        event,
      );
    }

    // 返回成功响应
    const response = {
      response: modelResponse.result || modelResponse.response,
      sessionId: modelResponse.sessionId,
      model: model,
      ...(modelResponse.products && { products: modelResponse.products }),
    };

    console.log('Chat response:', {
      responseLength: response.response?.length || 0,
      sessionId: response.sessionId,
      model: response.model,
    });

    return successResponse(response, 200, event);
  } catch (error) {
    console.error('Chat handler error:', error);
    return errorResponse(
      'Internal server error',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined,
      event,
    );
  }
};

// 获取聊天历史
export const getChatHistory = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { sessionId } = event.pathParameters || {};
    const userId = event.requestContext?.authorizer?.userId;

    if (!sessionId) {
      return errorResponse('Session ID is required', 400, null, event);
    }

    // 这里应该从数据库获取聊天历史
    // const history = await getChatHistoryFromDB(sessionId, userId);

    // 临时返回示例数据
    const history = [
      {
        id: '1',
        role: 'user',
        message: 'Hello, how can you help me?',
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        role: 'assistant',
        message:
          'I can help you with product recommendations, order information, and general questions about our store.',
        timestamp: new Date().toISOString(),
      },
    ];

    return successResponse(
      {
        sessionId,
        history,
        count: history.length,
      },
      200,
      event,
    );
  } catch (error) {
    console.error('Get chat history error:', error);
    return errorResponse('Failed to get chat history', 500, null, event);
  }
};

// 清除聊天历史
export const clearChatHistory = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const { sessionId } = event.pathParameters || {};
    const userId = event.requestContext?.authorizer?.userId;

    if (!sessionId) {
      return errorResponse('Session ID is required', 400, null, event);
    }

    // 这里应该从数据库清除聊天历史
    // await clearChatHistoryFromDB(sessionId, userId);

    console.log('Clearing chat history:', { sessionId, userId });

    return successResponse(
      {
        message: 'Chat history cleared successfully',
        sessionId,
      },
      200,
      event,
    );
  } catch (error) {
    console.error('Clear chat history error:', error);
    return errorResponse('Failed to clear chat history', 500, null, event);
  }
};
