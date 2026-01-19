/**
 * Local AI Provider
 * 
 * Mock implementation of AIProvider for local development and testing
 * Returns realistic mock responses without calling external services
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

export class LocalAIProvider implements AIProvider {
  /**
   * Generate mock text based on prompt
   */
  async generateText(prompt: string, options?: AIOptions): Promise<AIResult> {
    console.log('[LocalAIProvider] Generating text for prompt:', prompt.substring(0, 50) + '...');

    // Simulate processing delay
    await this.delay(500);

    const tone = options?.tone || 'professional';
    const length = options?.length || 'medium';

    // Generate template-based response
    const templates = {
      short: `This is a ${tone} response to your request. It provides a concise answer based on the prompt.`,
      medium: `This is a ${tone} response to your request. It provides a detailed answer that addresses the key points in your prompt. The content is generated locally for testing purposes and demonstrates the expected format and structure.`,
      long: `This is a ${tone} response to your request. It provides a comprehensive answer that thoroughly addresses all aspects of your prompt. The content is generated locally for testing purposes and demonstrates the expected format, structure, and level of detail. This longer response includes multiple sentences to simulate a more detailed output that would be typical for this length setting.`,
    };

    const content = templates[length];

    return {
      success: true,
      content,
      usage: {
        inputTokens: Math.ceil(prompt.length / 4),
        outputTokens: Math.ceil(content.length / 4),
        totalTokens: Math.ceil((prompt.length + content.length) / 4),
      },
    };
  }

  /**
   * Generate mock image analysis
   */
  async analyzeImage(
    image: Buffer | string,
    options?: ImageAnalysisOptions
  ): Promise<ImageAnalysis> {
    console.log('[LocalAIProvider] Analyzing image:', typeof image === 'string' ? image : `Buffer(${image.byteLength} bytes)`);

    // Simulate processing delay
    await this.delay(800);

    const mockLabels = [
      { name: 'Product', confidence: 95.5 },
      { name: 'Object', confidence: 92.3 },
      { name: 'Item', confidence: 88.7 },
      { name: 'Commercial', confidence: 85.2 },
      { name: 'Retail', confidence: 82.1 },
    ];

    const mockText = [
      { text: 'SAMPLE TEXT', confidence: 98.5 },
      { text: 'Product Name', confidence: 95.2 },
      { text: '$99.99', confidence: 97.8 },
    ];

    return {
      success: true,
      labels: options?.detectLabels !== false ? mockLabels.slice(0, options?.maxLabels || 5) : undefined,
      text: options?.detectText !== false ? mockText : undefined,
      moderation: options?.moderateContent !== false ? {
        isSafe: true,
        violations: [],
      } : undefined,
    };
  }

  /**
   * Generate mock text extraction
   */
  async extractText(document: Buffer | string): Promise<TextExtractionResult> {
    console.log('[LocalAIProvider] Extracting text from document:', typeof document === 'string' ? document : `Buffer(${document.byteLength} bytes)`);

    // Simulate processing delay
    await this.delay(1000);

    const mockText = `INVOICE

Invoice Number: INV-2024-001
Date: January 15, 2024

Bill To:
Sample Customer
123 Main Street
City, State 12345

Items:
1. Product A - Quantity: 2 - Price: $50.00 - Total: $100.00
2. Product B - Quantity: 1 - Price: $75.00 - Total: $75.00

Subtotal: $175.00
Tax (8%): $14.00
Total: $189.00

Thank you for your business!`;

    const mockBlocks = [
      { text: 'INVOICE', type: 'LINE' as const, confidence: 99.5 },
      { text: 'Invoice Number: INV-2024-001', type: 'LINE' as const, confidence: 98.2 },
      { text: 'Date: January 15, 2024', type: 'LINE' as const, confidence: 97.8 },
      { text: 'Total: $189.00', type: 'LINE' as const, confidence: 99.1 },
    ];

    return {
      success: true,
      text: mockText,
      blocks: mockBlocks,
    };
  }

  /**
   * Generate mock sentiment analysis
   */
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    console.log('[LocalAIProvider] Analyzing sentiment for text:', text.substring(0, 50) + '...');

    // Simulate processing delay
    await this.delay(300);

    // Simple keyword-based sentiment detection
    const lowerText = text.toLowerCase();
    const positiveWords = ['great', 'excellent', 'amazing', 'love', 'good', 'best', 'wonderful', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'poor', 'disappointing'];

    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;

    let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
    let scores = { positive: 0.33, negative: 0.33, neutral: 0.34, mixed: 0 };

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      scores = { positive: 0.85, negative: 0.05, neutral: 0.08, mixed: 0.02 };
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      scores = { positive: 0.05, negative: 0.85, neutral: 0.08, mixed: 0.02 };
    } else if (positiveCount > 0 && negativeCount > 0) {
      sentiment = 'mixed';
      scores = { positive: 0.35, negative: 0.35, neutral: 0.10, mixed: 0.20 };
    } else {
      sentiment = 'neutral';
      scores = { positive: 0.10, negative: 0.10, neutral: 0.75, mixed: 0.05 };
    }

    return {
      success: true,
      sentiment,
      scores,
    };
  }

  /**
   * Generate mock key phrases
   */
  async extractKeyPhrases(text: string): Promise<{ phrases: Array<{ text: string; score: number }> }> {
    console.log('[LocalAIProvider] Extracting key phrases from text:', text.substring(0, 50) + '...');

    // Simulate processing delay
    await this.delay(300);

    // Extract simple phrases (words longer than 4 characters)
    const words = text.split(/\s+/).filter(word => word.length > 4);
    const uniqueWords = [...new Set(words)];
    
    const phrases = uniqueWords.slice(0, 10).map((word, index) => ({
      text: word.replace(/[^a-zA-Z0-9]/g, ''),
      score: 0.95 - (index * 0.05),
    })).filter(p => p.text.length > 0);

    return { phrases };
  }

  /**
   * Generate mock translation
   */
  async translateText(
    text: string,
    targetLanguage: string,
    sourceLanguage?: string
  ): Promise<TranslationResult> {
    console.log('[LocalAIProvider] Translating text to', targetLanguage);

    // Simulate processing delay
    await this.delay(400);

    // Mock translation by adding a prefix
    const translatedText = `[TRANSLATED to ${targetLanguage}] ${text}`;

    return {
      success: true,
      translatedText,
      sourceLanguage: sourceLanguage || 'en',
      targetLanguage,
    };
  }

  /**
   * Generate mock speech synthesis
   */
  async synthesizeSpeech(text: string, options?: SpeechOptions): Promise<AudioResult> {
    console.log('[LocalAIProvider] Synthesizing speech for text:', text.substring(0, 50) + '...');

    // Simulate processing delay
    await this.delay(600);

    // Return empty buffer (no actual audio in local mode)
    const mockAudioData = Buffer.from([]);

    return {
      success: true,
      audioData: mockAudioData,
      contentType: `audio/${options?.format || 'mp3'}`,
    };
  }

  /**
   * Helper to simulate async delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
