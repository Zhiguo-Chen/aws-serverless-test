import OpenAI from 'openai';
import { inspect } from 'util';
import fs from 'fs';
import 'dotenv/config';
import { grokService } from '../services/grok.js';
import { chatService } from '../services/openai.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    let imageBase64 = null;
    if (req.file) {
      imageBase64 = fs.readFileSync(req.file.path, { encoding: 'base64' });
    }

    const { result } = await chatService(message, imageBase64);
    res.status(200).json({ response: result });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error });
  }
};
