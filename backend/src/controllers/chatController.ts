import 'dotenv/config';
import fs from 'fs';
import { geminiChatService } from '../services/gemini.service';
import { grokService } from '../services/grok.service';
import { chatService } from '../services/openai.service';
import { langChainGeminiChatService } from '../services/langchain-gemini.service';
import { Request, Response } from 'express';

export const chat = async (
  req: Request | any,
  res: Response,
): Promise<void> => {
  try {
    const { message, model, sessionId } = req.body;
    let imageBase64: null | undefined = null;
    if (req.file) {
      imageBase64 = fs.readFileSync(req.file.path, {
        encoding: 'base64',
      }) as any;
    }

    const userId = req.user?.id as any;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    let modelResponse: any;
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
      res.status(500).json({
        error: modelResponse.error,
        details: modelResponse.details,
      });
      return;
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
