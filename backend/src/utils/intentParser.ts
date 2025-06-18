import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import z from 'zod';
import 'dotenv/config';

// -------------------- 1. Flatten the Schema into a Single Object --------------------
// This is the key change. We are no longer using z.union or z.literal.

const ProductCategoryEnum = z
  .enum([
    'headphone',
    'smartphone',
    'tablet',
    'smart_speaker',
    'smart_home_device',
    'smart_tv',
    'smart_light',
    'smart_thermostat',
    'smart_security_camera',
    'smart_watche',
    'smart_bulb',
    'smart_plug',
    'smart_lock',
    'smart_fridge',
    'smart_microwaves',
    'smart_kettles',
    'smart_cookers',
    'smart_vacuums',
    'smart_robots',
    'smart_air_purifiers',
    'camera',
    'laptop',
    'keyboard',
    'mice',
    'tents',
    'backpack',
    'drones',
    'speaker',
    'smartwatch',
    "Women's Fashion",
    "Men's Fashion",
    'Electronics',
    'Home & Lifestyle',
    'Medicine',
    'Sports & Outdoors',
    "Baby's & Toys",
    'Groceries & Pets',
    'Beauty & Health',
    'Chair',
  ])
  .describe(
    'The standardized product category. The model must map user inputs (e.g., "耳机") to a value from this list.',
  );

const BasePriceSchema = z.object({
  min: z
    .number()
    .optional()
    .nullable()
    .describe('The minimum price specified by the user.'),
  max: z
    .number()
    .optional()
    .nullable()
    .describe('The maximum price specified by the user.'),
});

// A single, unified schema to parse the user's intent.
const UnifiedIntentSchema = z
  .object({
    intentType: z
      .enum(['product_query', 'use_case_query', 'gift_query', 'general_chat'])
      .describe("The single most appropriate intent for the user's query."),

    // -- Fields for all intent types --
    priceRange: BasePriceSchema.optional()
      .nullable()
      .describe('The price range specified by the user.'),

    // -- Fields for product/use_case queries --
    categories: z
      .array(ProductCategoryEnum)
      .optional()
      .nullable()
      .describe(
        "Relevant for 'product_query' and 'use_case_query'. An array of standardized product categories.",
      ),
    tags: z
      .array(z.string())
      .optional()
      .nullable()
      .describe(
        "Relevant for 'product_query' and 'use_case_query'. Specific attributes like 'wireless' or 'waterproof'.",
      ),

    // -- Field for use_case query only --
    useCase: z
      .string()
      .optional()
      .nullable()
      .describe(
        "ONLY for 'use_case_query'. The user's described activity, e.g., 'hiking' or 'gaming'.",
      ),

    // -- Fields for gift query only --
    recipient: z
      .string()
      .optional()
      .nullable()
      .describe(
        "ONLY for 'gift_query'. The recipient of the gift, e.g., 'girlfriend' or 'father'.",
      ),
    occasion: z
      .string()
      .optional()
      .nullable()
      .describe(
        "ONLY for 'gift_query'. The gifting occasion, e.g., 'birthday' or 'anniversary'.",
      ),
  })
  .describe(
    "Parse the user's intent. If it's a general chat, only 'intentType' is needed.",
  );

// -------------------- 2. Initialize Model and Bind Tool (Same as before) --------------------
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.0-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0,
});

// Define the tool using the new, simplified schema.
const intentParsingTool = {
  name: 'intent_parser',
  description:
    "Parses the user's complete intent into a single, structured object.",
  schema: UnifiedIntentSchema, // Using the new flattened schema
};

// Bind the tool to the model and force its use.
const modelWithTools = model.withConfig({
  tools: [intentParsingTool],
  tool_choice: 'intent_parser',
});

