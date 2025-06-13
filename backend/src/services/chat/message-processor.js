import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { extractQueryIntent } from '../../utils/intentParser.js';
import { searchProducts } from '../search-products-service.js';
import { getChatHistory } from '../../utils/MongoChatHistory.js';
import { createChatModel } from './model-config.js';

export class MessageProcessor {
  constructor() {
    this.model = createChatModel();
  }

  async processMessage(state, config) {
    console.log('processMessage called with state:', {
      messagesCount: state.messages?.length,
      configurable: config.configurable,
    });

    this.validateConfig(config);

    const { sessionId, userId } = config.configurable;
    const chatHistory = getChatHistory(sessionId, userId);

    const { allMessages, currentMessages } = await this.prepareMessages(
      state,
      chatHistory,
    );

    const responseText = await this.generateResponse(
      currentMessages,
      allMessages,
    );

    const aiMessage = new AIMessage(responseText);
    await chatHistory.addMessage(aiMessage);

    return { messages: [aiMessage] };
  }

  validateConfig(config) {
    if (!config.configurable?.sessionId) {
      throw new Error(
        "Make sure that the config includes the following information: {'configurable': {'sessionId': 'some_value'}}",
      );
    }
  }

  async prepareMessages(state, chatHistory) {
    const historicalMessages = await chatHistory.getMessages();
    const currentMessages = state.messages || [];
    const allMessages = [...historicalMessages, ...currentMessages];

    console.log('Processing messages:', {
      historical: historicalMessages.length,
      current: currentMessages.length,
      total: allMessages.length,
    });

    // 添加新的用户消息到历史记录
    if (currentMessages.length > 0) {
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (lastMessage instanceof HumanMessage) {
        await chatHistory.addMessage(lastMessage);
      }
    }

    return { allMessages, currentMessages };
  }

  async generateResponse(currentMessages, allMessages) {
    try {
      const latestHumanMessage = currentMessages.find(
        (msg) => msg instanceof HumanMessage,
      );

      const { textContent, imageBase64 } =
        this.extractMessageContent(latestHumanMessage);
      const intent = await extractQueryIntent(textContent, imageBase64);

      console.log('Extracted Intent:', intent);

      if (intent.intentType === 'product_query') {
        return await this.handleProductQuery(intent);
      } else {
        return await this.handleGeneralChat(allMessages);
      }
    } catch (error) {
      console.error('Error in message generation:', error);
      return '抱歉，我暂时无法处理您的请求。请稍后重试。';
    }
  }

  extractMessageContent(message) {
    const userMessage = message?.content;
    let imageBase64 = null;
    let textContent = '';

    if (typeof userMessage === 'object' && Array.isArray(userMessage)) {
      const imageContent = userMessage.find(
        (content) => content.type === 'image_url',
      );
      if (imageContent) {
        imageBase64 = imageContent.image_url.url;
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

  async handleProductQuery(intent) {
    const products = await searchProducts(intent.categories[0]);

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

  async handleGeneralChat(allMessages) {
    const llmResponse = await this.model.invoke(allMessages);
    return llmResponse.content;
  }
}
