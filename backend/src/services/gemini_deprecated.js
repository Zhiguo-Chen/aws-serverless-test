import 'dotenv/config';
// 导入 GoogleGenAI 以及（可选的）HarmCategory, HarmBlockThreshold
import { GoogleGenAI } from '@google/genai';

// 使用API密钥初始化GoogleGenAI客户端
// 请确保 process.env.GEMINI_API_KEY 已在 .env 文件或类似位置正确设置
const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// 用于保存聊天会话的变量
// 注意: 这个基本实现是在模块级别保存单个聊天会话。
// 如果需要同时支持多个用户或多个独立的对话，
// 您需要额外的会话管理机制（例如，使用Map对象按用户ID管理聊天会话实例）。
let chatSession;

// 使用的模型名称。这里使用您指定的 'gemini-2.0-flash'。
// 请确认此模型是否可用。
// 如果不可用，或希望使用最新的Flash模型，
// 请替换为可用的模型名称，例如 'gemini-1.5-flash-latest' 或 'gemini-1.5-flash'。
const MODEL_NAME = 'gemini-2.0-flash';

/**
 * 初始化新的聊天会话，或重新利用现有的会话。
 * @param {Array<Object>} [history=[]] - 可选。用于在恢复聊天时传递对话历史。
 * 每个历史对象格式为 { role: "user" | "model", parts: [{ text: "..." }, ...] }。
 * 如果包含图片，图片对象也应添加到 parts 数组中。
 */
const initializeChatSession = async (history = []) => {
  // 获取模型
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    // 您可以在这里全局配置安全设置或生成参数
    // safetySettings: [
    //   {
    //     category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    //     threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    //   },
    // ],
    // generationConfig: { // 也可以在 sendMessage 时单独设置
    //   maxOutputTokens: 200, // 示例：最大输出token数
    //   temperature: 0.8,    // 示例：控制生成的多样性 (0.0-1.0)
    // },
  });

  // 使用提供的历史记录开始聊天会话
  chatSession = model.startChat({
    history: history,
  });
  console.log('聊天会话已初始化或重新初始化。');
};

/**
 * 与Gemini模型进行连续对话的服务函数。
 * @param {string} message - 来自用户的消息。
 * @param {string | null} [imageBase64=null] - 可选。Base64编码的图像数据。
 * @param {Array<Object> | null} [historyForNewChat=null] - 可选。开始新聊天时的初始历史记录。
 * 如果提供了此参数，将使用此历史记录开始新的聊天会话。
 * 如果未提供，则使用现有会话（如果存在）。
 * @returns {Promise<Object>} - { result: "模型的响应文本" } 或 { error: "错误信息", details?: any }
 */
export const geminiChatService = async (
  message,
  imageBase64 = null,
  historyForNewChat = null,
) => {
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return { error: '消息是必需的，且不能为空字符串。' };
  }

  try {
    // 如果提供了 historyForNewChat，或者 chatSession 尚未定义，则开始新的聊天会话
    if (historyForNewChat || !chatSession) {
      await initializeChatSession(historyForNewChat || []); // 如果 historyForNewChat 为 null，则以空历史开始
    }

    console.log('正在发送消息给Gemini:', message);

    // 将消息和图片准备为 parts 数组
    const messageParts = [{ text: message }];
    if (imageBase64) {
      // 图片的MIME类型应根据实际图片格式设置。
      // 常见的有: 'image/png', 'image/jpeg', 'image/webp', 'image/heic', 'image/heif'
      // 这里假设为 'image/jpeg'。
      messageParts.push({
        inlineData: {
          mimeType: 'image/jpeg', // 请正确设置图片的MIME类型
          data: imageBase64,
        },
      });
    }

    // 通过聊天会话发送消息并等待响应
    const result = await chatSession.sendMessage(messageParts);
    const response = result.response;
    const textResponse = response.text(); // 从响应中获取文本部分

    console.log('Gemini聊天服务响应:', textResponse);
    return { result: textResponse };
  } catch (error) {
    console.error('聊天服务出错:', error);
    const errorMessage =
      error.message || (typeof error === 'string' ? error : '聊天服务错误');
    // API的错误响应可能包含详细信息
    if (error.response && error.response.promptFeedback) {
      console.error('Prompt Feedback:', error.response.promptFeedback);
      return { error: errorMessage, details: error.response.promptFeedback };
    }
    return { error: errorMessage };
  }
};

