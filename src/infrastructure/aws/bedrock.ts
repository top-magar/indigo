/**
 * AWS Bedrock Service
 * 
 * Provides generative AI capabilities:
 * - Product description generation
 * - Marketing copy creation
 * - Content translation
 * - Customer support chatbot
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

// Configuration
const AWS_REGION = process.env.AWS_BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1';
// Default to Amazon Nova Lite (no use case form required) - can override with Claude if approved
const DEFAULT_MODEL_ID = process.env.AWS_BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

// Model type detection
const isClaudeModel = (modelId: string) => modelId.startsWith('anthropic.');
const isNovaModel = (modelId: string) => modelId.startsWith('amazon.nova');

// Lazy-initialized client
let bedrockClient: BedrockRuntimeClient | null = null;

function getBedrockClient(): BedrockRuntimeClient {
  if (!bedrockClient) {
    bedrockClient = new BedrockRuntimeClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }
  return bedrockClient;
}

export interface GenerationResult {
  success: boolean;
  content?: string;
  error?: string;
}

/**
 * Generate a product description using AI
 */
export async function generateProductDescription(
  productName: string,
  attributes: string[],
  options?: {
    tone?: 'professional' | 'casual' | 'luxury' | 'playful';
    length?: 'short' | 'medium' | 'long';
    includeKeywords?: string[];
  }
): Promise<GenerationResult> {
  const { tone = 'professional', length = 'medium', includeKeywords = [] } = options || {};

  const lengthGuide = {
    short: '50-80 words',
    medium: '100-150 words',
    long: '200-300 words',
  };

  const prompt = `Generate an e-commerce product description for "${productName}".

Product attributes: ${attributes.join(', ')}
Tone: ${tone}
Length: ${lengthGuide[length]}
${includeKeywords.length > 0 ? `Include these SEO keywords naturally: ${includeKeywords.join(', ')}` : ''}

Requirements:
- Write in second person ("you")
- Highlight key benefits
- Include a call to action
- Make it scannable with short sentences
- Do not use generic filler phrases

Return ONLY the product description, no explanations.`;

  return invokeModel(prompt);
}

/**
 * Generate marketing copy for campaigns
 */
export async function generateMarketingCopy(
  productName: string,
  campaignType: 'email' | 'social' | 'banner' | 'sms',
  context?: string
): Promise<GenerationResult> {
  const typeGuides = {
    email: 'Write a compelling email subject line and preview text (max 100 chars each)',
    social: 'Write an engaging social media post (max 280 chars) with relevant hashtags',
    banner: 'Write a short, punchy banner headline (max 10 words) and subheadline (max 15 words)',
    sms: 'Write a promotional SMS message (max 160 chars) with urgency',
  };

  const prompt = `Create ${campaignType} marketing copy for "${productName}".
${context ? `Context: ${context}` : ''}

${typeGuides[campaignType]}

Return ONLY the copy, formatted appropriately for the channel.`;

  return invokeModel(prompt);
}

/**
 * Translate content to another language
 */
export async function translateContent(
  content: string,
  targetLanguage: string,
  context?: 'product' | 'marketing' | 'support'
): Promise<GenerationResult> {
  const prompt = `Translate the following ${context || 'e-commerce'} content to ${targetLanguage}.
Maintain the tone and style appropriate for e-commerce.
Adapt cultural references if needed.

Content to translate:
${content}

Return ONLY the translated text.`;

  return invokeModel(prompt);
}

/**
 * Generate a response for customer support
 */
export async function generateSupportResponse(
  customerMessage: string,
  context: {
    orderStatus?: string;
    productName?: string;
    previousMessages?: string[];
  }
): Promise<GenerationResult> {
  const prompt = `You are a helpful e-commerce customer support assistant.

Customer message: "${customerMessage}"
${context.orderStatus ? `Order status: ${context.orderStatus}` : ''}
${context.productName ? `Product: ${context.productName}` : ''}
${context.previousMessages?.length ? `Previous conversation:\n${context.previousMessages.join('\n')}` : ''}

Provide a helpful, empathetic response. Be concise but thorough.
If you cannot help, suggest contacting human support.

Return ONLY the response message.`;

  return invokeModel(prompt);
}

/**
 * Suggest product tags based on description
 */
export async function suggestProductTags(
  productName: string,
  description: string,
  existingTags?: string[]
): Promise<GenerationResult> {
  const prompt = `Suggest relevant e-commerce tags for this product.

Product: ${productName}
Description: ${description}
${existingTags?.length ? `Existing tags: ${existingTags.join(', ')}` : ''}

Return 5-10 relevant tags as a comma-separated list.
Focus on: category, material, style, use case, target audience.
Do not repeat existing tags.`;

  return invokeModel(prompt);
}

/**
 * Core function to invoke the Bedrock model
 */
async function invokeModel(prompt: string, maxTokens: number = 1000): Promise<GenerationResult> {
  const client = getBedrockClient();

  try {
    let body: string;
    
    // Format request based on model type
    if (isClaudeModel(DEFAULT_MODEL_ID)) {
      // Claude/Anthropic format
      body = JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: maxTokens,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });
    } else if (isNovaModel(DEFAULT_MODEL_ID)) {
      // Amazon Nova format
      body = JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [{ text: prompt }],
          },
        ],
        inferenceConfig: {
          maxTokens: maxTokens,
          temperature: 0.7,
        },
      });
    } else {
      // Generic format (Llama, Mistral, etc.)
      body = JSON.stringify({
        prompt: prompt,
        max_gen_len: maxTokens,
        temperature: 0.7,
      });
    }

    const response = await client.send(new InvokeModelCommand({
      modelId: DEFAULT_MODEL_ID,
      body,
      contentType: 'application/json',
      accept: 'application/json',
    }));

    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract content based on model type
    let content: string | undefined;
    if (isClaudeModel(DEFAULT_MODEL_ID)) {
      content = responseBody.content?.[0]?.text || responseBody.completion;
    } else if (isNovaModel(DEFAULT_MODEL_ID)) {
      content = responseBody.output?.message?.content?.[0]?.text;
    } else {
      content = responseBody.generation || responseBody.outputs?.[0]?.text;
    }

    if (!content) {
      return { success: false, error: 'No content in response' };
    }

    return { success: true, content: content.trim() };
  } catch (error) {
    console.error('[Bedrock] Model invocation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate content',
    };
  }
}

/**
 * Check if Bedrock is available and configured
 */
export async function isBedrockAvailable(): Promise<boolean> {
  try {
    const result = await invokeModel('Say "ok"', 10);
    return result.success;
  } catch {
    return false;
  }
}
