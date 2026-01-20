/**
 * AWS Polly Service
 * 
 * Provides text-to-speech capabilities for accessibility:
 * - Product description audio
 * - Accessibility features for visually impaired users
 * - Multi-language voice synthesis
 */

import {
  PollyClient,
  SynthesizeSpeechCommand,
  DescribeVoicesCommand,
  Engine,
  OutputFormat,
  VoiceId,
  LanguageCode,
} from '@aws-sdk/client-polly';

// Re-export VoiceId type for use in other modules
// Note: LanguageCode is not re-exported to avoid conflict with translate module
export type { VoiceId };

const AWS_REGION = process.env.AWS_POLLY_REGION || process.env.AWS_REGION || 'us-east-1';

let pollyClient: PollyClient | null = null;

function getPollyClient(): PollyClient {
  if (!pollyClient) {
    pollyClient = new PollyClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }
  return pollyClient;
}

export interface SpeechResult {
  success: boolean;
  audioStream?: Uint8Array;
  contentType?: string;
  error?: string;
}

export interface VoiceInfo {
  id: string;
  name: string;
  languageCode: string;
  languageName: string;
  gender: string;
}

/**
 * Voice presets for different languages
 */
export const VOICE_PRESETS: Record<string, VoiceId> = {
  'en-US': 'Joanna',
  'en-GB': 'Amy',
  'es-ES': 'Lucia',
  'es-US': 'Lupe',
  'fr-FR': 'Lea',
  'de-DE': 'Vicki',
  'it-IT': 'Bianca',
  'pt-BR': 'Camila',
  'ja-JP': 'Mizuki',
  'ko-KR': 'Seoyeon',
  'zh-CN': 'Zhiyu',
};

/**
 * Synthesize speech from text
 */
export async function synthesizeSpeech(
  text: string,
  options?: {
    voiceId?: VoiceId;
    languageCode?: LanguageCode;
    engine?: 'standard' | 'neural';
    outputFormat?: 'mp3' | 'ogg_vorbis' | 'pcm';
  }
): Promise<SpeechResult> {
  if (!process.env.AWS_POLLY_ENABLED) {
    return { success: false, error: 'AWS Polly is not enabled' };
  }

  const client = getPollyClient();
  const {
    voiceId = 'Joanna',
    languageCode,
    engine = 'neural',
    outputFormat = 'mp3',
  } = options || {};

  try {
    const response = await client.send(new SynthesizeSpeechCommand({
      Text: text,
      VoiceId: voiceId,
      Engine: engine as Engine,
      OutputFormat: outputFormat as OutputFormat,
      LanguageCode: languageCode,
    }));

    if (!response.AudioStream) {
      return { success: false, error: 'No audio stream returned' };
    }

    // Convert stream to Uint8Array
    const audioStream = await streamToUint8Array(response.AudioStream);

    return {
      success: true,
      audioStream,
      contentType: response.ContentType,
    };
  } catch (error) {
    console.error('[AWS Polly] Speech synthesis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Speech synthesis failed',
    };
  }
}

/**
 * Generate audio for a product description
 */
export async function generateProductAudio(
  productName: string,
  description: string,
  languageCode: LanguageCode = 'en-US'
): Promise<SpeechResult> {
  const voiceId = VOICE_PRESETS[languageCode] || 'Joanna';
  
  // Create a natural-sounding product description
  const text = `${productName}. ${description}`;
  
  return synthesizeSpeech(text, {
    voiceId,
    languageCode,
    engine: 'neural',
    outputFormat: 'mp3',
  });
}

/**
 * Get available voices for a language
 */
export async function getAvailableVoices(languageCode?: LanguageCode): Promise<VoiceInfo[]> {
  if (!process.env.AWS_POLLY_ENABLED) {
    return [];
  }

  const client = getPollyClient();

  try {
    const response = await client.send(new DescribeVoicesCommand({
      LanguageCode: languageCode,
    }));

    return (response.Voices || []).map(voice => ({
      id: voice.Id || '',
      name: voice.Name || '',
      languageCode: voice.LanguageCode || '',
      languageName: voice.LanguageName || '',
      gender: voice.Gender || '',
    }));
  } catch (error) {
    console.error('[AWS Polly] Failed to get voices:', error);
    return [];
  }
}

/**
 * Generate SSML for better pronunciation
 */
export function generateSSML(
  text: string,
  options?: {
    rate?: 'x-slow' | 'slow' | 'medium' | 'fast' | 'x-fast';
    pitch?: 'x-low' | 'low' | 'medium' | 'high' | 'x-high';
    emphasis?: 'strong' | 'moderate' | 'reduced';
  }
): string {
  const { rate = 'medium', pitch = 'medium' } = options || {};
  
  return `<speak>
    <prosody rate="${rate}" pitch="${pitch}">
      ${text}
    </prosody>
  </speak>`;
}

/**
 * Check if AWS Polly is available
 */
export async function isPollyAvailable(): Promise<boolean> {
  if (!process.env.AWS_POLLY_ENABLED) {
    return false;
  }

  try {
    const client = getPollyClient();
    await client.send(new DescribeVoicesCommand({ LanguageCode: 'en-US' }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Helper to convert stream to Uint8Array
 */
async function streamToUint8Array(stream: unknown): Promise<Uint8Array> {
  // Handle different stream types
  if (stream instanceof Uint8Array) {
    return stream;
  }
  
  if (stream instanceof Blob) {
    const buffer = await stream.arrayBuffer();
    return new Uint8Array(buffer);
  }
  
  // For Node.js streams
  if (typeof (stream as { transformToByteArray?: () => Promise<Uint8Array> }).transformToByteArray === 'function') {
    return (stream as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray();
  }
  
  throw new Error('Unsupported stream type');
}
