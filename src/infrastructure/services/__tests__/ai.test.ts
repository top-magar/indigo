/**
 * AI Service Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AIService } from '../ai';
import { ServiceFactory } from '../factory';
import { LocalAIProvider } from '../providers/local-ai';

describe('AIService', () => {
  beforeEach(() => {
    // Register local provider for testing
    ServiceFactory.registerAIProvider('local', new LocalAIProvider());
    process.env.AI_PROVIDER = 'local';
  });

  describe('generateText', () => {
    it('should generate text successfully', async () => {
      const service = new AIService();
      const result = await service.generateText('Generate a product description');

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();
      expect(result.content).toContain('response');
    });

    it('should validate prompt length', async () => {
      const service = new AIService();
      const result = await service.generateText('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Prompt');
    });

    it('should validate maxTokens', async () => {
      const service = new AIService();
      const result = await service.generateText('Test prompt', { maxTokens: 5000 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('maxTokens');
    });
  });

  describe('analyzeImage', () => {
    it('should analyze image from buffer', async () => {
      const service = new AIService();
      const mockImage = Buffer.from('fake image data');
      const result = await service.analyzeImage(mockImage);

      expect(result.success).toBe(true);
      expect(result.labels).toBeDefined();
    });

    it('should analyze image from S3 key', async () => {
      const service = new AIService();
      const result = await service.analyzeImage('tenant-123/product.jpg');

      expect(result.success).toBe(true);
      expect(result.labels).toBeDefined();
    });

    it('should validate image buffer', async () => {
      const service = new AIService();
      const result = await service.analyzeImage(Buffer.from(''));

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('analyzeSentiment', () => {
    it('should analyze positive sentiment', async () => {
      const service = new AIService();
      const result = await service.analyzeSentiment('This product is amazing and excellent!');

      expect(result.success).toBe(true);
      expect(result.sentiment).toBe('positive');
      expect(result.scores).toBeDefined();
    });

    it('should analyze negative sentiment', async () => {
      const service = new AIService();
      const result = await service.analyzeSentiment('This product is terrible and awful!');

      expect(result.success).toBe(true);
      expect(result.sentiment).toBe('negative');
    });

    it('should validate text length', async () => {
      const service = new AIService();
      const result = await service.analyzeSentiment('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Text');
    });
  });

  describe('translateText', () => {
    it('should translate text', async () => {
      const service = new AIService();
      const result = await service.translateText('Hello world', 'es');

      expect(result.success).toBe(true);
      expect(result.translatedText).toBeDefined();
      expect(result.targetLanguage).toBe('es');
    });

    it('should validate language code', async () => {
      const service = new AIService();
      const result = await service.translateText('Hello', 'invalid-lang');

      expect(result.success).toBe(false);
      expect(result.error).toContain('language');
    });
  });

  describe('extractKeyPhrases', () => {
    it('should extract key phrases', async () => {
      const service = new AIService();
      const result = await service.extractKeyPhrases(
        'This amazing product features excellent quality and outstanding performance'
      );

      expect(result.phrases).toBeDefined();
      expect(Array.isArray(result.phrases)).toBe(true);
    });
  });

  describe('synthesizeSpeech', () => {
    it('should synthesize speech', async () => {
      const service = new AIService();
      const result = await service.synthesizeSpeech('Hello world');

      expect(result.success).toBe(true);
      expect(result.contentType).toBeDefined();
    });

    it('should validate text length', async () => {
      const service = new AIService();
      const result = await service.synthesizeSpeech('');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Text');
    });
  });

  describe('extractText', () => {
    it('should extract text from document', async () => {
      const service = new AIService();
      const mockDocument = Buffer.from('fake document data');
      const result = await service.extractText(mockDocument);

      expect(result.success).toBe(true);
      expect(result.text).toBeDefined();
    });
  });

  describe('getProviderName', () => {
    it('should return provider name', () => {
      const service = new AIService();
      const providerName = service.getProviderName();

      expect(providerName).toBe('LocalAIProvider');
    });
  });
});