/**
 * (可选) 获取当前聊天会话的对话历史记录的函数。
 * @returns {Promise<Object>} - { history: Array<Object> } 或 { error: "错误信息" }
 */
export const getChatHistory = async () => {
  if (chatSession) {
    try {
      // ChatSession.getHistory() 返回一个Promise，所以需要await
      const history = await chatSession.getHistory();
      return { history: history };
    } catch (error) {
      console.error('获取聊天记录出错:', error);
      return { error: error.message || '获取历史记录失败' };
    }
  }
  return {
    error: '聊天会话未初始化。请先调用geminiChatService或初始化一个会话。',
  };
};

/**
 * (可选) 显式重置/清除当前聊天会话的函数。
 * 这将导致下一次调用 `geminiChatService` 时开始一个新的会话（除非指定了historyForNewChat）。
 * @returns {Object} - { message: "成功信息" }
 */
export const resetChatSession = () => {
  chatSession = null; // 清除会话
  console.log('聊天会话已重置。');
  return {
    message:
      '聊天会话已成功重置。除非提供历史记录，否则下次调用geminiChatService将开始新会话。',
  };
};

// --- 以下是如何使用此服务的简单示例 ---
// 这部分代码通常位于您应用程序的调用方。
/*
async function conversationExample() {
  // 1. 第一条消息 (将隐式开始一个新的聊天会话)
  console.log("用户: 你好，请做个自我介绍。");
  let response = await geminiChatService("你好，请做个自我介绍。");
  if (response.result) {
    console.log("AI:", response.result);
  } else {
    console.error("错误:", response.error, response.details || '');
  }

  // 2. 继续对话 (将使用现有会话)
  console.log("\n用户: 你擅长做什么？");
  response = await geminiChatService("你擅长做什么？");
  if (response.result) {
    console.log("AI:", response.result);
  } else {
    console.error("错误:", response.error, response.details || '');
  }

  // 3. (可选) 发送带图片的消息
  // const sampleBase64Image = "这里是实际的Base64编码的图片数据..."; // 例如: fs.readFileSync('path/to/image.jpg').toString('base64');
  // if (sampleBase64Image !== "这里是实际的Base64编码的图片数据...") {
  //   console.log("\n用户: 请描述这张图片。(有图片)");
  //   response = await geminiChatService("请描述这张图片。", sampleBase64Image);
  //   if (response.result) {
  //     console.log("AI:", response.result);
  //   } else {
  //     console.error("错误:", response.error, response.details || '');
  //   }
  // }


  // 4. (可选) 获取当前对话历史
  const historyData = await getChatHistory();
  if (historyData.history) {
    console.log("\n当前聊天历史:", JSON.stringify(historyData.history, null, 2));
  } else {
    console.error("\n获取历史记录错误:", historyData.error);
  }

  // 5. (可选) 重置聊天会话
  console.log("\n正在重置聊天会话...");
  resetChatSession();

  // 6. 重置后，开始新的对话
  console.log("\n用户: 让我们开始新的对话吧。今天天气怎么样？");
  // 调用 geminiChatService 时，将 historyForNewChat 设置为空数组或保持 null，即可开始新会话
  response = await geminiChatService("让我们开始新的对话吧。今天天气怎么样？", null, []);
  if (response.result) {
    console.log("AI:", response.result);
  } else {
    console.error("错误:", response.error, response.details || '');
  }
}

// conversationExample(); // 要运行此示例，请取消注释此行。
*/
