import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import 'dotenv/config';

export const createChatModel = () => {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-2.0-flash',
    apiKey: process.env.GEMINI_API_KEY,
    temperature: 0,
  });
};
