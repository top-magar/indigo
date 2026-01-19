/**
 * Indigo AI Service
 * 
 * Provides AI-powered content generation for e-commerce:
 * - Product descriptions
 * - Marketing copy
 * - Customer support responses
 * - Tag suggestions
 * 
 * Powered by: AWS Bedrock (Amazon Nova / Claude)
 */

import {
  generateProductDescription as bedrockGenerateDescription,
  generateMarketingCopy as bedrockGenerateMarketing,
  generateSupportResponse as bedrockGenerateSupport,
  suggestProductTags as bedrockSuggestTags,
  isBedrockAvailable,
} from '@/infrastructure/aws/bedrock';
import type {
  IndigoServiceResult,
  GeneratedContent,
  GenerateDescriptionOptions,
  MarketingCopyOptions,
  SupportResponseOptions,
  TagSuggestion,
  ServiceStatus,
} from './types';

// ============================================================================
// Indigo AI - Content Generation
// ============================================================================

/**
 * Generate an AI-powered product description
 * 
 * @example
 * ```ts
 * const result = await IndigoAI.generateDescription(
 *   'Wireless Bluetooth Headphones',
 *   ['noise-canceling', '40hr battery', 'premium sound'],
 *   { tone: 'professional', length: 'medium' }
 * );
 * ```
 */
export async function generateDescription(
  productName: string,
  attributes: string[],
  options?: GenerateDescriptionOptions
): Promise<IndigoServiceResult<GeneratedContent>> {
  const startTime = Date.now();

  try {
    const result = await bedrockGenerateDescription(productName, attributes, {
      tone: options?.tone,
      length: options?.length,
      includeKeywords: options?.keywords,
    });

    if (!result.success || !result.content) {
      return {
        success: false,
        error: result.error || 'Failed to generate description',
      };
    }

    const wordCount = result.content.split(/\s+/).length;

    return {
      success: true,
      data: {
        content: result.content,
        wordCount,
        suggestedKeywords: options?.keywords,
      },
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-ai',
      },
    };
  } catch (error) {
    console.error('[IndigoAI] Description generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Content generation failed',
    };
  }
}

/**
 * Generate marketing copy for various channels
 * 
 * @example
 * ```ts
 * const result = await IndigoAI.generateMarketingCopy(
 *   'Summer Sale Collection',
 *   { channel: 'email', urgency: 'high' }
 * );
 * ```
 */
export async function generateMarketingCopy(
  productOrCampaign: string,
  options: MarketingCopyOptions
): Promise<IndigoServiceResult<GeneratedContent>> {
  const startTime = Date.now();

  try {
    // Map Indigo channel types to Bedrock types
    const channelMap: Record<MarketingCopyOptions['channel'], 'email' | 'social' | 'banner' | 'sms'> = {
      email: 'email',
      social: 'social',
      banner: 'banner',
      sms: 'sms',
      push: 'sms', // Push notifications similar to SMS
    };

    const context = [
      options.context,
      options.urgency ? `Urgency level: ${options.urgency}` : null,
      options.callToAction ? `CTA: ${options.callToAction}` : null,
    ].filter(Boolean).join('. ');

    const result = await bedrockGenerateMarketing(
      productOrCampaign,
      channelMap[options.channel],
      context || undefined
    );

    if (!result.success || !result.content) {
      return {
        success: false,
        error: result.error || 'Failed to generate marketing copy',
      };
    }

    return {
      success: true,
      data: {
        content: result.content,
        wordCount: result.content.split(/\s+/).length,
      },
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-ai',
      },
    };
  } catch (error) {
    console.error('[IndigoAI] Marketing copy generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Marketing copy generation failed',
    };
  }
}

/**
 * Generate AI-powered customer support response
 * 
 * @example
 * ```ts
 * const result = await IndigoAI.generateSupportResponse(
 *   'Where is my order?',
 *   { orderStatus: 'shipped', customerTier: 'premium' }
 * );
 * ```
 */
export async function generateSupportResponse(
  customerMessage: string,
  options?: SupportResponseOptions
): Promise<IndigoServiceResult<GeneratedContent>> {
  const startTime = Date.now();

  try {
    const result = await bedrockGenerateSupport(customerMessage, {
      orderStatus: options?.orderStatus,
      productName: options?.productName,
      previousMessages: options?.conversationHistory,
    });

    if (!result.success || !result.content) {
      return {
        success: false,
        error: result.error || 'Failed to generate support response',
      };
    }

    return {
      success: true,
      data: {
        content: result.content,
        wordCount: result.content.split(/\s+/).length,
      },
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-ai',
      },
    };
  } catch (error) {
    console.error('[IndigoAI] Support response generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Support response generation failed',
    };
  }
}

/**
 * Get AI-suggested tags for a product
 * 
 * @example
 * ```ts
 * const result = await IndigoAI.suggestTags(
 *   'Organic Cotton T-Shirt',
 *   'Soft, breathable organic cotton t-shirt...',
 *   ['clothing', 'organic']
 * );
 * ```
 */
export async function suggestTags(
  productName: string,
  description: string,
  existingTags?: string[]
): Promise<IndigoServiceResult<TagSuggestion[]>> {
  const startTime = Date.now();

  try {
    const result = await bedrockSuggestTags(productName, description, existingTags);

    if (!result.success || !result.content) {
      return {
        success: false,
        error: result.error || 'Failed to suggest tags',
      };
    }

    // Parse comma-separated tags from AI response
    const tags = result.content
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && !existingTags?.includes(tag))
      .map((tag, index) => ({
        tag,
        confidence: Math.max(0.5, 1 - index * 0.05), // Decreasing confidence
        category: inferTagCategory(tag),
      }));

    return {
      success: true,
      data: tags,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-ai',
      },
    };
  } catch (error) {
    console.error('[IndigoAI] Tag suggestion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tag suggestion failed',
    };
  }
}

/**
 * Check if Indigo AI service is available
 */
export async function isAvailable(): Promise<boolean> {
  return isBedrockAvailable();
}

/**
 * Get Indigo AI service status
 */
export async function getStatus(): Promise<ServiceStatus> {
  const healthy = await isAvailable();
  
  return {
    name: 'Indigo AI',
    enabled: true,
    healthy,
    lastChecked: new Date().toISOString(),
    features: [
      'Product Descriptions',
      'Marketing Copy',
      'Support Responses',
      'Tag Suggestions',
    ],
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function inferTagCategory(tag: string): string | undefined {
  const categoryPatterns: Record<string, string[]> = {
    material: ['cotton', 'leather', 'silk', 'wool', 'polyester', 'organic', 'recycled'],
    style: ['casual', 'formal', 'vintage', 'modern', 'classic', 'minimalist'],
    color: ['black', 'white', 'blue', 'red', 'green', 'neutral', 'colorful'],
    audience: ['men', 'women', 'kids', 'unisex', 'teen', 'adult'],
    season: ['summer', 'winter', 'spring', 'fall', 'all-season'],
    use: ['everyday', 'sports', 'outdoor', 'office', 'party', 'travel'],
  };

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(pattern => tag.includes(pattern))) {
      return category;
    }
  }

  return undefined;
}

// ============================================================================
// Namespace Export
// ============================================================================

export const IndigoAI = {
  generateDescription,
  generateMarketingCopy,
  generateSupportResponse,
  suggestTags,
  isAvailable,
  getStatus,
};
