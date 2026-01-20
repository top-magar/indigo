/**
 * AI Image Analysis API
 * 
 * Analyzes images using AWS Rekognition for:
 * - Label detection (what's in the image)
 * - Text extraction (OCR)
 * - Content moderation (safety check)
 * - Alt text generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/infrastructure/services';

export async function POST(request: NextRequest) {
  // Instantiate inside handler to ensure providers are registered
  const ai = new AIService();
  
  try {
    const body = await request.json();
    const { 
      imageUrl,
      options = {},
    } = body as {
      imageUrl: string;
      options?: {
        detectLabels?: boolean;
        detectText?: boolean;
        moderateContent?: boolean;
        maxLabels?: number;
        minConfidence?: number;
      };
    };

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Analyze the image
    const analysis = await ai.analyzeImage(imageUrl, {
      detectLabels: options.detectLabels ?? true,
      detectText: options.detectText ?? true,
      moderateContent: options.moderateContent ?? true,
      maxLabels: options.maxLabels ?? 10,
      minConfidence: options.minConfidence ?? 70,
    });

    if (!analysis.success) {
      return NextResponse.json(
        { success: false, error: analysis.error },
        { status: 500 }
      );
    }

    // Generate alt text from labels
    const labels = analysis.labels || [];
    const suggestedAltText = generateAltTextFromLabels(labels);

    return NextResponse.json({
      success: true,
      labels: labels.map(l => l.name),
      labelDetails: labels,
      suggestedAltText,
      containsText: (analysis.text?.length || 0) > 0,
      extractedText: analysis.text?.join(' '),
      isSafe: analysis.moderation?.isSafe ?? true,
      moderationLabels: analysis.moderation?.violations?.map(v => v.name),
      moderationDetails: analysis.moderation?.violations,
    });
  } catch (error) {
    console.error('[AI Analyze Image] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}

function generateAltTextFromLabels(
  labels: Array<{ name: string; confidence: number }>
): string {
  if (labels.length === 0) return 'Image';
  
  // Take top 3 most confident labels
  const topLabels = labels
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)
    .map(l => l.name.toLowerCase());

  if (topLabels.length === 1) {
    return `Image of ${topLabels[0]}`;
  }

  const last = topLabels.pop();
  return `Image of ${topLabels.join(', ')} and ${last}`;
}
