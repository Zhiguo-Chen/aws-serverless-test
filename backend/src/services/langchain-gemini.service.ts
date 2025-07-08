import { AIMessage } from '@langchain/core/messages';
import { WorkflowBuilder } from './chat/workflow-builder';
import { MessageBuilder } from './chat/message-builder';
import { ChatHistoryService } from './chat/chat-history-service';
import { ChatValidation } from './chat/validation';

// Create workflow instance
const workflowBuilder = new WorkflowBuilder();
const app: any = workflowBuilder.buildWorkflow();

// Main chat service function
export const langChainGeminiChatService = async (
  message: string,
  userId = null,
  sessionId = null,
  imageBase64 = null,
) => {
  // Validate request
  const validation = ChatValidation.validateChatRequest(
    message,
    sessionId,
    imageBase64,
  );
  if (!validation.isValid) {
    return { error: validation.error };
  }

  try {
    // Build user message
    const inputMessage = MessageBuilder.buildUserMessage(message, imageBase64);

    // Config
    const config = {
      configurable: { sessionId, userId },
    };

    // Process message through LangGraph
    const finalState = await app.invoke({ messages: [inputMessage] }, config);

    let finalResult = null;
    if (finalState && finalState.messages && finalState.messages.length > 0) {
      const lastMessage = finalState.messages[finalState.messages.length - 1];
      if (lastMessage instanceof AIMessage) {
        finalResult = lastMessage.content;
      }
    }

    return {
      result: finalResult || 'Sorry, I did not generate a valid response.',
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

// Export history related functions
export const clearChatHistory = ChatHistoryService.clearHistory;
export const getChatHistoryMessages = ChatHistoryService.getHistoryMessages;
export const cleanInvalidMessages = ChatHistoryService.cleanInvalidMessages;