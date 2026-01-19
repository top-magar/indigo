'use server';

/**
 * AI-powered product actions using AWS Bedrock, Rekognition, and Comprehend
 */

import { AIService } from '@/infrastructure/services';

export interface AIProductSuggestions {
  description?: string;
  tags?: string[];
  categories?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface ImageAnalysisResult {
  isSafe: boolean;
  suggestedTags: string[];
  detectedText: string[];
  moderationWarnings: string[];
}

/**
 * Generate AI product description from name and attributes
 */
export async function generateAIDescription(
  productName: string,
  attributes: string[],
  tone: 'professional' | 'casual' | 'luxury' | 'playful' = 'professional'
): Promise<{ success: boolean; description?: string; error?: string }> {
  try {
    const aiService = new AIService();
    
    const prompt = `Generate a ${tone} product description for "${productName}" with these attributes: ${attributes.join(', ')}. 
    Make it engaging, informative, and suitable for an e-commerce product page. Length: 2-3 paragraphs.`;
    
    const result = await aiService.generateText(prompt, {
      maxTokens: 500,
      temperature: 0.7,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    return { success: true, description: result.text };
  } catch (error) {
    console.error('[AI] Description generation failed:', error);
    return { success: false, error: 'Failed to generate description' };
  }
}

/**
 * Generate AI-suggested tags from product description
 */
export async function generateAITags(
  productName: string,
  description: string,
  existingTags?: string[]
): Promise<{ success: boolean; tags?: string[]; error?: string }> {
  try {
    const aiService = new AIService();
    
    const prompt = `Generate 8-12 relevant product tags for "${productName}". 
    Description: ${description}
    ${existingTags ? `Existing tags: ${existingTags.join(', ')}` : ''}
    Return only comma-separated tags, lowercase, no explanations.`;
    
    const result = await aiService.generateText(prompt, {
      maxTokens: 200,
      temperature: 0.5,
    });

    if (!result.success || !result.text) {
      return { success: false, error: result.error };
    }

    // Parse comma-separated tags
    const tags = result.text
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length < 30);

    return { success: true, tags };
  } catch (error) {
    console.error('[AI] Tag generation failed:', error);
    return { success: false, error: 'Failed to generate tags' };
  }
}

/**
 * Analyze product image for moderation and auto-tagging
 */
export async function analyzeProductImageAction(
  imageUrl: string
): Promise<{ success: boolean; analysis?: ImageAnalysisResult; error?: string }> {
  try {
    const aiService = new AIService();
    const analysis = await aiService.analyzeImage(imageUrl, ['labels', 'moderation', 'text']);

    return {
      success: true,
      analysis: {
        isSafe: !analysis.moderation?.inappropriate,
        suggestedTags: analysis.labels?.map(l => l.name.toLowerCase()) || [],
        detectedText: analysis.text?.map(t => t.text) || [],
        moderationWarnings: analysis.moderation?.categories || [],
      },
    };
  } catch (error) {
    console.error('[AI] Image analysis failed:', error);
    return { success: false, error: 'Failed to analyze image' };
  }
}

/**
 * Generate complete AI suggestions for a product
 */
export async function generateAIProductSuggestions(
  productName: string,
  description?: string,
  imageUrl?: string
): Promise<{ success: boolean; suggestions?: AIProductSuggestions; error?: string }> {
  try {
    const aiService = new AIService();
    const suggestions: AIProductSuggestions = {};

    // Get image-based suggestions if image provided
    let imageLabels: string[] = [];
    if (imageUrl) {
      const imageAnalysis = await aiService.analyzeImage(imageUrl, ['labels']);
      imageLabels = imageAnalysis.labels?.map(l => l.name.toLowerCase()) || [];
    }

    // Generate description if not provided
    if (!description) {
      const prompt = `Generate a professional product description for "${productName}" ${imageLabels.length > 0 ? `with these features: ${imageLabels.join(', ')}` : ''}. 
      Make it engaging and informative. Length: 2-3 paragraphs.`;
      
      const descResult = await aiService.generateText(prompt, {
        maxTokens: 500,
        temperature: 0.7,
      });
      
      if (descResult.success) {
        suggestions.description = descResult.text;
        description = descResult.text;
      }
    }

    // Generate tags from description
    if (description) {
      const tagPrompt = `Generate 10 relevant product tags for "${productName}". Description: ${description}. Return only comma-separated tags, lowercase.`;
      const tagResult = await aiService.generateText(tagPrompt, {
        maxTokens: 200,
        temperature: 0.5,
      });
      
      if (tagResult.success && tagResult.text) {
        suggestions.tags = tagResult.text
          .split(',')
          .map(t => t.trim().toLowerCase())
          .filter(t => t.length > 0);
      }

      // Extract key phrases for SEO
      const sentimentResult = await aiService.analyzeSentiment(description);
      if (sentimentResult.success && sentimentResult.keyPhrases) {
        const topPhrases = sentimentResult.keyPhrases.slice(0, 3);
        suggestions.seoTitle = `${productName} - ${topPhrases.join(', ')}`;
        suggestions.seoDescription = description.slice(0, 160);
      }
    }

    // Merge image labels with generated tags
    if (imageLabels.length > 0) {
      suggestions.tags = [...new Set([...(suggestions.tags || []), ...imageLabels])].slice(0, 15);
    }

    return { success: true, suggestions };
  } catch (error) {
    console.error('[AI] Product suggestions failed:', error);
    return { success: false, error: 'Failed to generate suggestions' };
  }
}

/**
 * Translate product content to another language
 */
export async function translateProductContent(
  content: { name: string; description: string },
  targetLanguage: string
): Promise<{ success: boolean; translated?: { name: string; description: string }; error?: string }> {
  try {
    const aiService = new AIService();
    
    const [nameResult, descResult] = await Promise.all([
      aiService.translateText(content.name, 'auto', targetLanguage),
      aiService.translateText(content.description, 'auto', targetLanguage),
    ]);

    if (!nameResult.success || !descResult.success) {
      return { success: false, error: 'Translation failed' };
    }

    return {
      success: true,
      translated: {
        name: nameResult.translatedText || content.name,
        description: descResult.translatedText || content.description,
      },
    };
  } catch (error) {
    console.error('[AI] Translation failed:', error);
    return { success: false, error: 'Failed to translate content' };
  }
}
