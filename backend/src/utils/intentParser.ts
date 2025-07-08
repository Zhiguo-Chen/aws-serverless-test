import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage } from '@langchain/core/messages';
import z from 'zod';
import 'dotenv/config';

// -------------------- 1. Flatten the Schema into a Single Object --------------------
// This is the key change. We are no longer using z.union or z.literal.
const ProductCategoryEnum = z
  .enum([
    'headphone',
    'phone',
    'tablet',
    'speaker',
    'home_device',
    'tv',
    'light',
    'thermostat',
    'security_camera',
    'watche',
    'bulb',
    'plug',
    'lock',
    'fridge',
    'microwaves',
    'kettles',
    'cookers',
    'vacuums',
    'robots',
    'air_purifiers',
    'camera',
    'laptop',
    'keyboard',
    'mice',
    'tents',
    'backpack',
    'drones',
    'speaker',
    'watch',
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
    // If there is no text input but there is an image, a basic prompt is also needed
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
 * Queries the user's last query intent from the message history
 * @param {Array} allMessages - An array containing historical and current messages
 * @returns {Object|null} The most recent query intent, or null if not found
 */
export const getLastQueryIntent = async (allMessages: any[]) => {
  if (!allMessages || !Array.isArray(allMessages) || allMessages.length === 0) {
    console.log('No messages provided');
    return null;
  }

  try {
    // Search backwards from the latest message, skipping the current newest message
    for (let i = allMessages.length - 2; i >= 0; i--) {
      const message = allMessages[i];

      // Check if it is a user message
      if (message.role === 'user' || message.type === 'human') {
        const userContent = extractUserContent(message);

        if (userContent) {
          console.log(
            `Processing historical message at index ${i}:`,
            userContent,
          );

          // Extract the intent of the message
          const intent = await extractQueryIntent(
            userContent.text,
            userContent.imageBase64,
            userContent.imageMimeType,
          );

          // If it is a valid query intent (not general_chat and not error), then return
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
 * Extracts user content from a message object
 * @param {Object} message - The message object
 * @returns {Object|null} An object containing text and image information
 */
const extractUserContent = (message: any) => {
  let text = '';
  let imageBase64 = null;
  let imageMimeType = 'image/jpeg';

  try {
    // Handle different message formats
    if (typeof message.content === 'string') {
      text = message.content;
    } else if (Array.isArray(message.content)) {
      // Handle messages containing multiple content types
      for (const content of message.content) {
        if (content.type === 'text') {
          text += content.text || '';
        } else if (content.type === 'image_url') {
          // Extract base64 image data
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

    // If there is neither text nor image, return null
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
 * Merges the current intent with the historical intent, supplementing missing information
 * @param {Object} currentIntent - The current query's intent
 * @param {Object} lastIntent - The previous query's intent
 * @returns {Object} The merged, complete intent
 */
export const mergeIntentWithHistory = (currentIntent: any, lastIntent: any) => {
  if (!currentIntent) return lastIntent;
  if (!lastIntent) return currentIntent;

  // Create the merged intent object
  const mergedIntent = { ...currentIntent };

  // If the current intent is product_query but lacks categories, try to get them from history
  if (
    currentIntent.intentType === 'product_query' &&
    (!currentIntent.categories || currentIntent.categories.length === 0)
  ) {
    // Get categories from historical intent (applicable to product_query and use_case_query)
    if (
      (lastIntent.intentType === 'product_query' ||
        lastIntent.intentType === 'use_case_query') &&
      lastIntent.categories &&
      lastIntent.categories.length > 0
    ) {
      mergedIntent.categories = [...lastIntent.categories];
      console.log('Merged categories from history:', mergedIntent.categories);
    }

    // If the historical intent has tags, they can also be inherited
    if (
      lastIntent.tags &&
      lastIntent.tags.length > 0 &&
      (!currentIntent.tags || currentIntent.tags.length === 0)
    ) {
      mergedIntent.tags = [...lastIntent.tags];
      console.log('Merged tags from history:', mergedIntent.tags);
    }
  }

  // If there is no price range currently, but the historical query has one, consider inheriting it (optional)
  if (!currentIntent.priceRange && lastIntent.priceRange) {
    mergedIntent.priceRange = { ...lastIntent.priceRange };
    console.log('Merged price range from history:', mergedIntent.priceRange);
  }

  // Add historical context information
  mergedIntent._historyContext = {
    lastIntent: lastIntent,
    merged: true,
    mergedFields: [],
  };

  // Record which fields were merged from history
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
 * An enhanced version for handling product queries that automatically merges historical context
 * @param {Object} currentIntent - The current intent
 * @param {Array} allMessages - All message history
 * @returns {Object} The enhanced intent, including historical context
 */
export const enhanceIntentWithHistory = async (
  currentIntent: any,
  allMessages: any,
) => {
  // If the current intent is not product_query, or if it already has complete information, return directly
  if (
    !currentIntent ||
    currentIntent.intentType !== 'product_query' ||
    (currentIntent.categories && currentIntent.categories.length > 0)
  ) {
    return currentIntent;
  }

  console.log('Current intent lacks categories, searching history...');

  // Get historical query intent
  const lastIntent = await getLastQueryIntent(allMessages);

  if (!lastIntent) {
    console.log('No history intent found');
    return currentIntent;
  }

  console.log('Found history intent:', getIntentSummary(lastIntent));

  // Merge intents
  const enhancedIntent = mergeIntentWithHistory(currentIntent, lastIntent);

  console.log('Enhanced intent:', getIntentSummary(enhancedIntent));

  return enhancedIntent;
};

// -------------------- 6. Helper Function: Get Intent Summary --------------------
/**
 * Gets a brief description of the intent
 * @param {Object} intent - The intent object
 * @returns {string} A brief description of the intent
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

  // If it is a merged intent, add a flag
  if (intent._historyContext?.merged) {
    summary += ` (merged: ${intent._historyContext.mergedFields.join(', ')})`;
  }

  return summary;
};