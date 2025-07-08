import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { ChatHistory } from '../models/ChatSessionHistory.mongo';

export class MongoChatHistory {
  sessionId: string;
  userId: string | null;
  constructor(sessionId: string, userId = null) {
    this.sessionId = sessionId;
    this.userId = userId;
  }

  async getMessages() {
    try {
      const chatHistory = await ChatHistory.findOne({
        sessionId: this.sessionId,
      });
      if (!chatHistory || !chatHistory.messages) {
        return [];
      }

      // Convert to LangChain Message format
      return chatHistory.messages.map((msg) => {
        if (msg.type === 'human') {
          return new HumanMessage(msg.content);
        } else {
          return new AIMessage(msg.content);
        }
      });
    } catch (error) {
      console.error('Error getting messages from MongoDB:', error);
      return [];
    }
  }

  async addMessage(message: any) {
    try {
      const messageType = message instanceof HumanMessage ? 'human' : 'ai';
      const messageData = {
        type: messageType,
        content: message.content,
        timestamp: new Date(),
      };

      await ChatHistory.findOneAndUpdate(
        { sessionId: this.sessionId },
        {
          $push: { messages: messageData },
          $set: {
            updatedAt: new Date(),
            ...(this.userId && { userId: this.userId }),
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );
    } catch (error) {
      console.error('Error adding message to MongoDB:', error);
      throw error;
    }
  }

  async clearHistory() {
    try {
      await ChatHistory.deleteOne({ sessionId: this.sessionId });
    } catch (error) {
      console.error('Error clearing chat history:', error);
      throw error;
    }
  }
}

// Factory function to get chat history
export const getChatHistory = (sessionId: string, userId = null) => {
  return new MongoChatHistory(sessionId, userId);
};