// -------------------- 3. Main Function (Same as before) --------------------
export const extractQueryIntent = async (
  userInput: string | null | undefined,
  imageBase64 = null,
  imageMimeType = 'image/jpeg',
) => {
  const messageContent = [];
  const prompt = `Analyze the user's request and call the intent_parser tool with the extracted information. User request: "${userInput}"`;

  if (userInput && typeof userInput === 'string' && userInput.trim() !== '') {
    messageContent.push({ type: 'text', text: prompt });
  } else {
    // 如果没有文本输入，但有图片，也需要一个基础提示
    messageContent.push({
      type: 'text',
      text: `Please extract the intent based on the image content and user's request. Then call the intent_parser tool with the extracted information. User request: "${userInput}"`,
    });
  }

  console.log('base64 is : ', imageBase64);

  if (imageBase64) {
    messageContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${imageMimeType};base64,${imageBase64}`,
      },
    });
  }

  if (messageContent.length === 0) {
    return { error: 'Either text input or image input is required.' };
  }

  try {
    const response = await modelWithTools.invoke([
      new HumanMessage({ content: messageContent }),
    ]);
    const intent = response?.tool_calls?.[0]?.args;

    if (!intent) {
      throw new Error('The model did not call the tool as expected.');
    }

    console.log('Successfully extracted intent:', intent);
    return intent;
  } catch (err) {
    console.error('Failed to extract intent using tool calling:', err);
    return {
      intentType: 'error',
      message: 'Sorry, I could not understand your request.',
      originalInput: userInput,
    };
  }
};

// -------------------- 4. New Function: Get Last Query Intent --------------------
/**
 * 从消息历史中查询用户上一次的查询意图
 * @param {Array} allMessages - 包含历史消息和当前消息的数组
 * @returns {Object|null} 最近一次的查询意图，如果没有找到则返回null
 */
export const getLastQueryIntent = async (allMessages: any[]) => {
  if (!allMessages || !Array.isArray(allMessages) || allMessages.length === 0) {
    console.log('No messages provided');
    return null;
  }

  try {
    // 从最新消息开始向前搜索，跳过当前最新的消息
    for (let i = allMessages.length - 2; i >= 0; i--) {
      const message = allMessages[i];

      // 检查是否是用户消息
      if (message.role === 'user' || message.type === 'human') {
        const userContent = extractUserContent(message);

        if (userContent) {
          console.log(
            `Processing historical message at index ${i}:`,
            userContent,
          );

          // 提取该消息的意图
          const intent = await extractQueryIntent(
            userContent.text,
            userContent.imageBase64,
            userContent.imageMimeType,
          );

          // 如果是有效的查询意图（非general_chat和error），则返回
          if (
            intent &&
            intent.intentType &&
            intent.intentType !== 'general_chat' &&
            intent.intentType !== 'error'
          ) {
            console.log('Found last valid query intent:', intent);
            return {
              ...intent,
              messageIndex: i,
              originalMessage: userContent.text,
            };
          }
        }
      }
    }

    console.log('No valid query intent found in message history');
    return null;
  } catch (error) {
    console.error('Error while searching for last query intent:', error);
    return null;
  }
};

/**
 * 从消息对象中提取用户内容
 * @param {Object} message - 消息对象
 * @returns {Object|null} 包含文本和图片信息的对象
 */
const extractUserContent = (message: any) => {
  let text = '';
  let imageBase64 = null;
  let imageMimeType = 'image/jpeg';

  try {
    // 处理不同的消息格式
    if (typeof message.content === 'string') {
      text = message.content;
    } else if (Array.isArray(message.content)) {
      // 处理包含多种内容类型的消息
      for (const content of message.content) {
        if (content.type === 'text') {
          text += content.text || '';
        } else if (content.type === 'image_url') {
          // 提取base64图片数据
          const imageUrl = content.image_url?.url || '';
          if (imageUrl.startsWith('data:')) {
            const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
            if (matches) {
              imageMimeType = matches[1];
              imageBase64 = matches[2];
            }
          }
        }
      }
    } else if (message.content && typeof message.content === 'object') {
      text = message.content.text || '';
      if (message.content.image_url) {
        const imageUrl = message.content.image_url.url || '';
        if (imageUrl.startsWith('data:')) {
          const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            imageMimeType = matches[1];
            imageBase64 = matches[2];
          }
        }
      }
    } else if (message.text) {
      text = message.text;
    }

    // 如果既没有文本也没有图片，返回null
    if (!text.trim() && !imageBase64) {
      return null;
    }

    return {
      text: text.trim(),
      imageBase64,
      imageMimeType,
    };
  } catch (error) {
    console.error('Error extracting user content:', error);
    return null;
  }
};

// -------------------- 5. Enhanced Intent Merging Function --------------------
/**
 * 合并当前意图和历史意图，补充缺失的信息
 * @param {Object} currentIntent - 当前查询的意图
 * @param {Object} lastIntent - 上一次查询的意图
 * @returns {Object} 合并后的完整意图
 */
export const mergeIntentWithHistory = (currentIntent: any, lastIntent: any) => {
  if (!currentIntent) return lastIntent;
  if (!lastIntent) return currentIntent;

  // 创建合并后的意图对象
  const mergedIntent = { ...currentIntent };

  // 如果当前意图是product_query但缺少categories，尝试从历史中获取
  if (
    currentIntent.intentType === 'product_query' &&
    (!currentIntent.categories || currentIntent.categories.length === 0)
  ) {
    // 从历史意图中获取categories（适用于product_query和use_case_query）
    if (
      (lastIntent.intentType === 'product_query' ||
        lastIntent.intentType === 'use_case_query') &&
      lastIntent.categories &&
      lastIntent.categories.length > 0
    ) {
      mergedIntent.categories = [...lastIntent.categories];
      console.log('Merged categories from history:', mergedIntent.categories);
    }

    // 如果历史意图有tags，也可以继承
    if (
      lastIntent.tags &&
      lastIntent.tags.length > 0 &&
      (!currentIntent.tags || currentIntent.tags.length === 0)
    ) {
      mergedIntent.tags = [...lastIntent.tags];
      console.log('Merged tags from history:', mergedIntent.tags);
    }
  }

  // 如果当前没有价格范围，但历史查询有，可以考虑继承（可选）
  if (!currentIntent.priceRange && lastIntent.priceRange) {
    mergedIntent.priceRange = { ...lastIntent.priceRange };
    console.log('Merged price range from history:', mergedIntent.priceRange);
  }

  // 添加历史上下文信息
  mergedIntent._historyContext = {
    lastIntent: lastIntent,
    merged: true,
    mergedFields: [],
  };

  // 记录哪些字段是从历史中合并的
  if (mergedIntent.categories !== currentIntent.categories) {
    mergedIntent._historyContext.mergedFields.push('categories');
  }
  if (mergedIntent.tags !== currentIntent.tags) {
    mergedIntent._historyContext.mergedFields.push('tags');
  }
  if (mergedIntent.priceRange !== currentIntent.priceRange) {
    mergedIntent._historyContext.mergedFields.push('priceRange');
  }

  return mergedIntent;
};

/**
 * 处理产品查询的增强版本，自动合并历史上下文
 * @param {Object} currentIntent - 当前意图
 * @param {Array} allMessages - 所有消息历史
 * @returns {Object} 增强后的意图，包含历史上下文
 */
export const enhanceIntentWithHistory = async (
  currentIntent: any,
  allMessages: any,
) => {
  // 如果当前意图不是product_query，或者已经有完整信息，直接返回
  if (
    !currentIntent ||
    currentIntent.intentType !== 'product_query' ||
    (currentIntent.categories && currentIntent.categories.length > 0)
  ) {
    return currentIntent;
  }

  console.log('Current intent lacks categories, searching history...');

  // 获取历史查询意图
  const lastIntent = await getLastQueryIntent(allMessages);

  if (!lastIntent) {
    console.log('No history intent found');
    return currentIntent;
  }

  console.log('Found history intent:', getIntentSummary(lastIntent));

  // 合并意图
  const enhancedIntent = mergeIntentWithHistory(currentIntent, lastIntent);

  console.log('Enhanced intent:', getIntentSummary(enhancedIntent));

  return enhancedIntent;
};

// -------------------- 6. Helper Function: Get Intent Summary --------------------
/**
 * 获取意图的简要描述
 * @param {Object} intent - 意图对象
 * @returns {string} 意图的简要描述
 */
export const getIntentSummary = (intent: any) => {
  if (!intent || !intent.intentType) {
    return 'Unknown intent';
  }

  let summary = '';

  switch (intent.intentType) {
    case 'product_query':
      const categories =
        intent.categories?.join(', ') || 'unspecified products';
      const priceInfo = intent.priceRange
        ? ` (${intent.priceRange.min || 0}-${intent.priceRange.max || '∞'})`
        : '';
      summary = `Product query: ${categories}${priceInfo}`;
      break;

    case 'use_case_query':
      summary = `Use case query: ${intent.useCase || 'unspecified use case'}`;
      break;

    case 'gift_query':
      const recipient = intent.recipient || 'someone';
      const occasion = intent.occasion || 'occasion';
      summary = `Gift query: for ${recipient} on ${occasion}`;
      break;

    case 'general_chat':
      summary = 'General chat';
      break;

    default:
      summary = `${intent.intentType} query`;
  }

  // 如果是合并的意图，添加标记
  if (intent._historyContext?.merged) {
    summary += ` (merged: ${intent._historyContext.mergedFields.join(', ')})`;
  }

  return summary;
};
