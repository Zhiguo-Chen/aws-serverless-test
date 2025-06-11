import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import 'dotenv/config';
import { extractQueryIntent } from '../utils/intentParser.js';
import { searchProducts } from './search-products-service.js';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import mongoose from 'mongoose';
import { mongoClientReady, connectMongoDB } from '../config/mongodb.js';

// 自定义聊天历史类
class CustomMongoDBChatMessageHistory {
  constructor(sessionId, collectionName = 'chat_histories') {
    this.sessionId = sessionId;
    this.collectionName = collectionName;
  }

  async getMessages() {
    try {
      if (!mongoose.connection.db) {
        throw new Error('MongoDB connection not available');
      }

      const collection = mongoose.connection.db.collection(this.collectionName);
      const doc = await collection.findOne({ sessionId: this.sessionId });

      if (!doc || !doc.messages) {
        return [];
      }

      // 转换存储的消息格式为 LangChain 消息格式
      return doc.messages.map((msg) => {
        if (msg.type === 'human') {
          return new HumanMessage(msg.content);
        } else if (msg.type === 'ai') {
          return new AIMessage(msg.content);
        }
        return msg;
      });
    } catch (error) {
      console.error('Error getting messages from custom history:', error);
      return [];
    }
  }

  async addMessage(message) {
    try {
      if (!mongoose.connection.db) {
        throw new Error('MongoDB connection not available');
      }

      const collection = mongoose.connection.db.collection(this.collectionName);

      // 将 LangChain 消息转换为存储格式
      let messageToStore;
      if (message instanceof HumanMessage) {
        messageToStore = { type: 'human', content: message.content };
      } else if (message instanceof AIMessage) {
        messageToStore = { type: 'ai', content: message.content };
      } else {
        messageToStore = message;
      }

      await collection.updateOne(
        { sessionId: this.sessionId },
        {
          $push: { messages: messageToStore },
          $set: {
            updatedAt: new Date(),
            sessionId: this.sessionId,
          },
        },
        { upsert: true },
      );
    } catch (error) {
      console.error('Error adding message to custom history:', error);
      throw error;
    }
  }

  async clear() {
    try {
      if (!mongoose.connection.db) {
        throw new Error('MongoDB connection not available');
      }

      const collection = mongoose.connection.db.collection(this.collectionName);
      await collection.updateOne(
        { sessionId: this.sessionId },
        { $set: { messages: [], updatedAt: new Date() } },
      );
    } catch (error) {
      console.error('Error clearing custom history:', error);
      throw error;
    }
  }
}

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

const chain = model.pipe(new StringOutputParser());

let chainWithHistory = null;

// 初始化聊天历史链（使用自定义实现）
export async function initializeChatHistoryChain() {
  if (chainWithHistory) {
    console.log('Chat history chain already initialized.');
    return;
  }

  try {
    // 确保 MongoDB 连接已建立
    const connection = await connectMongoDB();

    // 等待连接完全稳定
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for MongoDB connection to stabilize...');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    console.log('MongoDB connection state:', mongoose.connection.readyState);
    console.log('Database name:', mongoose.connection.db?.databaseName);

    // 验证数据库对象是否可用
    if (!mongoose.connection.db) {
      throw new Error('MongoDB database object is not available');
    }

    chainWithHistory = new RunnableWithMessageHistory({
      runnable: chain,
      getMessageHistory: async (sessionId) => {
        try {
          // 再次检查连接状态
          if (mongoose.connection.readyState !== 1) {
            console.warn('MongoDB connection lost, attempting to reconnect...');
            await connectMongoDB();
          }

          // 确保数据库连接可用
          if (!mongoose.connection.db) {
            throw new Error('MongoDB database connection not available');
          }

          console.log(`Creating custom chat history for session: ${sessionId}`);

          // 使用自定义聊天历史实现
          return new CustomMongoDBChatMessageHistory(sessionId);
        } catch (error) {
          console.error(
            'Error creating message history for session:',
            sessionId,
            error,
          );
          throw error;
        }
      },
      inputMessagesKey: 'input',
      historyMessagesKey: 'history',
    });

    console.log('Custom chat history chain initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize chat history chain:', error);
    throw error;
  }
}

