import { AIMessage } from '@langchain/core/messages';
import { WorkflowBuilder } from './chat/workflow-builder';
import { MessageBuilder } from './chat/message-builder';
import { ChatHistoryService } from './chat/chat-history-service';
import { ChatValidation } from './chat/validation';

// 创建工作流实例
const workflowBuilder = new WorkflowBuilder();
const app: any = workflowBuilder.buildWorkflow();

// 主要的聊天服务函数
export const langChainGeminiChatService = async (
  message: string,
  userId = null,
  sessionId = null,
  imageBase64 = null,
) => {
  // 验证请求
  const validation = ChatValidation.validateChatRequest(
    message,
    sessionId,
    imageBase64,
  );
  if (!validation.isValid) {
    return { error: validation.error };
  }

  try {
    // 构建用户消息
    const inputMessage = MessageBuilder.buildUserMessage(message, imageBase64);

    // 配置
    const config = {
      configurable: { sessionId, userId },
    };

    // 通过 LangGraph 处理消息
    const finalState = await app.invoke({ messages: [inputMessage] }, config);

    let finalResult = null;
    if (finalState && finalState.messages && finalState.messages.length > 0) {
      const lastMessage = finalState.messages[finalState.messages.length - 1];
      if (lastMessage instanceof AIMessage) {
        finalResult = lastMessage.content;
      }
    }

    return {
      result: finalResult || '抱歉，我没有生成有效的回复。',
      sessionId,
      products: finalState?.products || [],
    };
  } catch (error: any) {
    console.error('Error in chat service:', error);
    console.error('Error stack:', error.stack);
    return {
      error: error.message || 'Chat service error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
};

// 导出历史记录相关函数
export const clearChatHistory = ChatHistoryService.clearHistory;
export const getChatHistoryMessages = ChatHistoryService.getHistoryMessages;
export const cleanInvalidMessages = ChatHistoryService.cleanInvalidMessages;
