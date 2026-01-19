/**
 * AWS Comprehend Service
 * 
 * Provides natural language processing capabilities:
 * - Sentiment analysis for reviews
 * - Key phrase extraction
 * - Language detection
 * - Entity recognition
 */

import {
  ComprehendClient,
  DetectSentimentCommand,
  DetectKeyPhrasesCommand,
  DetectDominantLanguageCommand,
  DetectEntitiesCommand,
  BatchDetectSentimentCommand,
  LanguageCode,
} from '@aws-sdk/client-comprehend';

// Configuration
const AWS_REGION = process.env.AWS_COMPREHEND_REGION || process.env.AWS_REGION || 'us-east-1';

// Lazy-initialized client
let comprehendClient: ComprehendClient | null = null;

function getComprehendClient(): ComprehendClient {
  if (!comprehendClient) {
    comprehendClient = new ComprehendClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }
  return comprehendClient;
}

export type SentimentType = 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'MIXED';

export interface SentimentResult {
  sentiment: SentimentType;
  scores: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
  };
}

export interface KeyPhraseResult {
  phrases: Array<{
    text: string;
    score: number;
  }>;
}

export interface EntityResult {
  entities: Array<{
    text: string;
    type: string;
    score: number;
  }>;
}

/**
 * Analyze sentiment of a review or text
 */
export async function analyzeSentiment(
  text: string,
  languageCode: LanguageCode = 'en'
): Promise<SentimentResult> {
  const client = getComprehendClient();

  try {
    const response = await client.send(new DetectSentimentCommand({
      Text: text,
      LanguageCode: languageCode,
    }));

    return {
      sentiment: (response.Sentiment as SentimentType) || 'NEUTRAL',
      scores: {
        positive: response.SentimentScore?.Positive || 0,
        negative: response.SentimentScore?.Negative || 0,
        neutral: response.SentimentScore?.Neutral || 0,
        mixed: response.SentimentScore?.Mixed || 0,
      },
    };
  } catch (error) {
    console.error('[Comprehend] Sentiment analysis failed:', error);
    return {
      sentiment: 'NEUTRAL',
      scores: { positive: 0, negative: 0, neutral: 1, mixed: 0 },
    };
  }
}

/**
 * Batch analyze sentiment for multiple reviews
 */
export async function batchAnalyzeSentiment(
  texts: string[],
  languageCode: LanguageCode = 'en'
): Promise<SentimentResult[]> {
  const client = getComprehendClient();

  // Comprehend batch limit is 25 documents
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += 25) {
    batches.push(texts.slice(i, i + 25));
  }

  const results: SentimentResult[] = [];

  for (const batch of batches) {
    try {
      const response = await client.send(new BatchDetectSentimentCommand({
        TextList: batch,
        LanguageCode: languageCode,
      }));

      for (const result of response.ResultList || []) {
        results.push({
          sentiment: (result.Sentiment as SentimentType) || 'NEUTRAL',
          scores: {
            positive: result.SentimentScore?.Positive || 0,
            negative: result.SentimentScore?.Negative || 0,
            neutral: result.SentimentScore?.Neutral || 0,
            mixed: result.SentimentScore?.Mixed || 0,
          },
        });
      }
    } catch (error) {
      console.error('[Comprehend] Batch sentiment analysis failed:', error);
      // Fill with neutral for failed batch
      batch.forEach(() => {
        results.push({
          sentiment: 'NEUTRAL',
          scores: { positive: 0, negative: 0, neutral: 1, mixed: 0 },
        });
      });
    }
  }

  return results;
}

/**
 * Extract key phrases from text
 */
export async function extractKeyPhrases(
  text: string,
  languageCode: LanguageCode = 'en'
): Promise<KeyPhraseResult> {
  const client = getComprehendClient();

  try {
    const response = await client.send(new DetectKeyPhrasesCommand({
      Text: text,
      LanguageCode: languageCode,
    }));

    const phrases = (response.KeyPhrases || [])
      .map(phrase => ({
        text: phrase.Text || '',
        score: phrase.Score || 0,
      }))
      .filter(p => p.text && p.score > 0.5)
      .sort((a, b) => b.score - a.score);

    return { phrases };
  } catch (error) {
    console.error('[Comprehend] Key phrase extraction failed:', error);
    return { phrases: [] };
  }
}

