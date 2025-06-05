import 'dotenv/config';
import fs from 'fs';
import OpenAI from 'openai';
import Dialogue from '../models/dialogue.js';
import Session from '../models/session.js';
import { geminiChatService } from '../services/gemini.js';
import { grokService } from '../services/grok.js';
import { chatService } from '../services/openai.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chat = async (req, res) => {
  try {
    const { message, model, sessionId } = req.body;
    const userId = req.user.id; // 从请求中获取用户ID
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = fs.readFileSync(req.file.path, { encoding: 'base64' });
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

    let modelResponse;
    if (model.toLowerCase().includes('grok')) {
      modelResponse = await grokService(message);
    } else if (model.toLowerCase().includes('gemini')) {
      modelResponse = await geminiChatService(
        message,
        imageBase64,
        historyForModel,
      );
    } else {
      modelResponse = await chatService(message, imageBase64);
    }
    if (modelResponse?.error) {
      return res.status(500).json({
        error: modelResponse.error,
        details: modelResponse.details,
      });
    }
    const aiResponseText = modelResponse.result;
    // 4. 保存用户消息和AI回复到数据库
    // 保存用户消息
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
      message: aiResponseText,
    });
    await aiDialogue.save();
    // 5. 返回AI回复和sessionId
    res
      .status(200)
      .json({ response: aiResponseText, sessionId: session.sessionId });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error });
  }
};
