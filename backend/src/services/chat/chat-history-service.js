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

      // 过滤并格式化消息
      const validMessages = messages
        .filter((msg) => this.isValidMessage(msg))
        .map((msg) => ({
          type: msg instanceof HumanMessage ? 'human' : 'ai',
          content: msg.content,
          timestamp: msg.timestamp,
        }));

      return {
        success: true,
        messages: validMessages,
      };
    } catch (error) {
      console.error('Error getting chat history:', error);
      return { success: false, error: error.message };
    }
  }

  static isValidMessage(message) {
    if (!message || !message.content) return false;

    if (typeof message.content === 'string') {
      return message.content.trim().length > 0;
    }

    if (Array.isArray(message.content)) {
      return message.content.some((part) => {
        if (part.type === 'text' && part.text && part.text.trim().length > 0) {
          return true;
        }
        if (part.type === 'image_url' && part.image_url && part.image_url.url) {
          return true;
        }
        return false;
      });
    }

    return false;
  }

  // 新增：清理无效的历史消息
  static async cleanInvalidMessages(sessionId) {
    try {
      const chatHistory = getChatHistory(sessionId);
      const messages = await chatHistory.getMessages();

      const validMessages = messages.filter((msg) => this.isValidMessage(msg));

      if (validMessages.length < messages.length) {
        // 如果有无效消息，清空历史并重新添加有效消息
        await chatHistory.clearHistory();
        for (const msg of validMessages) {
          await chatHistory.addMessage(msg);
        }

        console.log(
          `Cleaned ${
            messages.length - validMessages.length
          } invalid messages from session ${sessionId}`,
        );
      }

      return { success: true, cleaned: messages.length - validMessages.length };
    } catch (error) {
      console.error('Error cleaning chat history:', error);
      return { success: false, error: error.message };
    }
  }
}
