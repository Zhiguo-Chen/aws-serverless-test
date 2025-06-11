// test-custom-history.js
import { connectMongoDB } from './config/mongodb.js';
import {
  initializeChatHistoryChain,
  langChainGeminiChatService,
} from './services/langchain-gemini.js';

async function testCustomChatHistory() {
  try {
    console.log('Testing custom chat history implementation...');

    // 1. 连接 MongoDB
    await connectMongoDB();
    console.log('✓ MongoDB connected');

    // 2. 初始化聊天历史链
    await initializeChatHistoryChain();
    console.log('✓ Chat history chain initialized');

    // 3. 测试对话
    const testSessionId = 'test-session-' + Date.now();

    console.log('\n--- Testing first message ---');
    const response1 = await langChainGeminiChatService(
      '你好，我是测试用户',
      'test-user',
      testSessionId,
    );
    console.log('Response 1:', response1);

    console.log('\n--- Testing second message (should have context) ---');
    const response2 = await langChainGeminiChatService(
      '你还记得我刚才说了什么吗？',
      'test-user',
      testSessionId,
    );
    console.log('Response 2:', response2);

    console.log('\n--- Testing new session (should not have context) ---');
    const newSessionId = 'test-session-new-' + Date.now();
    const response3 = await langChainGeminiChatService(
      '我之前说过什么？',
      'test-user',
      newSessionId,
    );
    console.log('Response 3:', response3);

    console.log('\n✓ All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error);
    console.error('Error stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testCustomChatHistory();
