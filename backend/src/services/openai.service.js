import OpenAI from 'openai';
import 'dotenv/config';
import { Dialogue } from '../models/Dialogue.mongo';
import Session from '../models/Session.mongo';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chatService = async (
  message,
  userId = null,
  sessionId = null,
  imageBase64 = null,
) => {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { error: 'Message is required and must be a non-empty string.' };
  }

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

  let responseId = null;

  const latestModelDialogue = await Dialogue.findOne({
    sessionId: session.sessionId,
    role: 'model',
  }).sort({ createdAt: -1 });

  if (latestModelDialogue) {
    responseId = latestModelDialogue.responseId;
  }

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
      previous_response_id: responseId,
      tools: [
        {
          type: 'mcp',
          server_label: 'deepwiki',
          server_url: 'https://mcp.deepwiki.com/mcp',
          require_approval: 'never',
        },
      ],
      input: inputPayload,
      store: true,
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
      message: response.output_text,
      responseId: response.id,
    });
    await aiDialogue.save();

    return { result: response.output_text, sessionId: session.sessionId };
  } catch (error) {
    console.error('Error in chat service:', error);
    return { error: error.message || 'Chat service error' };
  }
};
