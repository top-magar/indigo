/**
 * AI Editor Module
 * 
 * Provides AI-powered content generation, image analysis, content improvement,
 * translation, and layout suggestions for the visual editor.
 * 
 * Uses AWS services via API routes:
 * - Amazon Bedrock (Claude) for text generation
 * - Amazon Rekognition for image analysis
 * - Amazon Comprehend for sentiment/keyword extraction
 * - Amazon Translate for multi-language support
 * 
 * IMPORTANT: The AIEditorService (ai-editor-service.ts) should ONLY be imported
 * in server-side code (API routes). It is NOT exported from this module to prevent
 * AWS SDK from being bundled in client components.
 * 
 * Client components should use:
 * - The hooks (useAI*) which call API routes
 * - The api-client functions which make fetch calls
 * - The UI components (BlockAISettings, etc.)
 */

// Types
export * from './types';

// Client-side API functions (for direct use in client components)
export {
  generateHeadline,
  generateSubheadline,
  generateDescription,
  generateCTA,
  generateFAQs,
  generateTestimonial,
  analyzeImage,
  generateAltText,
  moderateImage,
  improveContent,
  extractKeywords,
  analyzeSentiment,
  translateText,
  suggestNextBlock,
  type HeadlineContext,
  type DescriptionContext,
  type CTAContext,
  type FAQContext,
  type ImageAnalysisResult,
  type ContentImprovementResult,
  type TranslationResult,
  type ImprovementGoal,
} from './api-client';

// Hooks (recommended for React components)
export {
  useAIHeadline,
  useAISubheadline,
  useAIDescription,
  useAICTA,
  useAIFAQs,
  useAIImageAnalysis,
  useAIAltText,
  useAIModeration,
  useAIImprove,
  useAIKeywords,
  useAISentiment,
  useAITranslate,
  useAILayoutSuggestions,
  type UseAIGenerateReturn,
  type AIOperationState,
} from './use-ai-editor';

// Components (client-safe)
export * from './components';

// NOTE: AIEditorService is NOT exported here to prevent AWS SDK bundling in client.
// Import it directly in API routes: import { AIEditorService } from '@/features/editor/ai/ai-editor-service';
