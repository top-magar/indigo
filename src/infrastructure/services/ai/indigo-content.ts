/**
 * Indigo Content Service
 * 
 * Provides AI-powered content management:
 * - Content translation
 * - Language detection
 * - SEO optimization
 * - Content localization
 * 
 * Powered by: AWS Bedrock + AWS Translate
 */

import {
  translateContent as bedrockTranslate,
} from '@/infrastructure/aws/bedrock';
import {
  detectLanguage,
} from '@/infrastructure/aws/comprehend';
import type {
  IndigoServiceResult,
  TranslationOptions,
  TranslatedContent,
  ServiceStatus,
} from './types';

// ============================================================================
// Indigo Content - Translation
// ============================================================================

/**
 * Translate content to another language
 * 
 * @example
 * ```ts
 * const result = await IndigoContent.translate(
 *   'Premium wireless headphones with noise cancellation',
 *   { targetLanguage: 'Spanish', context: 'product' }
 * );
 * ```
 */
export async function translate(
  content: string,
  options: TranslationOptions
): Promise<IndigoServiceResult<TranslatedContent>> {
  const startTime = Date.now();

  try {
    // Detect source language
    const sourceLanguage = await detectLanguage(content);

    // Translate using Bedrock
    const bedrockContext = options.context === 'general' ? undefined : options.context;
    const result = await bedrockTranslate(
      content,
      options.targetLanguage,
      bedrockContext
    );

    if (!result.success || !result.content) {
      return {
        success: false,
        error: result.error || 'Translation failed',
      };
    }

    return {
      success: true,
      data: {
        original: content,
        translated: result.content,
        sourceLanguage,
        targetLanguage: options.targetLanguage,
      },
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-content',
      },
    };
  } catch (error) {
    console.error('[IndigoContent] Translation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
    };
  }
}

/**
 * Batch translate multiple content pieces
 * 
 * @example
 * ```ts
 * const results = await IndigoContent.batchTranslate(
 *   ['Hello', 'Thank you', 'Add to cart'],
 *   { targetLanguage: 'French' }
 * );
 * ```
 */
export async function batchTranslate(
  contents: string[],
  options: TranslationOptions
): Promise<IndigoServiceResult<TranslatedContent[]>> {
  const startTime = Date.now();

  try {
    const translations: TranslatedContent[] = [];

    // Process in parallel with concurrency limit
    const batchSize = 5;
    for (let i = 0; i < contents.length; i += batchSize) {
      const batch = contents.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(content => translate(content, options))
      );

      for (const result of results) {
        if (result.success && result.data) {
          translations.push(result.data);
        }
      }
    }

    return {
      success: true,
      data: translations,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-content',
      },
    };
  } catch (error) {
    console.error('[IndigoContent] Batch translation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Batch translation failed',
    };
  }
}

/**
 * Detect the language of content
 * 
 * @example
 * ```ts
 * const language = await IndigoContent.detectLanguage('Bonjour le monde');
 * // Returns: 'fr'
 * ```
 */
export async function detectContentLanguage(
  content: string
): Promise<IndigoServiceResult<string>> {
  const startTime = Date.now();

  try {
    const language = await detectLanguage(content);

    return {
      success: true,
      data: language,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-content',
      },
    };
  } catch (error) {
    console.error('[IndigoContent] Language detection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Language detection failed',
    };
  }
}

// ============================================================================
// Indigo Content - SEO Optimization
// ============================================================================

/**
 * Generate SEO-optimized meta description
 * 
 * @example
 * ```ts
 * const meta = await IndigoContent.generateMetaDescription(
 *   'Wireless Bluetooth Headphones',
 *   'Premium noise-canceling headphones with 40-hour battery life...'
 * );
 * ```
 */
export async function generateMetaDescription(
  title: string,
  content: string,
  maxLength: number = 160
): Promise<IndigoServiceResult<string>> {
  const startTime = Date.now();

  try {
    // Use Bedrock to generate SEO-optimized description
    const result = await bedrockTranslate(
      `Generate a compelling SEO meta description (max ${maxLength} characters) for:
Title: ${title}
Content: ${content}

Requirements:
- Include primary keywords naturally
- Create urgency or curiosity
- End with a call to action if possible
- Stay under ${maxLength} characters

Return ONLY the meta description, nothing else.`,
      'English',
      'marketing'
    );

    if (!result.success || !result.content) {
      // Fallback: truncate content
      const fallback = content.slice(0, maxLength - 3) + '...';
      return {
        success: true,
        data: fallback,
      };
    }

    // Ensure it's within length limit
    const description = result.content.slice(0, maxLength);

    return {
      success: true,
      data: description,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-content',
      },
    };
  } catch (error) {
    console.error('[IndigoContent] Meta description generation failed:', error);
    // Fallback
    return {
      success: true,
      data: content.slice(0, maxLength - 3) + '...',
    };
  }
}

/**
 * Generate SEO-friendly URL slug
 * 
 * @example
 * ```ts
 * const slug = await IndigoContent.generateSlug('Premium Wireless Headphones - Black Edition');
 * // Returns: 'premium-wireless-headphones-black-edition'
 * ```
 */
export function generateSlug(title: string): IndigoServiceResult<string> {
  try {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

    return {
      success: true,
      data: slug,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to generate slug',
    };
  }
}

/**
 * Suggest keywords for SEO
 * 
 * @example
 * ```ts
 * const keywords = await IndigoContent.suggestKeywords(
 *   'Wireless Bluetooth Headphones',
 *   'Premium noise-canceling headphones...'
 * );
 * ```
 */
export async function suggestKeywords(
  title: string,
  description: string,
  existingKeywords?: string[]
): Promise<IndigoServiceResult<string[]>> {
  const startTime = Date.now();

  try {
    const result = await bedrockTranslate(
      `Suggest 10 SEO keywords for this product:
Title: ${title}
Description: ${description}
${existingKeywords?.length ? `Existing keywords: ${existingKeywords.join(', ')}` : ''}

Return ONLY a comma-separated list of keywords, no explanations.
Focus on: search intent, long-tail keywords, related terms.`,
      'English',
      'marketing'
    );

    if (!result.success || !result.content) {
      return {
        success: false,
        error: 'Failed to suggest keywords',
      };
    }

    const keywords = result.content
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 0 && !existingKeywords?.includes(k));

    return {
      success: true,
      data: keywords,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-content',
      },
    };
  } catch (error) {
    console.error('[IndigoContent] Keyword suggestion failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Keyword suggestion failed',
    };
  }
}

// ============================================================================
// Service Status
// ============================================================================

/**
 * Check if Indigo Content service is available
 */
export function isAvailable(): boolean {
  return true; // Always available with fallbacks
}

/**
 * Get Indigo Content service status
 */
export function getStatus(): ServiceStatus {
  return {
    name: 'Indigo Content',
    enabled: true,
    healthy: true,
    lastChecked: new Date().toISOString(),
    features: [
      'Content Translation',
      'Language Detection',
      'SEO Meta Descriptions',
      'URL Slug Generation',
      'Keyword Suggestions',
    ],
  };
}

// ============================================================================
// Namespace Export
// ============================================================================

export const IndigoContent = {
  translate,
  batchTranslate,
  detectContentLanguage,
  generateMetaDescription,
  generateSlug,
  suggestKeywords,
  isAvailable,
  getStatus,
};
