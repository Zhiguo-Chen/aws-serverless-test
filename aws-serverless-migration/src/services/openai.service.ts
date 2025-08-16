import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const openaiChatService = async (
  message: string,
  userId: string = 'anonymous',
  sessionId: string | null = null,
  imageBase64: string | null = null,
) => {
  try {
    console.log('OpenAI chat service called:', {
      messageLength: message.length,
      userId,
      sessionId,
      hasImage: !!imageBase64,
    });

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return { error: 'Message is required and must be a non-empty string.' };
    }

    if (!process.env.OPENAI_API_KEY) {
      return { error: 'OpenAI API key is not configured' };
    }

    // 生成或使用现有的sessionId
    const currentSessionId =
      sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 构建消息内容
    const messageContent: any[] = [
      {
        type: 'text',
        text: message,
      },
    ];

    // 如果有图片，添加到消息中
    if (imageBase64) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    }

    // 这里应该从数据库加载历史对话
    // const chatHistory = await loadChatHistory(currentSessionId, userId);

    // 临时使用简单的消息数组
    const messages = [
      {
        role: 'system',
        content:
          'You are a helpful AI assistant for an e-commerce platform. You can help users with product recommendations, order information, and general questions.',
      },
      {
        role: 'user',
        content: messageContent,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // 使用支持图片的模型
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return { error: 'No response from OpenAI' };
    }

    // 这里应该保存对话到数据库
    // await saveChatMessage(currentSessionId, userId, message, aiResponse);

    console.log('OpenAI response generated:', {
      responseLength: aiResponse.length,
      sessionId: currentSessionId,
    });

    return {
      result: aiResponse,
      sessionId: currentSessionId,
      model: 'openai',
    };
  } catch (error: any) {
    console.error('OpenAI chat service error:', error);
    return {
      error: error.message || 'OpenAI service error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
};
