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
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

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

import type { LanguageCode as PollyLanguageCode } from '@aws-sdk/client-polly';

import {
  extractText as textractExtractText,
} from '@/infrastructure/aws/textract';

// Configuration
const AWS_REGION = process.env.AWS_BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1';
const DEFAULT_MODEL_ID = process.env.AWS_BEDROCK_MODEL_ID || 'amazon.nova-lite-v1:0';

// Model type detection - handles both direct model IDs and inference profiles
const isClaudeModel = (modelId: string) => modelId.includes('anthropic.claude') || modelId.includes('anthropic.');
const isNovaModel = (modelId: string) => modelId.includes('amazon.nova');

export class AWSAIProvider implements AIProvider {
  private bedrockClient: BedrockRuntimeClient | null = null;

  private getBedrockClient(): BedrockRuntimeClient {
    if (!this.bedrockClient) {
      this.bedrockClient = new BedrockRuntimeClient({
        region: AWS_REGION,
        credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
      });
    }
    return this.bedrockClient;
  }

  /**
   * Generate text using AWS Bedrock directly
   */
  async generateText(prompt: string, options?: AIOptions): Promise<AIResult> {
    const client = this.getBedrockClient();
    const maxTokens = options?.maxTokens || 2000;
    const temperature = options?.temperature || 0.7;
    const startTime = Date.now();

    try {
      let body: string;
      
      // Format request based on model type
      if (isClaudeModel(DEFAULT_MODEL_ID)) {
        // Claude/Anthropic format
        body = JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: maxTokens,
          temperature,
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
            temperature,
          },
        });
      } else {
        // Generic format (Llama, Mistral, etc.)
        body = JSON.stringify({
          prompt: prompt,
          max_gen_len: maxTokens,
          temperature,
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

      const duration = Date.now() - startTime;
      console.log(`[AWSAIProvider] ✓ generateText (${duration}ms)`, {
        promptLength: prompt.length,
        responseLength: content?.length || 0,
        maxTokens,
        temperature,
      });

      if (!content) {
        return { success: false, error: 'No content in response' };
      }

      return { success: true, content: content.trim() };
    } catch (error) {
      console.error('[AWSAIProvider] generateText failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate text',
      };
    }
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
    // Map format to Polly's expected format
    const formatMap: Record<string, 'mp3' | 'ogg_vorbis' | 'pcm'> = {
      mp3: 'mp3',
      ogg: 'ogg_vorbis',
      pcm: 'pcm',
    };
    const outputFormat = formatMap[options?.format || 'mp3'] || 'mp3';

    const result = await pollySynthesizeSpeech(text, {
      voiceId: options?.voiceId as VoiceId | undefined,
      languageCode: options?.languageCode as PollyLanguageCode | undefined,
      engine: 'neural',
      outputFormat,
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
