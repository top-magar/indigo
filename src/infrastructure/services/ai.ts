/**
 * AI Service
 * 
 * Unified AI interface with automatic provider selection,
 * error handling, retry logic, and observability
 */

import { ServiceFactory } from './factory';
import { ServiceErrorHandler } from './error-handler';
import { ServiceObservability } from './observability';
import { ServiceValidator } from './validation';
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
} from './providers/types';

export class AIService {
  private provider: AIProvider;

  constructor() {
    this.provider = ServiceFactory.getAIProvider();
  }

  /**
   * Generate text with validation, retry, and observability
   */
  async generateText(prompt: string, options?: AIOptions): Promise<AIResult> {
    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return { success: false, error: 'Prompt is required' };
    }

    const promptValidation = ServiceValidator.validateTextLength(prompt, 10000, 1);
    if (!promptValidation.valid) {
      return { success: false, error: `Invalid prompt: ${promptValidation.error}` };
    }

    // Validate options
    if (options?.maxTokens !== undefined && (options.maxTokens < 1 || options.maxTokens > 4000)) {
      return { success: false, error: 'maxTokens must be between 1 and 4000' };
    }

    if (options?.temperature !== undefined && (options.temperature < 0 || options.temperature > 1)) {
      return { success: false, error: 'temperature must be between 0 and 1' };
    }