/**
 * Detect the dominant language of text
 */
export async function detectLanguage(text: string): Promise<LanguageCode> {
  const client = getComprehendClient();

  try {
    const response = await client.send(new DetectDominantLanguageCommand({
      Text: text,
    }));

    const topLanguage = response.Languages?.[0];
    return (topLanguage?.LanguageCode as LanguageCode) || 'en';
  } catch (error) {
    console.error('[Comprehend] Language detection failed:', error);
    return 'en';
  }
}

/**
 * Extract named entities from text
 */
export async function extractEntities(
  text: string,
  languageCode: LanguageCode = 'en'
): Promise<EntityResult> {
  const client = getComprehendClient();

  try {
    const response = await client.send(new DetectEntitiesCommand({
      Text: text,
      LanguageCode: languageCode,
    }));

    const entities = (response.Entities || [])
      .map(entity => ({
        text: entity.Text || '',
        type: entity.Type || 'OTHER',
        score: entity.Score || 0,
      }))
      .filter(e => e.text && e.score > 0.5);

    return { entities };
  } catch (error) {
    console.error('[Comprehend] Entity extraction failed:', error);
    return { entities: [] };
  }
}

/**
 * Analyze a customer review comprehensively
 */
export async function analyzeReview(reviewText: string): Promise<{
  sentiment: SentimentResult;
  keyPhrases: KeyPhraseResult;
  entities: EntityResult;
  language: string;
  isSpam: boolean;
  qualityScore: number;
}> {
  // Detect language first
  const language = await detectLanguage(reviewText);

  // Run analyses in parallel
  const [sentiment, keyPhrases, entities] = await Promise.all([
    analyzeSentiment(reviewText, language),
    extractKeyPhrases(reviewText, language),
    extractEntities(reviewText, language),
  ]);

  // Simple spam detection heuristics
  const isSpam = detectSpam(reviewText, keyPhrases.phrases);

  // Calculate quality score (0-100)
  const qualityScore = calculateReviewQuality(reviewText, keyPhrases.phrases, sentiment);

  return {
    sentiment,
    keyPhrases,
    entities,
    language,
    isSpam,
    qualityScore,
  };
}

/**
 * Simple spam detection based on patterns
 */
function detectSpam(text: string, _phrases: Array<{ text: string; score: number }>): boolean {
  const lowerText = text.toLowerCase();

  // Check for common spam patterns
  const spamPatterns = [
    /click here/i,
    /buy now/i,
    /limited time/i,
    /act now/i,
    /\$\d+/,
    /http[s]?:\/\//,
    /www\./,
  ];

  const hasSpamPattern = spamPatterns.some(pattern => pattern.test(lowerText));

  // Check for excessive repetition
  const words = lowerText.split(/\s+/);
  const uniqueWords = new Set(words);
  const repetitionRatio = uniqueWords.size / words.length;
  const hasExcessiveRepetition = repetitionRatio < 0.3 && words.length > 10;

  // Check for very short reviews with no substance
  const isTooShort = words.length < 3;

  return hasSpamPattern || hasExcessiveRepetition || isTooShort;
}

/**
 * Calculate review quality score
 */
function calculateReviewQuality(
  text: string,
  phrases: Array<{ text: string; score: number }>,
  sentiment: SentimentResult
): number {
  let score = 50; // Base score

  // Length bonus (up to +20)
  const wordCount = text.split(/\s+/).length;
  if (wordCount >= 20) score += 10;
  if (wordCount >= 50) score += 10;

  // Key phrases bonus (up to +15)
  score += Math.min(phrases.length * 3, 15);

  // Strong sentiment bonus (+10)
  const maxSentimentScore = Math.max(
    sentiment.scores.positive,
    sentiment.scores.negative
  );
  if (maxSentimentScore > 0.8) score += 10;

  // Mixed sentiment penalty (-10)
  if (sentiment.sentiment === 'MIXED') score -= 10;

  // Punctuation and formatting bonus (+5)
  if (/[.!?]/.test(text)) score += 5;

  return Math.max(0, Math.min(100, score));
}
