import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/infrastructure/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, targetLanguages, sourceLanguage = 'auto' } = body;

    if (!content || !targetLanguages || targetLanguages.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: content and targetLanguages' },
        { status: 400 }
      );
    }

    const aiService = new AIService();
    const translations: Record<string, any> = {};

    // Translate to each target language
    for (const targetLang of targetLanguages) {
      const translatedContent: any = {};

      // Translate each field
      for (const [key, value] of Object.entries(content)) {
        if (typeof value === 'string' && value.trim()) {
          const result = await aiService.translateText(value, sourceLanguage, targetLang);
          translatedContent[key] = result.success ? result.translatedText : value;
        }
      }

      translations[targetLang] = translatedContent;
    }

    return NextResponse.json({ success: true, translations });
  } catch (error) {
    console.error('[API] Product translation failed:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
