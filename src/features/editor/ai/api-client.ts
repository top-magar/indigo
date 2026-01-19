/**
 * AI Editor API Client
 * 
 * Client-side API wrapper for AI editor features.
 * Makes fetch calls to server-side API routes to avoid bundling AWS SDK in client.
 */

import type { StoreBlock } from '@/types/blocks';
import type { 
  ContentTone, 
  AIGenerateResponse,
  AILayoutSuggestion,
} from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface HeadlineContext {
  storeName?: string;
  industry?: string;
  productName?: string;
  tone: ContentTone;
  existingHeadline?: string;
}

export interface DescriptionContext {
  productName?: string;
  category?: string;
  features?: string[];
  tone: ContentTone;
  maxLength?: number;
  targetAudience?: string;
}

export interface CTAContext {
  action: 'shop' | 'learn' | 'subscribe' | 'contact' | 'download' | 'custom';
  urgency: boolean;
  tone: ContentTone;
  customAction?: string;
}

export interface FAQContext {
  productName?: string;
  category?: string;
  existingFAQs?: Array<{ question: string; answer: string }>;
  count?: number;
}

export interface ImageAnalysisResult {
  success: boolean;
  labels?: string[];
  suggestedAltText?: string;
  dominantColors?: string[];
  containsText?: boolean;
  extractedText?: string;
  isSafe?: boolean;
  moderationLabels?: string[];
  error?: string;
}

export interface ContentImprovementResult {
  success: boolean;
  improvedContent?: string;
  suggestions?: string[];
  readabilityScore?: number;
  error?: string;
}

export interface TranslationResult {
  success: boolean;
  translatedContent?: string;
  detectedLanguage?: string;
  error?: string;
}

export type ImprovementGoal = 'clarity' | 'engagement' | 'seo' | 'brevity' | 'grammar';

// ============================================================================
// API CLIENT
// ============================================================================

const API_BASE = '/api/editor/ai';

async function fetchAPI<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// ============================================================================
// CONTENT GENERATION
// ============================================================================

export async function generateHeadline(context: HeadlineContext): Promise<AIGenerateResponse> {
  try {
    return await fetchAPI<AIGenerateResponse>('/generate', {
      type: 'headline',
      ...context,
    });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate headline' };
  }
}

export async function generateSubheadline(headline: string, tone: ContentTone): Promise<AIGenerateResponse> {
  try {
    return await fetchAPI<AIGenerateResponse>('/generate', {
      type: 'subheadline',
      headline,
      tone,
    });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate subheadline' };
  }
}

export async function generateDescription(context: DescriptionContext): Promise<AIGenerateResponse> {
  try {
    return await fetchAPI<AIGenerateResponse>('/generate', {
      type: 'description',
      ...context,
    });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate description' };
  }
}

export async function generateCTA(context: CTAContext): Promise<AIGenerateResponse> {
  try {
    return await fetchAPI<AIGenerateResponse>('/generate', {
      type: 'cta',
      ...context,
    });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate CTA' };
  }
}

export async function generateFAQs(context: FAQContext): Promise<{
  success: boolean;
  faqs?: Array<{ question: string; answer: string }>;
  error?: string;
}> {
  try {
    return await fetchAPI('/generate', {
      type: 'faqs',
      ...context,
    });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate FAQs' };
  }
}

export async function generateTestimonial(context: {
  productName?: string;
  tone: ContentTone;
}): Promise<AIGenerateResponse> {
  try {
    return await fetchAPI<AIGenerateResponse>('/generate', {
      type: 'testimonial',
      ...context,
    });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate testimonial' };
  }
}

// ============================================================================
// IMAGE ANALYSIS
// ============================================================================

export async function analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
  try {
    return await fetchAPI<ImageAnalysisResult>('/analyze-image', { imageUrl });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to analyze image' };
  }
}

export async function generateAltText(imageUrl: string): Promise<AIGenerateResponse> {
  try {
    const result = await analyzeImage(imageUrl);
    if (result.success && result.suggestedAltText) {
      return { success: true, content: result.suggestedAltText };
    }
    return { success: false, error: result.error || 'Could not generate alt text' };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate alt text' };
  }
}

