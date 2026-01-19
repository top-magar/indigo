/**
 * AI Editor Hooks
 * 
 * React hooks for using AI features in the visual editor.
 * Provides loading states, error handling, and usage tracking.
 * 
 * Uses API routes to avoid bundling AWS SDK in client code.
 */

'use client';

import { useState, useCallback } from 'react';
import * as aiClient from './api-client';
import type { 
  HeadlineContext,
  DescriptionContext,
  CTAContext,
  FAQContext,
  ImprovementGoal,
  ImageAnalysisResult,
} from './api-client';
import type { AIGenerateResponse, AILayoutSuggestion, ContentTone } from './types';
import type { StoreBlock } from '@/types/blocks';

// Re-export types for convenience
export type { HeadlineContext, DescriptionContext, CTAContext, FAQContext, ImprovementGoal };

// ============================================================================
// TYPES
// ============================================================================

export interface AIOperationState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAIGenerateReturn {
  generate: () => Promise<void>;
  result: AIGenerateResponse | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
}

// ============================================================================
// CONTENT GENERATION HOOKS
// ============================================================================

/**
 * Hook for generating headlines
 */
export function useAIHeadline(context: HeadlineContext): UseAIGenerateReturn {
  const [state, setState] = useState<AIOperationState<AIGenerateResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const generate = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.generateHeadline(context);
      setState({ data: result, loading: false, error: result.error || null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate headline' 
      });
    }
  }, [context]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    generate,
    result: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

/**
 * Hook for generating subheadlines
 */
export function useAISubheadline(headline: string, tone: ContentTone): UseAIGenerateReturn {
  const [state, setState] = useState<AIOperationState<AIGenerateResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const generate = useCallback(async () => {
    if (!headline) {
      setState({ data: null, loading: false, error: 'Headline is required' });
      return;
    }

    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.generateSubheadline(headline, tone);
      setState({ data: result, loading: false, error: result.error || null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate subheadline' 
      });
    }
  }, [headline, tone]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    generate,
    result: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

/**
 * Hook for generating descriptions
 */
export function useAIDescription(context: DescriptionContext): UseAIGenerateReturn {
  const [state, setState] = useState<AIOperationState<AIGenerateResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const generate = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.generateDescription(context);
      setState({ data: result, loading: false, error: result.error || null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate description' 
      });
    }
  }, [context]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    generate,
    result: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

/**
 * Hook for generating CTAs
 */
export function useAICTA(context: CTAContext): UseAIGenerateReturn {
  const [state, setState] = useState<AIOperationState<AIGenerateResponse>>({
    data: null,
    loading: false,
    error: null,
  });

  const generate = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.generateCTA(context);
      setState({ data: result, loading: false, error: result.error || null });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate CTA' 
      });
    }
  }, [context]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    generate,
    result: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

/**
 * Hook for generating FAQs
 */
export function useAIFAQs(context: FAQContext) {
  const [state, setState] = useState<AIOperationState<Array<{ question: string; answer: string }>>>({
    data: null,
    loading: false,
    error: null,
  });

  const generate = useCallback(async () => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.generateFAQs(context);
      setState({ 
        data: result.faqs || null, 
        loading: false, 
        error: result.error || null 
      });
    } catch (error) {
      setState({ 
        data: null, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Failed to generate FAQs' 
      });
    }
  }, [context]);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    generate,
    faqs: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

// ============================================================================
// IMAGE ANALYSIS HOOKS
// ============================================================================

/**
 * Hook for analyzing images
 */
