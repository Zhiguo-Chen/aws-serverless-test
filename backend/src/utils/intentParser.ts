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