    // Track and execute with retry and circuit breaker
    try {
      const result = await ServiceObservability.trackOperation(
        'generateText',
        this.provider.constructor.name,
        () => ServiceObservability.withCircuitBreaker(
          'ai-generate-text',
          () => ServiceErrorHandler.withRetry(
            () => this.provider.generateText(prompt, options),
            {
              maxRetries: 2,
              backoffMs: 500,
              onRetry: (attempt, error) => {
                ServiceObservability.log(
                  'warn',
                  `Text generation retry attempt ${attempt}`,
                  'generateText',
                  this.provider.constructor.name,
                  { error: error.message, promptLength: prompt.length }
                );
              },
            }
          )
        ),
        {
          metadata: {
            promptLength: prompt.length,
            tone: options?.tone,
            length: options?.length,
            maxTokens: options?.maxTokens,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Text generation failed after retries',
        'generateText',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate text',
      };
    }
  }

  /**
   * Analyze image with validation, retry, and observability
   */
  async analyzeImage(
    image: Buffer | string,
    options?: ImageAnalysisOptions
  ): Promise<ImageAnalysis> {
    // Validate image
    if (typeof image === 'string') {
      // S3 key validation
      if (!image || image.length === 0) {
        return { success: false, error: 'Invalid S3 key' };
      }
    } else {
      // Buffer validation
      const fileValidation = ServiceValidator.validateUploadFile(image, {
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        minSizeBytes: 1,
      });
      if (!fileValidation.valid) {
        return { success: false, error: fileValidation.error };
      }
    }

    // Validate options
    if (options?.maxLabels !== undefined && (options.maxLabels < 1 || options.maxLabels > 100)) {
      return { success: false, error: 'maxLabels must be between 1 and 100' };
    }

    if (options?.minConfidence !== undefined && (options.minConfidence < 0 || options.minConfidence > 100)) {
      return { success: false, error: 'minConfidence must be between 0 and 100' };
    }

    // Track and execute with retry and circuit breaker
    try {
      const result = await ServiceObservability.trackOperation(
        'analyzeImage',
        this.provider.constructor.name,
        () => ServiceObservability.withCircuitBreaker(
          'ai-analyze-image',
          () => ServiceErrorHandler.withRetry(
            () => this.provider.analyzeImage(image, options),
            {
              maxRetries: 2,
              backoffMs: 500,
              onRetry: (attempt, error) => {
                ServiceObservability.log(
                  'warn',
                  `Image analysis retry attempt ${attempt}`,
                  'analyzeImage',
                  this.provider.constructor.name,
                  { error: error.message }
                );
              },
            }
          )
        ),
        {
          metadata: {
            imageType: typeof image === 'string' ? 's3Key' : 'buffer',
            imageSize: typeof image === 'string' ? undefined : image.byteLength,
            detectLabels: options?.detectLabels,
            detectText: options?.detectText,
            moderateContent: options?.moderateContent,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Image analysis failed after retries',
        'analyzeImage',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze image',
      };
    }
  }

  /**
   * Extract text from document with validation and retry
   */
  async extractText(document: Buffer | string): Promise<TextExtractionResult> {
    // Validate document
    if (typeof document === 'string') {
      if (!document || document.length === 0) {
        return { success: false, error: 'Invalid S3 key' };
      }
    } else {
      const fileValidation = ServiceValidator.validateUploadFile(document, {
        maxSizeBytes: 10 * 1024 * 1024, // 10MB
        minSizeBytes: 1,
      });
      if (!fileValidation.valid) {
        return { success: false, error: fileValidation.error };
      }
    }

    // Track and execute with retry
    try {
      const result = await ServiceObservability.trackOperation(
        'extractText',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.extractText(document),
          {
            maxRetries: 2,
            backoffMs: 500,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Text extraction retry attempt ${attempt}`,
                'extractText',
                this.provider.constructor.name,
                { error: error.message }
              );
            },
          }
        ),
        {
          metadata: {
            documentType: typeof document === 'string' ? 's3Key' : 'buffer',
            documentSize: typeof document === 'string' ? undefined : document.byteLength,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Text extraction failed after retries',
        'extractText',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to extract text',
      };
    }
  }

  /**
   * Analyze sentiment with validation and retry
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    // Validate text
    if (!text || typeof text !== 'string') {
      return { success: false, error: 'Text is required' };
    }

    const textValidation = ServiceValidator.validateTextLength(text, 5000, 1);
    if (!textValidation.valid) {
      return { success: false, error: `Invalid text: ${textValidation.error}` };
    }

    // Track and execute with retry
    try {
      const result = await ServiceObservability.trackOperation(
        'analyzeSentiment',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.analyzeSentiment(text),
          {
            maxRetries: 2,
            backoffMs: 200,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Sentiment analysis retry attempt ${attempt}`,
                'analyzeSentiment',
                this.provider.constructor.name,
                { error: error.message }
              );
            },
          }
        ),
        {
          metadata: {
            textLength: text.length,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Sentiment analysis failed after retries',
        'analyzeSentiment',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze sentiment',
      };
    }
  }

  /**
   * Extract key phrases with validation and retry
   */
  async extractKeyPhrases(text: string): Promise<{ phrases: Array<{ text: string; score: number }> }> {
    // Validate text
    if (!text || typeof text !== 'string') {
      return { phrases: [] };
    }

    const textValidation = ServiceValidator.validateTextLength(text, 5000, 1);
    if (!textValidation.valid) {
      return { phrases: [] };
    }

    // Track and execute with retry
    try {
      const result = await ServiceObservability.trackOperation(
        'extractKeyPhrases',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.extractKeyPhrases(text),
          {
            maxRetries: 2,
            backoffMs: 200,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Key phrase extraction retry attempt ${attempt}`,
                'extractKeyPhrases',
                this.provider.constructor.name,
                { error: error.message }
              );
            },
          }
        ),
        {
          metadata: {
            textLength: text.length,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Key phrase extraction failed after retries',
        'extractKeyPhrases',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return { phrases: [] };
    }
  }

  /**
   * Translate text with validation and retry
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    // Validate text
    if (!text || typeof text !== 'string') {
      return { success: false, error: 'Text is required' };
    }

    const textValidation = ServiceValidator.validateTextLength(text, 10000, 1);
    if (!textValidation.valid) {
      return { success: false, error: `Invalid text: ${textValidation.error}` };
    }

    // Validate language codes
    const languageValidation = ServiceValidator.validateLanguageCode(targetLanguage);
    if (!languageValidation.valid) {
      return { success: false, error: `Invalid target language: ${languageValidation.error}` };
    }

    if (sourceLanguage) {
      const sourceValidation = ServiceValidator.validateLanguageCode(sourceLanguage);
      if (!sourceValidation.valid) {
        return { success: false, error: `Invalid source language: ${sourceValidation.error}` };
      }
    }

    // Track and execute with retry
    try {
      const result = await ServiceObservability.trackOperation(
        'translateText',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.translateText(text, targetLanguage, sourceLanguage),
          {
            maxRetries: 2,
            backoffMs: 300,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Translation retry attempt ${attempt}`,
                'translateText',
                this.provider.constructor.name,
                { error: error.message }
              );
            },
          }
        ),
        {
          metadata: {
            textLength: text.length,
            targetLanguage,
            sourceLanguage,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Translation failed after retries',
        'translateText',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to translate text',
      };
    }
  }

  /**
   * Synthesize speech with validation and retry
   */
  async synthesizeSpeech(text: string, options?: SpeechOptions): Promise<AudioResult> {
    // Validate text
    if (!text || typeof text !== 'string') {
      return { success: false, error: 'Text is required' };
    }

    const textValidation = ServiceValidator.validateTextLength(text, 3000, 1);
    if (!textValidation.valid) {
      return { success: false, error: `Invalid text: ${textValidation.error}` };
    }

    // Validate language code if provided
    if (options?.languageCode) {
      const languageValidation = ServiceValidator.validateLanguageCode(options.languageCode);
      if (!languageValidation.valid) {
        return { success: false, error: `Invalid language code: ${languageValidation.error}` };
      }
    }

    // Track and execute with retry
    try {
      const result = await ServiceObservability.trackOperation(
        'synthesizeSpeech',
        this.provider.constructor.name,
        () => ServiceErrorHandler.withRetry(
          () => this.provider.synthesizeSpeech(text, options),
          {
            maxRetries: 2,
            backoffMs: 300,
            onRetry: (attempt, error) => {
              ServiceObservability.log(
                'warn',
                `Speech synthesis retry attempt ${attempt}`,
                'synthesizeSpeech',
                this.provider.constructor.name,
                { error: error.message }
              );
            },
          }
        ),
        {
          metadata: {
            textLength: text.length,
            voiceId: options?.voiceId,
            languageCode: options?.languageCode,
            format: options?.format,
          },
        }
      );

      return result;
    } catch (error) {
      ServiceObservability.log(
        'error',
        'Speech synthesis failed after retries',
        'synthesizeSpeech',
        this.provider.constructor.name,
        { error: error instanceof Error ? error.message : String(error) }
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to synthesize speech',
      };
    }
  }

  /**
   * Get the current provider name
   */
  getProviderName(): string {
    return this.provider.constructor.name;
  }
}
