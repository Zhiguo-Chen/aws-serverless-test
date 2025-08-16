import OpenAI from 'openai';

// Grok使用OpenAI兼容的API
const grokClient = new OpenAI({
  apiKey: process.env.GROK_API_KEY || process.env.XAI_API_KEY,
  baseURL: 'https://api.x.ai/v1',
});

export const grokChatService = async (
  message: string,
  userId: string = 'anonymous',
  sessionId: string | null = null,
  imageBase64: string | null = null,
) => {
  try {
    console.log('Grok chat service called:', {
      messageLength: message.length,
      userId,
      sessionId,
      hasImage: !!imageBase64,
    });

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return { error: 'Message is required and must be a non-empty string.' };
    }

    if (!process.env.GROK_API_KEY && !process.env.XAI_API_KEY) {
      return { error: 'Grok API key is not configured' };
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

    // Grok目前可能不支持图片，但保留接口
    if (imageBase64) {
      console.warn('Grok may not support image input yet');
      // messageContent.push({
      //   type: 'image_url',
      //   image_url: {
      //     url: `data:image/jpeg;base64,${imageBase64}`,
      //   },
      // });
    }

    // 这里应该从数据库加载历史对话
    // const chatHistory = await loadChatHistory(currentSessionId, userId);

    const messages = [
      {
        role: 'system',
        content:
          'You are Grok, a helpful AI assistant with a bit of wit and humor. You can help users with various questions and tasks.',
      },
      {
        role: 'user',
        content: imageBase64 ? messageContent : message,
      },
    ];

    const completion = await grokClient.chat.completions.create({
      model: 'grok-beta',
      messages: messages as any,
      max_tokens: 1000,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content;

    if (!aiResponse) {
      return { error: 'No response from Grok' };
    }

    // 这里应该保存对话到数据库
    // await saveChatMessage(currentSessionId, userId, message, aiResponse);

    console.log('Grok response generated:', {
      responseLength: aiResponse.length,
      sessionId: currentSessionId,
    });

    return {
      result: aiResponse,
      sessionId: currentSessionId,
      model: 'grok',
    };
  } catch (error: any) {
    console.error('Grok chat service error:', error);
    return {
      error: error.message || 'Grok service error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
};
