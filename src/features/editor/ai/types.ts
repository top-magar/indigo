/**
 * AI Content Assistant Type Definitions
 * AI-powered content generation - DISABLED BY DEFAULT for future scalability
 */

// ============================================================================
// FEATURE FLAG - AI features are now enabled with AWS Bedrock integration
// ============================================================================
export const AI_FEATURES_ENABLED = true;

// AI Provider options
export type AIProvider = "openai" | "anthropic" | "disabled";

// Content generation types
export type AIContentType =
  | "headline"
  | "subheadline"
  | "description"
  | "cta"
  | "product-description"
  | "testimonial"
  | "faq-answer"
  | "faqs"
  | "email-subject"
  | "social-post";

// Tone options for content generation
export type ContentTone =
  | "professional"
  | "casual"
  | "playful"
  | "urgent"
  | "luxurious"
  | "friendly"
  | "authoritative"
  | "empathetic";

// AI feature configuration
export interface AIFeatureConfig {
  generateHeadline: boolean;
  generateDescription: boolean;
  generateCTA: boolean;
  suggestLayout: boolean;
  improveContent: boolean;
  translateContent: boolean;
  generateProductDescription: boolean;
  generateFAQ: boolean;
}

// Complete AI assistant configuration
export interface AIAssistantConfig {
  enabled: boolean;
  provider: AIProvider;
  features: AIFeatureConfig;
  // Rate limiting
  maxRequestsPerMinute: number;
  maxRequestsPerDay: number;
  // Model settings
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

// Default configuration (enabled with AWS Bedrock)
export const DEFAULT_AI_CONFIG: AIAssistantConfig = {
  enabled: AI_FEATURES_ENABLED,
  provider: "disabled", // Will use AWS services via AIService
  features: {
    generateHeadline: true,
    generateDescription: true,
    generateCTA: true,
    suggestLayout: true,
    improveContent: true,
    translateContent: true,
    generateProductDescription: true,
    generateFAQ: true,
  },
  maxRequestsPerMinute: 10,
  maxRequestsPerDay: 100,
  temperature: 0.7,
  maxTokens: 500,
};

// AI generation request
export interface AIGenerateRequest {
  type: AIContentType;
  context: {
    blockType?: string;
    existingContent?: string;
    productName?: string;
    productCategory?: string;
    brandVoice?: string;
    targetAudience?: string;
    keywords?: string[];
  };
  options: {
    tone: ContentTone;
    maxLength?: number;
    language?: string;
    variations?: number; // Number of alternatives to generate
  };
}

// AI generation response
export interface AIGenerateResponse {
  success: boolean;
  content?: string;
  alternatives?: string[];
  error?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// AI improvement request
export interface AIImproveRequest {
  content: string;
  improvementType: "clarity" | "engagement" | "seo" | "brevity" | "grammar";
  context?: {
    targetAudience?: string;
    keywords?: string[];
  };
}

// AI translation request
export interface AITranslateRequest {
  content: string;
  sourceLanguage: string;
  targetLanguage: string;
  preserveFormatting?: boolean;
}

// AI suggestion for layout
export interface AILayoutSuggestion {
  blockType: string;
  variant: string;
  reason: string;
  confidence: number; // 0-1
}

// AI usage tracking
export interface AIUsageRecord {
  id: string;
  tenantId: string;
  userId: string;
  requestType: AIContentType | "improve" | "translate" | "layout";
  tokensUsed: number;
  timestamp: Date;
  success: boolean;
}

// AI usage summary
export interface AIUsageSummary {
  totalRequests: number;
  totalTokens: number;
  requestsToday: number;
  requestsThisMinute: number;
  remainingToday: number;
  remainingThisMinute: number;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if AI features are available
 */
export function isAIAvailable(): boolean {
  return AI_FEATURES_ENABLED;
}

/**
 * Note: For actual AI operations, use the AIEditorService from './ai-editor-service'
 * These functions are kept for backward compatibility but delegate to the service.
 */

/**
 * @deprecated Use AIEditorService.generateHeadline/generateDescription/generateCTA instead
 */
export async function generateContent(
  _request: AIGenerateRequest
): Promise<AIGenerateResponse> {
  if (!AI_FEATURES_ENABLED) {
    return {
      success: false,
      error: "AI features are currently disabled.",
    };
  }

  // Use AIEditorService for actual implementation
  return {
    success: false,
    error: "Use AIEditorService for content generation",
  };
}

/**
 * @deprecated Use AIEditorService.improveContent instead
 */
export async function improveContent(
  _request: AIImproveRequest
): Promise<AIGenerateResponse> {
  if (!AI_FEATURES_ENABLED) {
    return {
      success: false,
      error: "AI features are currently disabled.",
    };
  }

  return {
    success: false,
    error: "Use AIEditorService for content improvement",
  };
}

/**
 * @deprecated Use AIEditorService.translateText instead
 */
export async function translateContent(
  _request: AITranslateRequest
): Promise<AIGenerateResponse> {
  if (!AI_FEATURES_ENABLED) {
    return {
      success: false,
      error: "AI features are currently disabled.",
    };
  }

  return {
    success: false,
    error: "Use AIEditorService for translation",
  };
}

/**
 * @deprecated Use AIEditorService.suggestNextBlock instead
 */
export async function suggestLayout(
  _context: Record<string, unknown>
): Promise<AILayoutSuggestion[]> {
  if (!AI_FEATURES_ENABLED) {
    return [];
  }

  // Use AIEditorService for actual implementation
  return [];
}

/**
 * Get AI usage for rate limiting
 */
export async function getAIUsage(_tenantId: string): Promise<AIUsageSummary> {
  return {
    totalRequests: 0,
    totalTokens: 0,
    requestsToday: 0,
    requestsThisMinute: 0,
    remainingToday: DEFAULT_AI_CONFIG.maxRequestsPerDay,
    remainingThisMinute: DEFAULT_AI_CONFIG.maxRequestsPerMinute,
  };
}

// ============================================================================
// PROMPT TEMPLATES - Ready for when AI is enabled
// ============================================================================

export const AI_PROMPTS = {
  headline: `Generate a compelling headline for a {blockType} section.
Context: {context}
Tone: {tone}
Max length: {maxLength} characters
Requirements:
- Be attention-grabbing and clear
- Include relevant keywords if provided
- Match the specified tone
- Be concise and impactful`,

  description: `Write a product/service description.
Product/Service: {productName}
Category: {category}
Tone: {tone}
Target audience: {targetAudience}
Max length: {maxLength} characters
Requirements:
- Highlight key benefits
- Use persuasive language
- Include a call to action
- Be SEO-friendly`,

  cta: `Generate a call-to-action button text.
Context: {context}
Tone: {tone}
Action type: {actionType}
Requirements:
- Be action-oriented
- Create urgency if appropriate
- Keep it short (2-5 words)
- Be clear about what happens next`,

  improve: `Improve the following content for {improvementType}:
Original: {content}
Requirements:
- Maintain the original meaning
- Improve {improvementType}
- Keep similar length unless brevity is requested
- Preserve any formatting`,
};
