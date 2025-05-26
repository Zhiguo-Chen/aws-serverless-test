import OpenAI from 'openai';
import { inspect } from 'util';
import fs from 'fs';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chat = async (req, res) => {
  try {
    console.log('==========');
    console.log(req.body);
    console.log('==========');
    const { message } = req.body;
    let imageBase64 = null;
    console.log(message);
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
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      input: inputPayload,
    });

    res.status(200).json({ response: response.output_text });
  } catch (error) {
    console.error('Error in chat controller:', error);
    res.status(500).json({ error });
  }
};
