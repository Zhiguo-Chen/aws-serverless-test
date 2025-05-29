import OpenAI from 'openai';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatService = async (message, imageBase64 = null) => {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { error: 'Message is required and must be a non-empty string.' };
  }

  console.log('Chat service called with message:', message);

  try {
    const inputPayload = [{ role: 'user', content: message }];
    if (imageBase64) {
      inputPayload.push({
        role: 'user',
        content: [
          {
            type: 'input_image',
            image_url: `data:image/jpeg;base64,${imageBase64}`,
          },
        ],
      });
    }
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: inputPayload,
    });

    console.log('Chat service response:', response);
    return { result: response.output_text };
  } catch (error) {
    console.error('Error in chat service:', error);
    return { error: error.message || 'Chat service error' };
  }
};
