import { HumanMessage } from '@langchain/core/messages';

export class MessageBuilder {
  static buildUserMessage(message: string, imageBase64: string | null) {
    const messageContent = [];

    // Validate and add text content
    if (message && typeof message === 'string' && message.trim() !== '') {
      messageContent.push({ type: 'text', text: message.trim() });
    }

    // Validate and add image content
    if (imageBase64 && imageBase64.trim() !== '') {
      // Ensure the imageBase64 format is correct
      let formattedImageUrl;
      const trimmedBase64 = imageBase64.trim();

      if (trimmedBase64.startsWith('data:image/')) {
        // If it already contains the data URL prefix, use it directly
        formattedImageUrl = trimmedBase64;
      } else {
        // If it is pure base64, add the prefix
        formattedImageUrl = `data:image/jpeg;base64,${trimmedBase64}`;
      }

      messageContent.push({
        type: 'image_url',
        image_url: {
          url: formattedImageUrl,
        },
      });
    }

    if (messageContent.length === 0) {
      throw new Error('No valid text or image content to process.');
    }

    // If there is only one text content, use a string directly; otherwise, use an array
    const content: any =
      messageContent.length === 1 && messageContent[0].type === 'text'
        ? messageContent[0].text
        : messageContent;

    return new HumanMessage({ content });
  }
}