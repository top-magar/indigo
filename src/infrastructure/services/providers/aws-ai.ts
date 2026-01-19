/**
 * AWS AI Provider
 * 
 * Implements AIProvider interface using AWS AI services:
 * - Bedrock for text generation
 * - Rekognition for image analysis
 * - Comprehend for NLP
 * - Translate for translation
 * - Polly for text-to-speech
 * - Textract for document OCR
 */

import type {
  AIProvider,
  AIOptions,
  AIResult,
  ImageAnalysisOptions,
  ImageAnalysis,
  TextExtractionResult,
  SentimentResult,
  TranslationResult,
  SpeechOptions,
  AudioResult,
} from './types';

import {
  generateProductDescription,
  generateMarketingCopy,
  translateContent as bedrockTranslate,
  generateSupportResponse,
} from '@/infrastructure/aws/bedrock';

import {
  moderateImage,
  detectLabels,
  detectText,
} from '@/infrastructure/aws/rekognition';

import {
  analyzeSentiment as comprehendAnalyzeSentiment,
  extractKeyPhrases as comprehendExtractKeyPhrases,
} from '@/infrastructure/aws/comprehend';

import {
  translateText as awsTranslateText,
  type LanguageCode,
} from '@/infrastructure/aws/translate';

import {
  synthesizeSpeech as pollySynthesizeSpeech,
  type VoiceId,
} from '@/infrastructure/aws/polly';

import {
  extractText as textractExtractText,
} from '@/infrastructure/aws/textract';

export class AWSAIProvider implements AIProvider {
  /**
   * Generate text using AWS Bedrock
   */
  async generateText(prompt: string, options?: AIOptions): Promise<AIResult> {
    // Use Bedrock's product description generator as the base
    // Extract any product-like information from the prompt
    const tone = options?.tone || 'professional';
    const length = options?.length || 'medium';
    const includeKeywords = options?.includeKeywords || [];

    // For general text generation, use product description with the prompt as product name
    const result = await generateProductDescription(
      prompt,
      [], // No specific attributes
      { tone, length, includeKeywords }
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      content: result.content,
      // AWS Bedrock doesn't return token usage in our wrapper
      usage: undefined,
    };
  }

  /**
   * Analyze image using AWS Rekognition
   */
  async analyzeImage(
    image: Buffer | string,
    options?: ImageAnalysisOptions
  ): Promise<ImageAnalysis> {
    const imageSource = typeof image === 'string'
      ? { s3Key: image }
      : { bytes: new Uint8Array(image) };

    try {
      const results = await Promise.all([
        options?.detectLabels !== false
          ? detectLabels(imageSource, options?.maxLabels || 15)
          : Promise.resolve({ labels: [] }),
        options?.detectText !== false
          ? detectText(imageSource)
          : Promise.resolve({ textDetections: [] }),
        options?.moderateContent !== false
          ? moderateImage(imageSource)
          : Promise.resolve({ isSafe: true, labels: [] }),
      ]);

      const [labelsResult, textResult, moderationResult] = results;

      // Filter by minimum confidence if specified
      const minConfidence = options?.minConfidence || 0;
      const filteredLabels = labelsResult.labels
        .filter(l => l.confidence >= minConfidence)
        .map(l => ({
          name: l.name,
          confidence: l.confidence,
        }));

      const filteredText = textResult.textDetections
        .filter(t => t.type === 'LINE' && t.confidence >= minConfidence)
        .map(t => ({
          text: t.text,
          confidence: t.confidence,
        }));

      return {
        success: true,
        labels: filteredLabels.length > 0 ? filteredLabels : undefined,
        text: filteredText.length > 0 ? filteredText : undefined,
        moderation: {
          isSafe: moderationResult.isSafe,
          violations: moderationResult.labels.map(l => ({
            name: l.name,
            confidence: l.confidence,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image analysis failed',
      };
    }
  }

  /**
   * Extract text from document using AWS Textract
   */
  async extractText(document: Buffer | string): Promise<TextExtractionResult> {
    const documentSource = typeof document === 'string'
      ? { s3Key: document }
      : { bytes: new Uint8Array(document) };

    const result = await textractExtractText(documentSource);

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    // Convert lines to blocks format
    const blocks = result.lines?.map(line => ({
      text: line.text,
      type: 'LINE' as const,
      confidence: line.confidence,
    }));

    return {
      success: true,
      text: result.text,
      blocks,
    };
  }

  /**
   * Analyze sentiment using AWS Comprehend
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const result = await comprehendAnalyzeSentiment(text);

    // Convert AWS sentiment format to our interface
    const sentimentMap = {
      POSITIVE: 'positive' as const,
      NEGATIVE: 'negative' as const,
      NEUTRAL: 'neutral' as const,
      MIXED: 'mixed' as const,
    };

    return {
      success: true,
      sentiment: sentimentMap[result.sentiment],
      scores: result.scores,
    };
  }

  /**
   * Extract key phrases using AWS Comprehend
   */
  async extractKeyPhrases(text: string): Promise<{ phrases: Array<{ text: string; score: number }> }> {
    const result = await comprehendExtractKeyPhrases(text);
    return { phrases: result.phrases };
  }

  /**
   * Translate text using AWS Translate
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    const result = await awsTranslateText(
      text,
      targetLanguage as LanguageCode,
      sourceLanguage as LanguageCode | undefined
    );

    return {
      success: result.success,
      translatedText: result.translatedText,
      sourceLanguage: result.sourceLanguage,
      targetLanguage: result.targetLanguage,
      error: result.error,
    };
  }

  /**
   * Synthesize speech using AWS Polly
   */
  async synthesizeSpeech(text: string, options?: SpeechOptions): Promise<AudioResult> {
    const result = await pollySynthesizeSpeech(text, {
      voiceId: options?.voiceId as VoiceId | undefined,
      languageCode: options?.languageCode as LanguageCode | undefined,
      engine: 'neural',
      outputFormat: options?.format || 'mp3',
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      audioData: result.audioStream ? Buffer.from(result.audioStream) : undefined,
      contentType: result.contentType,
    };
  }
}