export async function moderateImage(imageUrl: string): Promise<{
  success: boolean;
  isSafe: boolean;
  issues?: string[];
  error?: string;
}> {
  try {
    const result = await analyzeImage(imageUrl);
    if (result.success) {
      return {
        success: true,
        isSafe: result.isSafe ?? true,
        issues: result.moderationLabels,
      };
    }
    return { success: false, isSafe: false, error: result.error };
  } catch (error) {
    return { success: false, isSafe: false, error: error instanceof Error ? error.message : 'Failed to moderate image' };
  }
}

// ============================================================================
// CONTENT IMPROVEMENT
// ============================================================================

export async function improveContent(
  content: string,
  goal: ImprovementGoal
): Promise<ContentImprovementResult> {
  try {
    return await fetchAPI<ContentImprovementResult>('/improve', { content, goal });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to improve content' };
  }
}

export async function extractKeywords(content: string): Promise<{
  success: boolean;
  keywords?: string[];
  error?: string;
}> {
  try {
    return await fetchAPI('/analyze-content', { content, type: 'keywords' });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to extract keywords' };
  }
}

export async function analyzeSentiment(content: string): Promise<{
  success: boolean;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence?: number;
  error?: string;
}> {
  try {
    return await fetchAPI('/analyze-content', { content, type: 'sentiment' });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to analyze sentiment' };
  }
}

// ============================================================================
// TRANSLATION
// ============================================================================

export async function translateText(
  content: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResult> {
  try {
    return await fetchAPI<TranslationResult>('/translate', {
      content,
      targetLanguage,
      sourceLanguage,
    });
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to translate' };
  }
}

// ============================================================================
// LAYOUT SUGGESTIONS (Client-side only - no AWS needed)
// ============================================================================

export function suggestNextBlock(
  currentBlocks: StoreBlock[],
  pageType: 'home' | 'product' | 'about' | 'contact' | 'landing'
): AILayoutSuggestion[] {
  const currentTypes = currentBlocks.map(b => b.type);
  const suggestions: AILayoutSuggestion[] = [];

  // Home page suggestions
  if (pageType === 'home') {
    if (!currentTypes.includes('hero')) {
      suggestions.push({
        blockType: 'hero',
        variant: 'full-width',
        reason: 'Every home page needs a compelling hero section',
        confidence: 0.95,
      });
    }
    if (!currentTypes.includes('featured-product') && currentTypes.includes('hero')) {
      suggestions.push({
        blockType: 'featured-product',
        variant: 'large-image',
        reason: 'Showcase your best-selling product',
        confidence: 0.85,
      });
    }
    if (!currentTypes.includes('testimonials')) {
      suggestions.push({
        blockType: 'testimonials',
        variant: 'carousel',
        reason: 'Social proof increases conversions',
        confidence: 0.8,
      });
    }
    if (!currentTypes.includes('trust-signals')) {
      suggestions.push({
        blockType: 'trust-signals',
        variant: 'icon-row',
        reason: 'Build trust with guarantees and certifications',
        confidence: 0.75,
      });
    }
  }

  // Product page suggestions
  if (pageType === 'product') {
    if (!currentTypes.includes('faq')) {
      suggestions.push({
        blockType: 'faq',
        variant: 'accordion',
        reason: 'Answer common questions to reduce support requests',
        confidence: 0.85,
      });
    }
    if (!currentTypes.includes('testimonials')) {
      suggestions.push({
        blockType: 'testimonials',
        variant: 'grid',
        reason: 'Product reviews increase purchase confidence',
        confidence: 0.9,
      });
    }
  }

  // Always suggest newsletter if not present
  if (!currentTypes.includes('newsletter') && !currentTypes.includes('footer')) {
    suggestions.push({
      blockType: 'newsletter',
      variant: 'inline',
      reason: 'Capture leads before they leave',
      confidence: 0.7,
    });
  }

  // Always suggest footer last
  if (!currentTypes.includes('footer')) {
    suggestions.push({
      blockType: 'footer',
      variant: 'multi-column',
      reason: 'Every page needs a footer with navigation and contact info',
      confidence: 0.99,
    });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}
