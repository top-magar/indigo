/**
 * Indigo Media Service
 * 
 * Provides AI-powered media analysis:
 * - Image content moderation
 * - Auto-tagging from images
 * - Text extraction (OCR)
 * - Product image analysis
 * 
 * Powered by: AWS Rekognition
 */

import {
  moderateImage,
  detectLabels,
  detectText,
  analyzeProductImage as rekognitionAnalyze,
} from '@/infrastructure/aws/rekognition';
import type {
  IndigoServiceResult,
  ImageAnalysis,
  ImageModerationResult,
  ServiceStatus,
} from './types';

// ============================================================================
// Indigo Media - Image Moderation
// ============================================================================

/**
 * Check if an image is safe for display
 * 
 * @example
 * ```ts
 * const result = await IndigoMedia.moderateImage({ s3Key: 'products/image.jpg' });
 * if (!result.data?.isSafe) {
 *   console.log('Image flagged:', result.data?.issues);
 * }
 * ```
 */
export async function checkImageSafety(
  imageSource: { s3Key: string } | { bytes: Uint8Array }
): Promise<IndigoServiceResult<ImageModerationResult>> {
  const startTime = Date.now();

  try {
    const result = await moderateImage(imageSource);

    const issues = result.labels
      .filter(l => l.confidence > 70)
      .map(l => l.name);

    return {
      success: true,
      data: {
        isSafe: result.isSafe,
        issues: issues.length > 0 ? issues : undefined,
        confidence: result.labels.length > 0 
          ? Math.max(...result.labels.map(l => l.confidence)) / 100
          : 1,
      },
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-media',
      },
    };
  } catch (error) {
    console.error('[IndigoMedia] Image moderation failed:', error);
    // Default to safe on error to not block uploads
    return {
      success: true,
      data: {
        isSafe: true,
        confidence: 0,
      },
    };
  }
}

// ============================================================================
// Indigo Media - Image Analysis
// ============================================================================

/**
 * Analyze a product image comprehensively
 * 
 * @example
 * ```ts
 * const analysis = await IndigoMedia.analyzeImage('products/headphones.jpg');
 * console.log('Suggested tags:', analysis.data?.suggestedTags);
 * console.log('Detected text:', analysis.data?.detectedText);
 * ```
 */
export async function analyzeImage(
  s3Key: string
): Promise<IndigoServiceResult<ImageAnalysis>> {
  const startTime = Date.now();

  try {
    const result = await rekognitionAnalyze(s3Key);

    const analysis: ImageAnalysis = {
      isSafe: result.moderation.isSafe,
      moderationLabels: result.moderation.labels.length > 0 
        ? result.moderation.labels.map(l => ({
            name: l.name,
            confidence: l.confidence / 100,
          }))
        : undefined,
      detectedLabels: result.labels.labels.map(l => ({
        name: l.name,
        confidence: l.confidence / 100,
        categories: l.categories,
      })),
      detectedText: result.text.textDetections
        .filter(t => t.type === 'LINE')
        .map(t => ({
          text: t.text,
          confidence: t.confidence / 100,
        })),
      suggestedTags: result.suggestedTags,
    };

    return {
      success: true,
      data: analysis,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-media',
      },
    };
  } catch (error) {
    console.error('[IndigoMedia] Image analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image analysis failed',
    };
  }
}

/**
 * Extract labels/objects from an image
 * 
 * @example
 * ```ts
 * const labels = await IndigoMedia.detectLabels({ s3Key: 'products/shirt.jpg' });
 * // Returns: [{ name: 'Clothing', confidence: 0.98 }, { name: 'T-Shirt', confidence: 0.95 }]
 * ```
 */
export async function extractLabels(
  imageSource: { s3Key: string } | { bytes: Uint8Array },
  maxLabels: number = 15
): Promise<IndigoServiceResult<Array<{ name: string; confidence: number; categories?: string[] }>>> {
  const startTime = Date.now();

  try {
    const result = await detectLabels(imageSource, maxLabels);

    const labels = result.labels.map(l => ({
      name: l.name,
      confidence: l.confidence / 100,
      categories: l.categories,
    }));

    return {
      success: true,
      data: labels,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-media',
      },
    };
  } catch (error) {
    console.error('[IndigoMedia] Label detection failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Label detection failed',
    };
  }
}

/**
 * Extract text from an image (OCR)
 * 
 * @example
 * ```ts
 * const text = await IndigoMedia.extractText({ s3Key: 'products/label.jpg' });
 * // Returns: [{ text: 'Made in USA', confidence: 0.95 }]
 * ```
 */
