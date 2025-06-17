import OpenAI from 'openai';
import 'dotenv/config';

export const grokService = async (message: string) => {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { error: 'Message is required and must be a non-empty string.' };
  }
  console.log('Grok service called with message:', message);
  console.log(
    'Using API Key:',
    process.env.XAI_API_KEY ? process.env.XAI_API_KEY : 'Not Provided',
  );
  const client = new OpenAI({
    apiKey: process.env.XAI_API_KEY,
    baseURL: 'https://api.x.ai/v1',
  });
  try {
    const completion = await client.chat.completions.create({
      model: 'grok-3',
      messages: [{ role: 'user', content: message }],
    });
    console.log('Grok service response:', completion);
    return { result: completion };
  } catch (error: any) {
    console.error('Error in Grok service:', error);
    return { error: error.message || 'Grok service error' };
  }
};
