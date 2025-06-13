import { HumanMessage } from '@langchain/core/messages';

export class MessageBuilder {
  static buildUserMessage(message, imageBase64) {
    const messageContent = [];

    if (message && typeof message === 'string' && message.trim() !== '') {
      messageContent.push({ type: 'text', text: message });
    }

    if (imageBase64) {
      messageContent.push({
        type: 'image_url',
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
        },
      });
    }

    if (messageContent.length === 0) {
      throw new Error('No valid text or image content to process.');
    }

    return new HumanMessage({
      content:
        messageContent.length === 1 && messageContent[0].type === 'text'
          ? messageContent[0].text
          : messageContent,
    });
  }
}
