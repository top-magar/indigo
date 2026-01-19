/**
 * AWS Translate Service
 * 
 * Provides multi-language translation for:
 * - Product descriptions
 * - Marketing content
 * - Customer communications
 */

import {
  TranslateClient,
  TranslateTextCommand,
  ListLanguagesCommand,
} from '@aws-sdk/client-translate';

const AWS_REGION = process.env.AWS_TRANSLATE_REGION || process.env.AWS_REGION || 'us-east-1';

let translateClient: TranslateClient | null = null;

function getTranslateClient(): TranslateClient {
  if (!translateClient) {
    translateClient = new TranslateClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }
  return translateClient;
}

export interface TranslationResult {
  success: boolean;
  translatedText?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  error?: string;
}

/**
 * Supported language codes
 */
export const SUPPORTED_LANGUAGES = {
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  ar: 'Arabic',
  hi: 'Hindi',
  nl: 'Dutch',
  pl: 'Polish',
  ru: 'Russian',
  tr: 'Turkish',
  vi: 'Vietnamese',
  th: 'Thai',
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;

/**
 * Translate text to a target language
 */
export async function translateText(
  text: string,
  targetLanguage: LanguageCode,
  sourceLanguage: LanguageCode = 'en'
): Promise<TranslationResult> {
  if (!process.env.AWS_TRANSLATE_ENABLED) {
    return { success: false, error: 'AWS Translate is not enabled' };
  }

  const client = getTranslateClient();

  try {
    const response = await client.send(new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: sourceLanguage,
      TargetLanguageCode: targetLanguage,
    }));

    return {
      success: true,
      translatedText: response.TranslatedText,
      sourceLanguage: response.SourceLanguageCode,
      targetLanguage: response.TargetLanguageCode,
    };
  } catch (error) {
    console.error('[AWS Translate] Translation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
    };
  }
}

/**
 * Translate product content to multiple languages
 */
export async function translateProductContent(
  content: {
    name: string;
    description: string;
    metaTitle?: string;
    metaDescription?: string;
  },
  targetLanguages: LanguageCode[],
  sourceLanguage: LanguageCode = 'en'
): Promise<Record<LanguageCode, typeof content>> {
  const results: Record<string, typeof content> = {};

  for (const lang of targetLanguages) {
    if (lang === sourceLanguage) {
      results[lang] = content;
      continue;
    }

    const [nameResult, descResult, metaTitleResult, metaDescResult] = await Promise.all([
      translateText(content.name, lang, sourceLanguage),
      translateText(content.description, lang, sourceLanguage),
      content.metaTitle ? translateText(content.metaTitle, lang, sourceLanguage) : null,
      content.metaDescription ? translateText(content.metaDescription, lang, sourceLanguage) : null,
    ]);

    results[lang] = {
      name: nameResult.translatedText || content.name,
      description: descResult.translatedText || content.description,
      metaTitle: metaTitleResult?.translatedText || content.metaTitle,
      metaDescription: metaDescResult?.translatedText || content.metaDescription,
    };
  }

  return results as Record<LanguageCode, typeof content>;
}

/**
 * Auto-detect language and translate
 */
export async function autoTranslate(
  text: string,
  targetLanguage: LanguageCode
): Promise<TranslationResult> {
  if (!process.env.AWS_TRANSLATE_ENABLED) {
    return { success: false, error: 'AWS Translate is not enabled' };
  }

  const client = getTranslateClient();

  try {
    const response = await client.send(new TranslateTextCommand({
      Text: text,
      SourceLanguageCode: 'auto',
      TargetLanguageCode: targetLanguage,
    }));

    return {
      success: true,
      translatedText: response.TranslatedText,
      sourceLanguage: response.SourceLanguageCode,
      targetLanguage: response.TargetLanguageCode,
    };
  } catch (error) {
    console.error('[AWS Translate] Auto-translation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Translation failed',
    };
  }
}

/**
 * Check if AWS Translate is available
 */
export async function isTranslateAvailable(): Promise<boolean> {
  if (!process.env.AWS_TRANSLATE_ENABLED) {
    return false;
  }

  try {
    const client = getTranslateClient();
    await client.send(new ListLanguagesCommand({}));
    return true;
  } catch {
    return false;
  }
}
