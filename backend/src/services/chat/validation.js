export class ChatValidation {
  static validateChatRequest(message, sessionId, imageBase64) {
    if (!sessionId) {
      return {
        isValid: false,
        error: 'Session ID is required for conversational chat.',
      };
    }

    if (!message && !imageBase64) {
      return { isValid: false, error: 'Message or image content is required.' };
    }

    return { isValid: true };
  }
}
