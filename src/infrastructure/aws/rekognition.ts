/**
 * AWS Rekognition Service
 * 
 * Provides image analysis capabilities:
 * - Content moderation (detect inappropriate images)
 * - Label detection (extract product attributes)
 * - Text detection (OCR for product labels)
 */

import {
  RekognitionClient,
  DetectModerationLabelsCommand,
  DetectLabelsCommand,
  DetectTextCommand,
} from '@aws-sdk/client-rekognition';

// Configuration
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'indigo-media-assets';

// Lazy-initialized client
let rekognitionClient: RekognitionClient | null = null;

function getRekognitionClient(): RekognitionClient {
  if (!rekognitionClient) {
    rekognitionClient = new RekognitionClient({
      region: AWS_REGION,
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });
  }
  return rekognitionClient;
}

export interface ModerationResult {
  isSafe: boolean;
  labels: Array<{
    name: string;
    confidence: number;
    parentName?: string;
  }>;
}

export interface LabelResult {
  labels: Array<{
    name: string;
    confidence: number;
    categories?: string[];
  }>;
}

export interface TextResult {
  textDetections: Array<{
    text: string;
    confidence: number;
    type: 'LINE' | 'WORD';
  }>;
}

/**
 * Moderate an image for inappropriate content
 * Returns true if the image is safe to display
 */
export async function moderateImage(
  imageSource: { s3Key: string } | { bytes: Uint8Array }
): Promise<ModerationResult> {
  const client = getRekognitionClient();

  const imageParam = 's3Key' in imageSource
    ? { S3Object: { Bucket: S3_BUCKET, Name: imageSource.s3Key } }
    : { Bytes: imageSource.bytes };

  try {
    const response = await client.send(new DetectModerationLabelsCommand({
      Image: imageParam,
      MinConfidence: 60, // Lower threshold to catch more potential issues
    }));

    const labels = (response.ModerationLabels || []).map(label => ({
      name: label.Name || 'Unknown',
      confidence: label.Confidence || 0,
      parentName: label.ParentName,
    }));

    // Image is safe if no moderation labels detected
    const isSafe = labels.length === 0;

    if (!isSafe) {
      console.log('[Rekognition] Moderation labels detected:', labels.map(l => l.name).join(', '));
    }

    return { isSafe, labels };
  } catch (error) {
    console.error('[Rekognition] Moderation failed:', error);
    // Default to safe on error to not block uploads, but log for review
    return { isSafe: true, labels: [] };
  }
}

/**
 * Detect labels/objects in an image
 * Useful for auto-categorizing products
 */
export async function detectLabels(
  imageSource: { s3Key: string } | { bytes: Uint8Array },
  maxLabels: number = 15
): Promise<LabelResult> {
  const client = getRekognitionClient();

  const imageParam = 's3Key' in imageSource
    ? { S3Object: { Bucket: S3_BUCKET, Name: imageSource.s3Key } }
    : { Bytes: imageSource.bytes };

  try {
    const response = await client.send(new DetectLabelsCommand({
      Image: imageParam,
      MaxLabels: maxLabels,
      MinConfidence: 70,
    }));

    const labels = (response.Labels || []).map(label => ({
      name: label.Name || 'Unknown',
      confidence: label.Confidence || 0,
      categories: label.Categories?.map(c => c.Name || '').filter(Boolean),
    }));

    return { labels };
  } catch (error) {
    console.error('[Rekognition] Label detection failed:', error);
    return { labels: [] };
  }
}

/**
 * Detect text in an image (OCR)
 * Useful for reading product labels, brand names, etc.
 */
export async function detectText(
  imageSource: { s3Key: string } | { bytes: Uint8Array }
): Promise<TextResult> {
  const client = getRekognitionClient();

  const imageParam = 's3Key' in imageSource
    ? { S3Object: { Bucket: S3_BUCKET, Name: imageSource.s3Key } }
    : { Bytes: imageSource.bytes };

  try {
    const response = await client.send(new DetectTextCommand({
      Image: imageParam,
    }));

    const textDetections = (response.TextDetections || [])
      .filter(detection => detection.Type === 'LINE' || detection.Type === 'WORD')
      .map(detection => ({
        text: detection.DetectedText || '',
        confidence: detection.Confidence || 0,
        type: detection.Type as 'LINE' | 'WORD',
      }));

    return { textDetections };
  } catch (error) {
    console.error('[Rekognition] Text detection failed:', error);
    return { textDetections: [] };
  }
}

/**
 * Analyze a product image comprehensively
 * Combines moderation, labels, and text detection
 */
export async function analyzeProductImage(s3Key: string): Promise<{
  moderation: ModerationResult;
  labels: LabelResult;
  text: TextResult;
  suggestedTags: string[];
}> {
  const imageSource = { s3Key };

  // Run all analyses in parallel
  const [moderation, labels, text] = await Promise.all([
    moderateImage(imageSource),
    detectLabels(imageSource),
    detectText(imageSource),
  ]);

  // Generate suggested tags from labels
  const suggestedTags = labels.labels
    .filter(l => l.confidence > 80)
    .map(l => l.name.toLowerCase())
    .slice(0, 10);

  return {
    moderation,
    labels,
    text,
    suggestedTags,
  };
}
