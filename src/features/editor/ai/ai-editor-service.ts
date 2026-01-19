/**
 * AI Editor Service
 * 
 * Provides AI-powered content generation, image analysis, and content improvement
 * for the visual editor. Wraps the AWS AI services with editor-specific
 * functionality and prompt engineering.
 */

import { AIService } from '@/infrastructure/services';
import type { StoreBlock } from '@/types/blocks';
import type { 
  ContentTone, 
  AIGenerateResponse,
  AILayoutSuggestion,
} from './types';

// Map editor tones to provider tones
type ProviderTone = 'professional' | 'casual' | 'luxury' | 'playful';

function mapToneToProvider(tone: ContentTone): ProviderTone {
  const toneMap: Record<ContentTone, ProviderTone> = {
    professional: 'professional',
    casual: 'casual',
    playful: 'playful',
    urgent: 'professional', // Map urgent to professional
    luxurious: 'luxury',
    friendly: 'casual',
    authoritative: 'professional',
    empathetic: 'casual',
  };
  return toneMap[tone] || 'professional';
}

// Map provider usage to editor usage format
function mapUsage(usage?: { inputTokens: number; outputTokens: number; totalTokens: number }) {
  if (!usage) return undefined;
  return {
    promptTokens: usage.inputTokens,
    completionTokens: usage.outputTokens,
    totalTokens: usage.totalTokens,
  };
}

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
// AI EDITOR SERVICE
// ============================================================================

export class AIEditorService {
  private ai: AIService;

  constructor() {
    this.ai = new AIService();
  }

  // --------------------------------------------------------------------------
  // CONTENT GENERATION
  // --------------------------------------------------------------------------

