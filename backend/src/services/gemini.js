import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { init } from 'openai/_shims/index.mjs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let chatSession;

const initChatSession = (history = []) => {
  // 获取模型
  chatSession = ai.chats.create({
    model: 'gemini-2.0-flash',
    history,
  });
};

export const geminiChatService = async (
  message,
  imageBase64 = null,
  historyForNewChat = null,
) => {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { error: 'Message is required and must be a non-empty string.' };
  }

  if (!chatSession || historyForNewChat) {
    initChatSession(historyForNewChat || []);
  }

  console.log('Gemini service called with message:', message);

  try {
    const contents = [{ text: message }];
    if (imageBase64) {
      contents.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64,
        },
      });
    }
    const response = await chatSession.sendMessage({
      message: contents,
    });

    console.log('Gemini chat service response:', response.text);
    return { result: response.text };
  } catch (error) {
    console.error('Error in chat service:', error);
    return { error: error.message || 'Chat service error' };
  }
};
