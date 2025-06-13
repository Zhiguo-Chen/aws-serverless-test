import 'dotenv/config';
import fs from 'fs';
import OpenAI from 'openai';
import { geminiChatService } from '../services/gemini.service.js';
import { grokService } from '../services/grok.service.js';
import { chatService } from '../services/openai.service.js';
import { langChainGeminiChatService } from '../services/langchain-gemini.service.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chat = async (req, res) => {
  try {
    const { message, model, sessionId } = req.body;
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = fs.readFileSync(req.file.path, { encoding: 'base64' });
    }

    const userId = req.user.id; // 从请求中获取用户ID

    let modelResponse;
    if (model.toLowerCase().includes('langchain')) {
      modelResponse = await langChainGeminiChatService(
        message,
        userId,
        sessionId,
        imageBase64,
      );
    } else if (model.toLowerCase().includes('grok')) {
      modelResponse = await grokService(message);
    } else if (model.toLowerCase().includes('gemini')) {
      modelResponse = await geminiChatService(
        message,
        userId,
        sessionId,
        imageBase64,
      );
    } else {
      modelResponse = await chatService(
        message,
        userId,
        sessionId,
        imageBase64,
      );
    }
    if (modelResponse?.error) {
      return res.status(500).json({
        error: modelResponse.error,
        details: modelResponse.details,
      });
    }
    const aiResponseText = modelResponse.result;
    res
      .status(200)
      .json({ response: aiResponseText, sessionId: modelResponse.sessionId });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error });
  }
};
