/**
 * AI Content Analysis API
 * 
 * Analyzes content using AWS Comprehend for:
 * - Sentiment analysis
 * - Key phrase extraction
 * - Entity detection
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/infrastructure/services';

export async function POST(request: NextRequest) {
  // Instantiate inside handler to ensure providers are registered
  const ai = new AIService();
  
  try {
    const body = await request.json();
    const { 
      content,
      type,
      analyses,
    } = body as {
      content: string;
      type?: 'sentiment' | 'keywords';
      analyses?: Array<'sentiment' | 'keywords'>;
    };

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Support both 'type' (single analysis) and 'analyses' (multiple)
    const analysesToRun = type ? [type] : (analyses || ['sentiment', 'keywords']);

    const results: Record<string, unknown> = {
      success: true,
      content,
    };

    // Run requested analyses in parallel
    const promises: Promise<void>[] = [];

    if (analysesToRun.includes('sentiment')) {
      promises.push(
        ai.analyzeSentiment(content).then(result => {
          if (result.success) {
            // Get confidence from scores if available
            const confidence = result.scores 
              ? Math.max(result.scores.positive, result.scores.negative, result.scores.neutral, result.scores.mixed)
              : undefined;
            results.sentiment = result.sentiment;
            results.confidence = confidence;
          }
        })
      );
    }

    if (analysesToRun.includes('keywords')) {
      promises.push(
        ai.extractKeyPhrases(content).then(result => {
          results.keywords = result.phrases?.map(p => p.text) || [];
        })
      );
    }

    await Promise.all(promises);

    return NextResponse.json(results);
  } catch (error) {
    console.error('[AI Analyze Content] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze content' },
      { status: 500 }
    );
  }
}
