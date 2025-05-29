import OpenAI from 'openai';
import { inspect } from 'util';
import fs from 'fs';
import 'dotenv/config';
import { grokService } from '../services/grok.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chat = async (req, res) => {
  try {
    const { message } = req.body;
    let imageBase64 = null;
    if (req.file) {
      console.log('Chat File uploaded:', req.file);
      imageBase64 = fs.readFileSync(req.file.path, { encoding: 'base64' });
    }

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
    // const response = await openai.responses.create({
    //   model: 'gpt-4o-mini',
    //   input: inputPayload,
    // });

    const { result } = await grokService(message);
    res.status(200).json({ response: result });

    // res.status(200).json({ response: response.output_text });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error });
  }
};
