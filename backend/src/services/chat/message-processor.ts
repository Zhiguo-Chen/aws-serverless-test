import { AIMessage, HumanMessage } from '@langchain/core/messages';
import {
  enhanceIntentWithHistory,
  extractQueryIntent,
} from '../../utils/intentParser';
import { searchProducts } from '../search-products-service';
import { getChatHistory, MongoChatHistory } from '../../utils/MongoChatHistory';
import { createChatModel } from './model-config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

export class MessageProcessor {
  model: ChatGoogleGenerativeAI;
  constructor() {
    this.model = createChatModel();
  }

  async processMessage(state: any, config: any) {
    this.validateConfig(config);

    const { sessionId, userId } = config.configurable;
    const chatHistory = getChatHistory(sessionId, userId);

    const { allMessages, currentMessages } = await this.prepareMessages(
      state,
      chatHistory,
    );

    const responseText: any = await this.generateResponse(
      currentMessages,
      allMessages,
    );

    const aiMessage = new AIMessage(responseText);
    await chatHistory.addMessage(aiMessage);

    return { messages: [aiMessage] };
  }

  validateConfig(config: any) {
    if (!config.configurable?.sessionId) {
      throw new Error(
        "Make sure that the config includes the following information: {'configurable': {'sessionId': 'some_value'}}",
      );
    }
  }

  async prepareMessages(state: any, chatHistory: MongoChatHistory) {
    const historicalMessages = await chatHistory.getMessages();
    const currentMessages = state.messages || [];

    // 过滤掉无效的历史消息
    const validHistoricalMessages = historicalMessages.filter((msg: any) => {
      if (!msg || !msg.content) return false;

      // 如果是字符串内容，检查是否为空
      if (typeof msg.content === 'string') {
        return msg.content.trim().length > 0;
      }

      // 如果是数组内容，检查是否有有效的部分
      if (Array.isArray(msg.content)) {
        return msg.content.some((part: any) => {
          if (
            part.type === 'text' &&
            part.text &&
            part.text.trim().length > 0
          ) {
            return true;
          }
          if (
            part.type === 'image_url' &&
            part.image_url &&
            part.image_url.url
          ) {
            return true;
          }
          return false;
        });
      }

      return false;
    });

    const allMessages = [...validHistoricalMessages, ...currentMessages];

    // 添加新的用户消息到历史记录
    if (currentMessages.length > 0) {
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (
        lastMessage instanceof HumanMessage &&
        this.isValidMessage(lastMessage)
      ) {
        await chatHistory.addMessage(lastMessage);
      }
    }

    return { allMessages: allMessages, currentMessages };
  }

  isValidMessage(message: any) {
    if (!message || !message.content) return false;

    if (typeof message.content === 'string') {
      return message.content.trim().length > 0;
    }

    if (Array.isArray(message.content)) {
      return message.content.some((part: any) => {
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

  async generateResponse(currentMessages: any, allMessages: any) {
    try {
      const latestHumanMessage = currentMessages.find(
        (msg: any) => msg instanceof HumanMessage,
      );

      const { textContent, imageBase64 } =
        this.extractMessageContent(latestHumanMessage);

      const intent = await extractQueryIntent(textContent, imageBase64);

      console.log('Extracted Intent:', intent);

      if (intent.intentType === 'product_query') {
        return await this.handleProductQuery(intent, allMessages);
      } else {
        return await this.handleGeneralChat(allMessages);
      }
    } catch (error) {
      console.error('Error in message generation:', error);
      return '抱歉，我暂时无法处理您的请求。请稍后重试。';
    }
  }

  extractMessageContent(message: any) {
    const userMessage = message?.content;
    let imageBase64 = null;
    let textContent = '';

    if (typeof userMessage === 'object' && Array.isArray(userMessage)) {
      const imageContent = userMessage.find(
        (content) => content.type === 'image_url',
      );
      if (
        imageContent &&
        imageContent.image_url &&
        imageContent.image_url.url
      ) {
        // 提取纯 base64 数据，去掉 data:image/jpeg;base64, 前缀
        const fullUrl = imageContent.image_url.url;
        if (fullUrl.startsWith('data:image/')) {
          const base64Match = fullUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
          if (base64Match) {
            imageBase64 = base64Match[1]; // 只保留纯 base64 部分
          }
        } else {
          imageBase64 = fullUrl; // 如果已经是纯 base64，直接使用
        }
      }

      const textContentObj = userMessage.find(
        (content) => content.type === 'text',
      );
      textContent = textContentObj?.text || '';
    } else if (typeof userMessage === 'string') {
      textContent = userMessage;
    }

    return { textContent, imageBase64 };
  }

  async handleProductQuery(intent: any, allMessages: any[]) {
    let category;
    if (intent && (!intent.categories || intent.categories.length === 0)) {
      console.log('No categories found in intent, enhancing with history...');
      const enhancedIntent = await enhanceIntentWithHistory(
        intent,
        allMessages,
      );
      if (enhancedIntent.categories && enhancedIntent.categories.length > 0) {
        category = enhancedIntent.categories[0];
      }
    } else if (intent.categories.length > 0) {
      category = intent.categories[0];
    }
    if (!category) {
      return `抱歉，没有找到相关的商品。`;
    }
    const products = await searchProducts(category);

    if (products.length > 0) {
      const formattedProducts = products.map((product) =>
        product.get({ plain: true }),
      );

      const productSummaryPrompt = `以下是用户查询到的商品信息，请你对这些信息进行简洁明了的总结，并以友好的方式回复用户。只提供商品的关键信息，例如商品名称、价格、简要描述等。如果商品数量较多，可以挑选几个有代表性的进行介绍。
商品信息：${JSON.stringify(formattedProducts)}`;

      const llmResponse = await this.model.invoke([
        new HumanMessage(productSummaryPrompt),
      ]);

      return llmResponse.content;
    } else {
      return `抱歉，没有找到关于"${intent.categories[0]}"的商品。`;
    }
  }

  async handleGeneralChat(allMessages: any[]) {
    // 过滤掉无效的消息
    const validMessages = allMessages.filter((msg) => this.isValidMessage(msg));

    if (validMessages.length === 0) {
      return '抱歉，没有找到有效的对话内容。';
    }

    const llmResponse = await this.model.invoke(validMessages);
    return llmResponse.content;
  }
}
