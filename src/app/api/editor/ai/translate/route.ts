/**
 * AI Translation API
 * 
 * Translates content using AWS Translate for multi-language support.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/infrastructure/services';

const ai = new AIService();

// Supported languages
const SUPPORTED_LANGUAGES = [
  'en', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ru',
  'ja', 'ko', 'zh', 'zh-TW', 'ar', 'hi', 'tr', 'vi', 'th', 'id', 'ms'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      content,
      targetLanguage,
      sourceLanguage,
    } = body as {
      content: string;
      targetLanguage: string;
      sourceLanguage?: string;
    };

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!targetLanguage) {
      return NextResponse.json(
        { success: false, error: 'Target language is required' },
        { status: 400 }
      );
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLanguage)) {
      return NextResponse.json(
        { success: false, error: `Unsupported target language: ${targetLanguage}` },
        { status: 400 }
      );
    }

    if (sourceLanguage && !SUPPORTED_LANGUAGES.includes(sourceLanguage)) {
      return NextResponse.json(
        { success: false, error: `Unsupported source language: ${sourceLanguage}` },
        { status: 400 }
      );
    }

    const result = await ai.translateText(content, targetLanguage, sourceLanguage);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      originalContent: content,
      translatedContent: result.translatedText,
      sourceLanguage: result.sourceLanguage || sourceLanguage || 'auto',
      targetLanguage,
    });
  } catch (error) {
    console.error('[AI Translate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to translate content' },
      { status: 500 }
    );
  }
}

// GET endpoint to list supported languages
export async function GET() {
  return NextResponse.json({
    success: true,
    languages: [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'nl', name: 'Dutch' },
      { code: 'pl', name: 'Polish' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese (Simplified)' },
      { code: 'zh-TW', name: 'Chinese (Traditional)' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'tr', name: 'Turkish' },
      { code: 'vi', name: 'Vietnamese' },
      { code: 'th', name: 'Thai' },
      { code: 'id', name: 'Indonesian' },
      { code: 'ms', name: 'Malay' },
    ],
  });
}