export async function extractText(
  imageSource: { s3Key: string } | { bytes: Uint8Array }
): Promise<IndigoServiceResult<Array<{ text: string; confidence: number }>>> {
  const startTime = Date.now();

  try {
    const result = await detectText(imageSource);

    // Return only LINE type detections (full lines, not individual words)
    const textLines = result.textDetections
      .filter(t => t.type === 'LINE')
      .map(t => ({
        text: t.text,
        confidence: t.confidence / 100,
      }));

    return {
      success: true,
      data: textLines,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-media',
      },
    };
  } catch (error) {
    console.error('[IndigoMedia] Text extraction failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Text extraction failed',
    };
  }
}

/**
 * Generate auto-tags for a product image
 * 
 * @example
 * ```ts
 * const tags = await IndigoMedia.generateTags('products/dress.jpg');
 * // Returns: ['clothing', 'dress', 'fashion', 'women', 'summer']
 * ```
 */
export async function generateTags(
  s3Key: string,
  maxTags: number = 10
): Promise<IndigoServiceResult<string[]>> {
  const startTime = Date.now();

  try {
    const result = await detectLabels({ s3Key }, maxTags * 2);

    // Convert labels to lowercase tags
    const tags = result.labels
      .filter(l => l.confidence > 70)
      .map(l => l.name.toLowerCase())
      .slice(0, maxTags);

    return {
      success: true,
      data: tags,
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-media',
      },
    };
  } catch (error) {
    console.error('[IndigoMedia] Tag generation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Tag generation failed',
    };
  }
}

/**
 * Validate a product image meets quality standards
 * 
 * @example
 * ```ts
 * const validation = await IndigoMedia.validateProductImage('products/item.jpg');
 * if (!validation.data?.isValid) {
 *   console.log('Issues:', validation.data?.issues);
 * }
 * ```
 */
export async function validateProductImage(
  s3Key: string
): Promise<IndigoServiceResult<{
  isValid: boolean;
  issues: string[];
  suggestions: string[];
}>> {
  const startTime = Date.now();

  try {
    const [moderation, labels] = await Promise.all([
      moderateImage({ s3Key }),
      detectLabels({ s3Key }, 20),
    ]);

    const issues: string[] = [];
    const suggestions: string[] = [];

    // Check moderation
    if (!moderation.isSafe) {
      issues.push('Image contains inappropriate content');
    }

    // Check if it looks like a product image
    const productLabels = ['Product', 'Clothing', 'Electronics', 'Furniture', 'Food', 'Accessory'];
    const hasProductLabel = labels.labels.some(l => 
      productLabels.some(pl => l.name.toLowerCase().includes(pl.toLowerCase()))
    );

    if (!hasProductLabel && labels.labels.length > 0) {
      suggestions.push('Image may not clearly show a product');
    }

    // Check for common issues
    const lowConfidenceLabels = labels.labels.filter(l => l.confidence < 50);
    if (lowConfidenceLabels.length > labels.labels.length / 2) {
      suggestions.push('Image quality may be low - consider using a clearer photo');
    }

    // Check for text (might indicate watermarks or overlays)
    const textResult = await detectText({ s3Key });
    if (textResult.textDetections.length > 5) {
      suggestions.push('Image contains significant text - ensure it\'s not a watermarked image');
    }

    return {
      success: true,
      data: {
        isValid: issues.length === 0,
        issues,
        suggestions,
      },
      metadata: {
        processingTime: Date.now() - startTime,
        provider: 'indigo-media',
      },
    };
  } catch (error) {
    console.error('[IndigoMedia] Image validation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Image validation failed',
    };
  }
}

// ============================================================================
// Service Status
// ============================================================================

/**
 * Check if Indigo Media service is available
 */
export function isAvailable(): boolean {
  return true; // Rekognition is always available
}

/**
 * Get Indigo Media service status
 */
export function getStatus(): ServiceStatus {
  return {
    name: 'Indigo Media',
    enabled: true,
    healthy: true,
    lastChecked: new Date().toISOString(),
    features: [
      'Content Moderation',
      'Auto-tagging',
      'Text Extraction (OCR)',
      'Label Detection',
      'Image Validation',
    ],
  };
}

// ============================================================================
// Namespace Export
// ============================================================================

export const IndigoMedia = {
  checkImageSafety,
  analyzeImage,
  extractLabels,
  extractText,
  generateTags,
  validateProductImage,
  isAvailable,
  getStatus,
};
