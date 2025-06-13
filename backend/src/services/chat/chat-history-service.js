import { HumanMessage } from '@langchain/core/messages';
import { getChatHistory } from '../../utils/MongoChatHistory.js';

export class ChatHistoryService {
  static async clearHistory(sessionId) {
    try {
      const chatHistory = getChatHistory(sessionId);
      await chatHistory.clearHistory();
      return { success: true, message: 'Chat history cleared successfully' };
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return { success: false, error: error.message };
    }
  }

  static async getHistoryMessages(sessionId) {
    try {
      const chatHistory = getChatHistory(sessionId);
      const messages = await chatHistory.getMessages();
      return {
        success: true,
        messages: messages.map((msg) => ({
          type: msg instanceof HumanMessage ? 'human' : 'ai',
          content: msg.content,
          timestamp: msg.timestamp,
        })),
      };
    } catch (error) {
      console.error('Error getting chat history:', error);
      return { success: false, error: error.message };
    }
  }
}