export const langChainGeminiChatService = async (
  message,
  userId = null,
  sessionId = null,
  imageBase64 = null,
) => {
  console.log('LangChain Gemini Chat Service called with:', {
    message,
    userId,
    sessionId,
    imageBase64: imageBase64 ? 'present' : 'not present',
  });

  // 基本验证
  if (!sessionId) {
    return { error: 'Session ID is required for conversational chat.' };
  }
  if (!message && !imageBase64) {
    return { error: 'Message or image content is required.' };
  }

  try {
    // 检查并确保 MongoDB 连接
    console.log(
      'Current MongoDB connection state:',
      mongoose.connection.readyState,
    );

    if (!mongoClientReady || mongoose.connection.readyState !== 1) {
      console.log('MongoDB not ready, attempting to connect...');
      await connectMongoDB();

      // 等待连接稳定
      let retries = 0;
      const maxRetries = 5;
      while (mongoose.connection.readyState !== 1 && retries < maxRetries) {
        console.log(
          `Waiting for MongoDB connection... (${retries + 1}/${maxRetries})`,
        );
        await new Promise((resolve) => setTimeout(resolve, 1000));
        retries++;
      }

      if (mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB connection failed after retries');
      }
    }

    // 验证数据库对象
    if (!mongoose.connection.db) {
      throw new Error('MongoDB database object not available');
    }

    // 确保聊天历史链已初始化
    if (!chainWithHistory) {
      console.warn('Chat history chain not initialized. Initializing now...');
      await initializeChatHistoryChain();

      if (!chainWithHistory) {
        throw new Error('Failed to initialize chat history chain');
      }
    }

    // 提取意图
    const intent = await extractQueryIntent(message, imageBase64);
    console.log('Extracted Intent:', intent);

    let responseText = '抱歉，我没有理解您的请求。';
    const config = { configurable: { sessionId } };

    if (intent.intentType === 'product_query') {
      // 处理产品查询
      const products = await searchProducts(intent.categories[0]);
      if (products.length > 0) {
        const formattedProducts = products.map((product) =>
          product.get({ plain: true }),
        );
        const productSummaryPrompt = `以下是用户查询到的商品信息，请你对这些信息进行简洁明了的总结，并以友好的方式回复用户。只提供商品的关键信息，例如商品名称、价格、简要描述等。如果商品数量较多，可以挑选几个有代表性的进行介绍。
商品信息：${JSON.stringify(formattedProducts)}`;

        try {
          const llmResponse = await chainWithHistory.invoke(
            [new HumanMessage(productSummaryPrompt)],
            config,
          );
          responseText = llmResponse;
        } catch (error) {
          console.error('Error sending product info to LLM:', error);
          console.error('Error stack:', error.stack);
          responseText = '抱歉，在总结商品信息时遇到了问题。';
        }
      } else {
        responseText = `抱歉，没有找到关于"${intent.categories[0]}"的商品。`;
      }
    } else {
      // 处理一般聊天
      try {
        const messageContent = [];

        if (message && typeof message === 'string' && message.trim() !== '') {
          messageContent.push({ type: 'text', text: message });
        }

        if (imageBase64) {
          messageContent.push({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${imageBase64}`,
            },
          });
        }

        if (messageContent.length === 0) {
          return {
            error:
              'No valid text or image content to process for general chat.',
          };
        }

        console.log(
          'Invoking chain with custom history for session:',
          sessionId,
        );
        const llmResponse = await chainWithHistory.invoke(
          [new HumanMessage({ content: messageContent })],
          config,
        );
        responseText = llmResponse;
        console.log('LLM response received successfully');
      } catch (error) {
        console.error('Error sending message to LLM:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        responseText = '抱歉，我暂时无法处理您的请求。请稍后重试。';
      }
    }

    return { result: responseText, sessionId };
  } catch (error) {
    console.error('Error in chat service:', error);
    console.error('Error stack:', error.stack);
    return {
      error: error.message || 'Chat service error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
};
