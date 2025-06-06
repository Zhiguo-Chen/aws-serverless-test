import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import Dialogue from '../models/dialogue.js';
import Session from '../models/session.js';

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
  userId = null,
  sessionId = null,
  imageBase64 = null,
) => {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { error: 'Message is required and must be a non-empty string.' };
  }
  // 1. 获取或创建 session
  let session;
  if (sessionId) {
    session = await Session.findOne({ sessionId, userId });
    if (!session) {
      return res.status(400).json({ message: 'Invalid sessionId' });
    }
  } else {
    session = new Session({ userId });
    await session.save();
  }

  // 2. 加载历史消息
  const loadedDbHistory = await Dialogue.find({
    sessionId: session.sessionId,
  }).sort({ createdAt: 1 });
  // 格式化为大模型需要的历史格式
  const historyForModel = loadedDbHistory.map((d) => ({
    role: d.role, // 你需要在Dialogue表中加role字段（"user"或"model"）
    parts: [{ text: d.message }],
  }));

  if (!chatSession || historyForModel) {
    initChatSession(historyForModel || []);
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
    const userDialogue = new Dialogue({
      sessionId: session.sessionId,
      role: 'user',
      message,
    });
    await userDialogue.save();
    // 保存AI回复
    const aiDialogue = new Dialogue({
      sessionId: session.sessionId,
      role: 'model',
      message: response.text,
    });
    await aiDialogue.save();

    console.log('Gemini chat service response:', response.text);
    return { result: response.text, sessionId: session.sessionId };
  } catch (error) {
    console.error('Error in chat service:', error);
    return { error: error.message || 'Chat service error' };
  }
};
