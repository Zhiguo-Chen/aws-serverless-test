import { HumanMessage } from '@langchain/core/messages';

export class MessageBuilder {
  static buildUserMessage(message, imageBase64) {
    const messageContent = [];

    // 验证并添加文本内容
    if (message && typeof message === 'string' && message.trim() !== '') {
      messageContent.push({ type: 'text', text: message.trim() });
    }

    // 验证并添加图片内容
    if (imageBase64 && imageBase64.trim() !== '') {
      // 确保 imageBase64 格式正确
      let formattedImageUrl;
      const trimmedBase64 = imageBase64.trim();

      if (trimmedBase64.startsWith('data:image/')) {
        // 如果已经包含 data URL 前缀，直接使用
        formattedImageUrl = trimmedBase64;
      } else {
        // 如果是纯 base64，添加前缀
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

    // 如果只有一个文本内容，直接使用字符串；否则使用数组
    const content =
      messageContent.length === 1 && messageContent[0].type === 'text'
        ? messageContent[0].text
        : messageContent;

    return new HumanMessage({ content });
  }
}