  /**
   * Generate a compelling headline for a block
   */
  async generateHeadline(context: HeadlineContext): Promise<AIGenerateResponse> {
    const prompt = this.buildHeadlinePrompt(context);
    
    const result = await this.ai.generateText(prompt, {
      tone: mapToneToProvider(context.tone),
      maxTokens: 100,
      temperature: 0.8,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Clean up the response
    const content = this.cleanGeneratedText(result.content || '');
    
    return {
      success: true,
      content,
      usage: mapUsage(result.usage),
    };
  }

  /**
   * Generate a subheadline that complements the headline
   */
  async generateSubheadline(
    headline: string, 
    tone: ContentTone
  ): Promise<AIGenerateResponse> {
    const prompt = `Generate a compelling subheadline to complement this headline:
"${headline}"

Requirements:
- Support and expand on the main headline
- Be concise (1-2 sentences max)
- Match the ${tone} tone
- Add value without repeating the headline
- Create curiosity or highlight a benefit

Return only the subheadline text, no quotes or explanations.`;

    const result = await this.ai.generateText(prompt, {
      tone: mapToneToProvider(tone),
      maxTokens: 150,
      temperature: 0.7,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      content: this.cleanGeneratedText(result.content || ''),
      usage: mapUsage(result.usage),
    };
  }

  /**
   * Generate product or service description
   */
  async generateDescription(context: DescriptionContext): Promise<AIGenerateResponse> {
    const prompt = this.buildDescriptionPrompt(context);
    
    const result = await this.ai.generateText(prompt, {
      tone: mapToneToProvider(context.tone),
      maxTokens: context.maxLength || 300,
      temperature: 0.7,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      content: this.cleanGeneratedText(result.content || ''),
      usage: mapUsage(result.usage),
    };
  }

  /**
   * Generate call-to-action button text
   */
  async generateCTA(context: CTAContext): Promise<AIGenerateResponse> {
    const actionDescriptions: Record<string, string> = {
      shop: 'purchasing products',
      learn: 'learning more about something',
      subscribe: 'subscribing to a newsletter or service',
      contact: 'getting in touch or reaching out',
      download: 'downloading a resource',
      custom: context.customAction || 'taking action',
    };

    const prompt = `Generate 5 call-to-action button texts for ${actionDescriptions[context.action]}.

Requirements:
- Be action-oriented and clear
- Keep each CTA to 2-5 words
- Match the ${context.tone} tone
${context.urgency ? '- Create a sense of urgency' : '- No urgency needed'}
- Make it clear what happens when clicked

Return only the 5 CTAs, one per line, no numbering or explanations.`;

    const result = await this.ai.generateText(prompt, {
      tone: mapToneToProvider(context.tone),
      maxTokens: 100,
      temperature: 0.8,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const alternatives = (result.content || '')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.length < 30);

    return {
      success: true,
      content: alternatives[0] || 'Get Started',
      alternatives: alternatives.slice(1),
      usage: mapUsage(result.usage),
    };
  }

  /**
   * Generate FAQ questions and answers
   */
  async generateFAQs(context: FAQContext): Promise<{
    success: boolean;
    faqs?: Array<{ question: string; answer: string }>;
    error?: string;
  }> {
    const count = context.count || 5;
    const existingQuestions = context.existingFAQs?.map(f => f.question).join('\n- ') || 'None';

    const prompt = `Generate ${count} frequently asked questions and answers for ${context.productName || 'this product/service'}${context.category ? ` in the ${context.category} category` : ''}.

Existing FAQs to avoid duplicating:
- ${existingQuestions}

Requirements:
- Questions should be what real customers would ask
- Answers should be helpful, concise, and informative
- Cover different aspects: features, pricing, shipping, returns, usage
- Each answer should be 2-3 sentences

Format each FAQ as:
Q: [question]
A: [answer]

Generate ${count} FAQs:`;

    const result = await this.ai.generateText(prompt, {
      maxTokens: 800,
      temperature: 0.7,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Parse the FAQ format
    const faqs: Array<{ question: string; answer: string }> = [];
    const content = result.content || '';
    // Use a simpler regex approach that doesn't require 's' flag
    const faqPattern = /Q:\s*([^\n]+)\s*\nA:\s*([^\n]+(?:\n(?!Q:)[^\n]+)*)/g;
    let match;
    
    while ((match = faqPattern.exec(content)) !== null) {
      if (match[1] && match[2]) {
        faqs.push({
          question: match[1].trim(),
          answer: match[2].trim().replace(/\n/g, ' '),
        });
      }
    }

    return { success: true, faqs };
  }

  /**
   * Generate testimonial content (for demo/placeholder purposes)
   */
  async generateTestimonial(context: {
    productName?: string;
    tone: ContentTone;
  }): Promise<AIGenerateResponse> {
    const prompt = `Generate a realistic customer testimonial for ${context.productName || 'this product'}.

Requirements:
- Sound authentic and personal
- Mention specific benefits or features
- Include emotional impact
- Be 2-3 sentences
- Match a ${context.tone} tone

Return only the testimonial text, no quotes or attribution.`;

    const result = await this.ai.generateText(prompt, {
      tone: mapToneToProvider(context.tone),
      maxTokens: 150,
      temperature: 0.8,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      content: this.cleanGeneratedText(result.content || ''),
      usage: mapUsage(result.usage),
    };
  }

  // --------------------------------------------------------------------------
  // IMAGE INTELLIGENCE
  // --------------------------------------------------------------------------

  /**
   * Analyze an image and return insights
   */
  async analyzeImage(imageUrl: string): Promise<ImageAnalysisResult> {
    try {
      const analysis = await this.ai.analyzeImage(imageUrl, {
        detectLabels: true,
        detectText: true,
        moderateContent: true,
        maxLabels: 10,
        minConfidence: 70,
      });

      if (!analysis.success) {
        return { success: false, error: analysis.error };
      }

      // Generate alt text from labels
      const labels = analysis.labels || [];
      const suggestedAltText = this.generateAltTextFromLabels(labels);

      return {
        success: true,
        labels: labels.map(l => l.name),
        suggestedAltText,
        containsText: (analysis.text?.length || 0) > 0,
        extractedText: analysis.text?.join(' '),
        isSafe: analysis.moderation?.isSafe ?? true,
        moderationLabels: analysis.moderation?.violations?.map(v => v.name),
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image analysis failed',
      };
    }
  }

  /**
   * Generate alt text for an image
   */
  async generateAltText(imageUrl: string): Promise<AIGenerateResponse> {
    const analysis = await this.analyzeImage(imageUrl);
    
    if (!analysis.success) {
      return { success: false, error: analysis.error };
    }

    if (analysis.suggestedAltText) {
      return { success: true, content: analysis.suggestedAltText };
    }

    // If no labels, try to generate from context
    return {
      success: true,
      content: 'Image',
    };
  }

  /**
   * Check if image content is safe for publishing
   */
  async moderateImage(imageUrl: string): Promise<{
    success: boolean;
    isSafe: boolean;
    issues?: string[];
    error?: string;
  }> {
    const analysis = await this.analyzeImage(imageUrl);
    
    if (!analysis.success) {
      return { success: false, isSafe: false, error: analysis.error };
    }

    return {
      success: true,
      isSafe: analysis.isSafe ?? true,
      issues: analysis.moderationLabels,
    };
  }

  // --------------------------------------------------------------------------
  // CONTENT IMPROVEMENT
  // --------------------------------------------------------------------------

  /**
   * Improve existing content based on a goal
   */
  async improveContent(
    content: string,
    goal: ImprovementGoal
  ): Promise<ContentImprovementResult> {
    const goalDescriptions: Record<ImprovementGoal, string> = {
      clarity: 'Make the content clearer and easier to understand',
      engagement: 'Make the content more engaging and compelling',
      seo: 'Optimize the content for search engines while keeping it natural',
      brevity: 'Make the content more concise without losing meaning',
      grammar: 'Fix any grammar, spelling, or punctuation errors',
    };

    const prompt = `${goalDescriptions[goal]}:

Original content:
"${content}"

Requirements:
- Maintain the original meaning and intent
- Keep a similar length (unless brevity is the goal)
- Preserve any formatting or structure
- Make meaningful improvements, not just minor tweaks

Return only the improved content, no explanations.`;

    const result = await this.ai.generateText(prompt, {
      maxTokens: Math.max(content.length * 2, 500),
      temperature: 0.5,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      improvedContent: this.cleanGeneratedText(result.content || ''),
    };
  }

  /**
   * Extract SEO keywords from content
   */
  async extractKeywords(content: string): Promise<{
    success: boolean;
    keywords?: string[];
    error?: string;
  }> {
    const result = await this.ai.extractKeyPhrases(content);
    
    return {
      success: true,
      keywords: result.phrases?.map(p => p.text) || [],
    };
  }

  /**
   * Analyze sentiment of content (useful for testimonials)
   */
  async analyzeSentiment(content: string): Promise<{
    success: boolean;
    sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
    confidence?: number;
    error?: string;
  }> {
    const result = await this.ai.analyzeSentiment(content);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Get confidence from scores if available
    const confidence = result.scores 
      ? Math.max(result.scores.positive, result.scores.negative, result.scores.neutral, result.scores.mixed)
      : undefined;

    return {
      success: true,
      sentiment: result.sentiment,
      confidence,
    };
  }

  // --------------------------------------------------------------------------
  // TRANSLATION
  // --------------------------------------------------------------------------

  /**
   * Translate text content
   */
  async translateText(
    content: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    const result = await this.ai.translateText(content, targetLanguage, sourceLanguage);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }

    return {
      success: true,
      translatedContent: result.translatedText,
      detectedLanguage: result.sourceLanguage,
    };
  }

  /**
   * Translate all text fields in a block
   */
  async translateBlock(
    block: StoreBlock,
    targetLanguage: string
  ): Promise<{ success: boolean; block?: StoreBlock; error?: string }> {
    try {
      const translatedSettings = await this.translateObject(
        block.settings as Record<string, unknown>,
        targetLanguage
      );

      return {
        success: true,
        block: { ...block, settings: translatedSettings } as StoreBlock,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Translation failed',
      };
    }
  }

  // --------------------------------------------------------------------------
  // LAYOUT SUGGESTIONS
  // --------------------------------------------------------------------------

  /**
   * Suggest the next block to add based on current page structure
   */
  async suggestNextBlock(
    currentBlocks: StoreBlock[],
    pageType: 'home' | 'product' | 'about' | 'contact' | 'landing'
  ): Promise<AILayoutSuggestion[]> {
    const currentTypes = currentBlocks.map(b => b.type);
    
    // Rule-based suggestions based on page type and existing blocks
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

  // --------------------------------------------------------------------------
  // PRIVATE HELPERS
  // --------------------------------------------------------------------------

  private buildHeadlinePrompt(context: HeadlineContext): string {
    const parts = [
      'Generate a compelling headline',
      context.storeName ? `for ${context.storeName}` : '',
      context.industry ? `in the ${context.industry} industry` : '',
      context.productName ? `featuring ${context.productName}` : '',
    ].filter(Boolean);

    return `${parts.join(' ')}.

Requirements:
- Be attention-grabbing and memorable
- Communicate value clearly
- Match the ${context.tone} tone
- Keep it under 10 words
- Don't use clichés or generic phrases
${context.existingHeadline ? `- Improve upon: "${context.existingHeadline}"` : ''}

Return only the headline text, no quotes or explanations.`;
  }

  private buildDescriptionPrompt(context: DescriptionContext): string {
    return `Write a compelling description for ${context.productName || 'this product/service'}${context.category ? ` in the ${context.category} category` : ''}.

${context.features?.length ? `Key features to highlight:\n- ${context.features.join('\n- ')}` : ''}
${context.targetAudience ? `Target audience: ${context.targetAudience}` : ''}

Requirements:
- Be persuasive and benefit-focused
- Match the ${context.tone} tone
- Keep it under ${context.maxLength || 300} characters
- Include a subtle call to action
- Be SEO-friendly with natural keyword usage

Return only the description text, no quotes or explanations.`;
  }

  private generateAltTextFromLabels(labels: Array<{ name: string; confidence: number }>): string {
    if (labels.length === 0) return 'Image';
    
    // Take top 3 most confident labels
    const topLabels = labels
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 3)
      .map(l => l.name.toLowerCase());

    if (topLabels.length === 1) {
      return `Image of ${topLabels[0]}`;
    }

    const last = topLabels.pop();
    return `Image of ${topLabels.join(', ')} and ${last}`;
  }

  private cleanGeneratedText(text: string): string {
    return text
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/^\s*[-•]\s*/gm, '') // Remove bullet points
      .trim();
  }

  private async translateObject(
    obj: Record<string, unknown>,
    targetLanguage: string
  ): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.length > 0) {
        // Translate string values
        const translation = await this.translateText(value, targetLanguage);
        result[key] = translation.success ? translation.translatedContent : value;
      } else if (Array.isArray(value)) {
        // Handle arrays
        result[key] = await Promise.all(
          value.map(async (item) => {
            if (typeof item === 'string') {
              const translation = await this.translateText(item, targetLanguage);
              return translation.success ? translation.translatedContent : item;
            } else if (typeof item === 'object' && item !== null) {
              return this.translateObject(item as Record<string, unknown>, targetLanguage);
            }
            return item;
          })
        );
      } else if (typeof value === 'object' && value !== null) {
        // Recursively translate nested objects
        result[key] = await this.translateObject(value as Record<string, unknown>, targetLanguage);
      } else {
        // Keep non-string values as-is
        result[key] = value;
      }
    }

    return result;
  }
}

// Export singleton instance
export const aiEditorService = new AIEditorService();