export function useAIImageAnalysis() {
  const [state, setState] = useState<AIOperationState<ImageAnalysisResult>>({
    data: null,
    loading: false,
    error: null,
  });

  const analyze = useCallback(async (imageUrl: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.analyzeImage(imageUrl);
      setState({ data: result, loading: false, error: result.error || null });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to analyze image';
      setState({ data: null, loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    analyze,
    result: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

/**
 * Hook for generating alt text
 */
export function useAIAltText() {
  const [state, setState] = useState<AIOperationState<string>>({
    data: null,
    loading: false,
    error: null,
  });

  const generate = useCallback(async (imageUrl: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.generateAltText(imageUrl);
      setState({ 
        data: result.content || null, 
        loading: false, 
        error: result.error || null 
      });
      return result.content;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate alt text';
      setState({ data: null, loading: false, error: errorMsg });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    generate,
    altText: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

/**
 * Hook for content moderation
 */
export function useAIModeration() {
  const [state, setState] = useState<AIOperationState<{ isSafe: boolean; issues?: string[] }>>({
    data: null,
    loading: false,
    error: null,
  });

  const moderate = useCallback(async (imageUrl: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.moderateImage(imageUrl);
      setState({ 
        data: result.success ? { isSafe: result.isSafe, issues: result.issues } : null, 
        loading: false, 
        error: result.error || null 
      });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to moderate image';
      setState({ data: null, loading: false, error: errorMsg });
      return { success: false, isSafe: false, error: errorMsg };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    moderate,
    result: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

// ============================================================================
// CONTENT IMPROVEMENT HOOKS
// ============================================================================

/**
 * Hook for improving content
 */
export function useAIImprove() {
  const [state, setState] = useState<AIOperationState<string>>({
    data: null,
    loading: false,
    error: null,
  });

  const improve = useCallback(async (content: string, goal: ImprovementGoal) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.improveContent(content, goal);
      setState({ 
        data: result.improvedContent || null, 
        loading: false, 
        error: result.error || null 
      });
      return result.improvedContent;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to improve content';
      setState({ data: null, loading: false, error: errorMsg });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    improve,
    improvedContent: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

/**
 * Hook for extracting keywords
 */
export function useAIKeywords() {
  const [state, setState] = useState<AIOperationState<string[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const extract = useCallback(async (content: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.extractKeywords(content);
      setState({ 
        data: result.keywords || null, 
        loading: false, 
        error: result.error || null 
      });
      return result.keywords;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to extract keywords';
      setState({ data: null, loading: false, error: errorMsg });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    extract,
    keywords: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

/**
 * Hook for sentiment analysis
 */
export function useAISentiment() {
  const [state, setState] = useState<AIOperationState<{ sentiment: string; confidence: number }>>({
    data: null,
    loading: false,
    error: null,
  });

  const analyze = useCallback(async (content: string) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.analyzeSentiment(content);
      setState({ 
        data: result.success ? { 
          sentiment: result.sentiment || 'neutral', 
          confidence: result.confidence || 0 
        } : null, 
        loading: false, 
        error: result.error || null 
      });
      return result;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to analyze sentiment';
      setState({ data: null, loading: false, error: errorMsg });
      return { success: false, error: errorMsg };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    analyze,
    result: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

// ============================================================================
// TRANSLATION HOOKS
// ============================================================================

/**
 * Hook for translating content
 */
export function useAITranslate() {
  const [state, setState] = useState<AIOperationState<string>>({
    data: null,
    loading: false,
    error: null,
  });

  const translate = useCallback(async (
    content: string, 
    targetLanguage: string,
    sourceLanguage?: string
  ) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      const result = await aiClient.translateText(content, targetLanguage, sourceLanguage);
      setState({ 
        data: result.translatedContent || null, 
        loading: false, 
        error: result.error || null 
      });
      return result.translatedContent;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to translate';
      setState({ data: null, loading: false, error: errorMsg });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    translate,
    translatedContent: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}

// ============================================================================
// LAYOUT SUGGESTION HOOKS
// ============================================================================

/**
 * Hook for getting layout suggestions
 */
export function useAILayoutSuggestions() {
  const [state, setState] = useState<AIOperationState<AILayoutSuggestion[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const getSuggestions = useCallback(async (
    currentBlocks: StoreBlock[],
    pageType: 'home' | 'product' | 'about' | 'contact' | 'landing'
  ) => {
    setState({ data: null, loading: true, error: null });
    
    try {
      // This is client-side only, no AWS needed
      const suggestions = aiClient.suggestNextBlock(currentBlocks, pageType);
      setState({ data: suggestions, loading: false, error: null });
      return suggestions;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to get suggestions';
      setState({ data: null, loading: false, error: errorMsg });
      return [];
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    getSuggestions,
    suggestions: state.data,
    loading: state.loading,
    error: state.error,
    reset,
  };
}
