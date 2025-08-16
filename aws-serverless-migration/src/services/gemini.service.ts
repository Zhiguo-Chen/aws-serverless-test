import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const geminiChatService = async (
  message: string,
  userId: string = 'anonymous',
  sessionId: string | null = null,
  imageBase64: string | null = null,
) => {
  try {
    console.log('Gemini chat service called:', {
      messageLength: message.length,
      userId,
      sessionId,
      hasImage: !!imageBase64,
    });

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return { error: 'Message is required and must be a non-empty string.' };
    }

    if (!process.env.GEMINI_API_KEY) {
      return { error: 'Gemini API key is not configured' };
    }

    // 生成或使用现有的sessionId
    const currentSessionId =
      sessionId ||
      `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 选择模型（支持图片的模型）
    const model = genAI.getGenerativeModel({
      model: imageBase64 ? 'gemini-1.5-flash' : 'gemini-1.5-flash',
    });

    // 构建消息内容
    const parts: any[] = [{ text: message }];

    // 如果有图片，添加到消息中
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      });
    }

    // 这里应该从数据库加载历史对话并创建chat session
    // const chatHistory = await loadChatHistory(currentSessionId, userId);
    // const chat = model.startChat({ history: chatHistory });

    // 临时直接生成内容
    const result = await model.generateContent(parts);
    const response = await result.response;
    const aiResponse = response.text();

    if (!aiResponse) {
      return { error: 'No response from Gemini' };
    }

    // 这里应该保存对话到数据库
    // await saveChatMessage(currentSessionId, userId, message, aiResponse);

    console.log('Gemini response generated:', {
      responseLength: aiResponse.length,
      sessionId: currentSessionId,
    });

    return {
      result: aiResponse,
      sessionId: currentSessionId,
      model: 'gemini',
    };
  } catch (error: any) {
    console.error('Gemini chat service error:', error);
    return {
      error: error.message || 'Gemini service error',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }
};
