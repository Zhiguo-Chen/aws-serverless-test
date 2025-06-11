import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import 'dotenv/config';
import { extractQueryIntent } from '../utils/intentParser.js';
import { searchProducts } from './search-products-service.js';
import { HumanMessage, AIMessage } from '@langchain/core/messages';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableWithMessageHistory } from '@langchain/core/runnables';
import mongoose from 'mongoose';
import { mongoClientReady, connectMongoDB } from '../config/mongodb.js';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

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
    // 提取意图
    const intent = await extractQueryIntent(message, imageBase64);
    console.log('Extracted Intent:', intent);

    let responseText = '抱歉，我没有理解您的请求。';

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
          const llmResponse = await model.invoke([
            new HumanMessage(productSummaryPrompt),
          ]);
          responseText = llmResponse.content;
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

        const llmResponse = await model.invoke([
          new HumanMessage({ content: messageContent }),
        ]);
        responseText = llmResponse.content;
        console.log('LLM response received successfully');
      } catch (error) {
        console.error('Error sending message to LLM:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);

        responseText = '抱歉，我暂时无法处理您的请求。请稍后重试。';
      }
    }

    console.log('Final response text:', responseText);

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
