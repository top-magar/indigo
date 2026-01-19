/**
 * AI Content Generation API
 * 
 * Generates content for visual editor using AWS Bedrock.
 * Supports headlines, descriptions, CTAs, FAQs, and testimonials.
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/infrastructure/services';
import type { ContentTone, AIContentType } from '@/features/editor/ai/types';

const ai = new AIService();

// Map editor tones to provider tones
type ProviderTone = 'professional' | 'casual' | 'luxury' | 'playful';

function mapToneToProvider(tone: ContentTone): ProviderTone {
  const toneMap: Record<ContentTone, ProviderTone> = {
    professional: 'professional',
    casual: 'casual',
    playful: 'playful',
    urgent: 'professional',
    luxurious: 'luxury',
    friendly: 'casual',
    authoritative: 'professional',
    empathetic: 'casual',
  };
  return toneMap[tone] || 'professional';
}

// Rate limiting (simple in-memory, use Redis in production)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_PER_MINUTE = 10;

function checkRateLimit(tenantId: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(tenantId);
  
  if (!limit || now > limit.resetAt) {
    rateLimits.set(tenantId, { count: 1, resetAt: now + 60000 });
    return true;
  }
  
  if (limit.count >= RATE_LIMIT_PER_MINUTE) {
    return false;
  }
  
  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Support both flat structure (from api-client) and nested structure
    const type = body.type as AIContentType;
    const tone: ContentTone = body.tone || body.options?.tone || 'professional';
    const tenantId = body.tenantId || 'default';
    
    // Build context from flat body (api-client sends flat structure)
    const context: Record<string, unknown> = {
      storeName: body.storeName,
      industry: body.industry,
      productName: body.productName,
      existingHeadline: body.existingHeadline,
      headline: body.headline,
      features: body.features,
      category: body.category,
      targetAudience: body.targetAudience,
      maxLength: body.maxLength,
      action: body.action,
      urgency: body.urgency,
      customAction: body.customAction,
      question: body.question,
      existingFAQs: body.existingFAQs,
      count: body.count,
      ...body.context, // Also support nested context
    };

    // Rate limiting
    if (!checkRateLimit(tenantId)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Build prompt based on type
    let prompt: string;
    let maxTokens = body.maxLength || body.options?.maxLength || 200;

    switch (type) {
      case 'headline':
        prompt = buildHeadlinePrompt(context, tone);
        maxTokens = 100;
        break;
      case 'subheadline':
        prompt = buildSubheadlinePrompt(context, tone);
        maxTokens = 150;
        break;
      case 'description':
        prompt = buildDescriptionPrompt(context, tone);
        maxTokens = 300;
        break;
      case 'cta':
        prompt = buildCTAPrompt(context, tone);
        maxTokens = 100;
        break;
      case 'product-description':
        prompt = buildProductDescriptionPrompt(context, tone);
        maxTokens = 400;
        break;
      case 'testimonial':
        prompt = buildTestimonialPrompt(context, tone);
        maxTokens = 150;
        break;
      case 'faq-answer':
        prompt = buildFAQAnswerPrompt(context);
        maxTokens = 200;
        break;
      case 'faqs':
        // Handle FAQ generation
        return await handleFAQGeneration(context, tone);
      default:
        return NextResponse.json(
          { success: false, error: `Unknown content type: ${type}` },
          { status: 400 }
        );
    }

    const result = await ai.generateText(prompt, {
      tone: mapToneToProvider(tone),
      maxTokens,
      temperature: 0.7,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Clean up the response
    const content = cleanGeneratedText(result.content || '');

    // For CTA, parse multiple options
    if (type === 'cta') {
      const alternatives = content.split('\n').filter(Boolean).slice(1);
      return NextResponse.json({
        success: true,
        content: content.split('\n')[0] || content,
        alternatives,
        type,
        usage: result.usage,
      });
    }

    return NextResponse.json({
      success: true,
      content,
      type,
      usage: result.usage,
    });
  } catch (error) {
    console.error('[AI Generate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}

// Handle FAQ generation separately
async function handleFAQGeneration(
  context: Record<string, unknown>,
  tone: ContentTone
): Promise<NextResponse> {
  const count = Number(context.count) || 3;
  const existingFAQs = Array.isArray(context.existingFAQs) ? context.existingFAQs : [];
  
  const prompt = `Generate ${count} FAQ questions and answers for ${context.productName || 'this product/service'}.

${existingFAQs.length ? `Existing FAQs (don't repeat these):\n${existingFAQs.map(f => `Q: ${f.question}`).join('\n')}` : ''}

Requirements:
- Questions should be common customer concerns
- Answers should be helpful and concise (2-3 sentences)
- Match a ${tone} tone
- Cover different aspects (shipping, returns, usage, etc.)

Return in this exact format:
Q: [question]
A: [answer]

Q: [question]
A: [answer]`;

  const result = await ai.generateText(prompt, {
    tone: mapToneToProvider(tone),
    maxTokens: 600,
    temperature: 0.7,
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 500 }
    );
  }

  // Parse FAQs from response
  const faqs = parseFAQs(result.content || '');

  return NextResponse.json({
    success: true,
    faqs,
    usage: result.usage,
  });
}

function parseFAQs(text: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  const lines = text.split('\n').filter(Boolean);
  
  let currentQuestion = '';
  
  for (const line of lines) {
    if (line.startsWith('Q:')) {
      currentQuestion = line.replace(/^Q:\s*/, '').trim();
    } else if (line.startsWith('A:') && currentQuestion) {
      faqs.push({
        question: currentQuestion,
        answer: line.replace(/^A:\s*/, '').trim(),
      });
      currentQuestion = '';
    }
  }
  
  return faqs;
}

// ============================================================================
// PROMPT BUILDERS
// ============================================================================

function buildHeadlinePrompt(context: Record<string, unknown>, tone: ContentTone): string {
  const parts = [
    'Generate a compelling headline',
    context.storeName ? `for ${context.storeName}` : '',
    context.industry ? `in the ${context.industry} industry` : '',
    context.productName ? `featuring ${context.productName}` : '',
  ].filter(Boolean);

  return `${parts.join(' ')}.

Requirements:
- Be attention-grabbing and memorable
- Communicate value clearly
- Match the ${tone} tone
- Keep it under 10 words
- Don't use clichés or generic phrases
${context.existingHeadline ? `- Improve upon: "${context.existingHeadline}"` : ''}

Return only the headline text, no quotes or explanations.`;
}

function buildSubheadlinePrompt(context: Record<string, unknown>, tone: ContentTone): string {
  return `Generate a compelling subheadline to complement this headline:
"${context.headline}"

Requirements:
- Support and expand on the main headline
- Be concise (1-2 sentences max)
- Match the ${tone} tone
- Add value without repeating the headline
- Create curiosity or highlight a benefit

Return only the subheadline text, no quotes or explanations.`;
}

function buildDescriptionPrompt(context: Record<string, unknown>, tone: ContentTone): string {
  const features = Array.isArray(context.features) ? context.features : [];
  
  return `Write a compelling description for ${context.productName || 'this product/service'}${context.category ? ` in the ${context.category} category` : ''}.

${features.length ? `Key features to highlight:\n- ${features.join('\n- ')}` : ''}
${context.targetAudience ? `Target audience: ${context.targetAudience}` : ''}

Requirements:
- Be persuasive and benefit-focused
- Match the ${tone} tone
- Keep it under ${context.maxLength || 300} characters
- Include a subtle call to action
- Be SEO-friendly with natural keyword usage

Return only the description text, no quotes or explanations.`;
}

function buildCTAPrompt(context: Record<string, unknown>, tone: ContentTone): string {
  const actionDescriptions: Record<string, string> = {
    shop: 'purchasing products',
    learn: 'learning more about something',
    subscribe: 'subscribing to a newsletter or service',
    contact: 'getting in touch or reaching out',
    download: 'downloading a resource',
    custom: String(context.customAction || 'taking action'),
  };

  const action = String(context.action || 'shop');

  return `Generate 5 call-to-action button texts for ${actionDescriptions[action] || 'taking action'}.

Requirements:
- Be action-oriented and clear
- Keep each CTA to 2-5 words
- Match the ${tone} tone
${context.urgency ? '- Create a sense of urgency' : '- No urgency needed'}
- Make it clear what happens when clicked

Return only the 5 CTAs, one per line, no numbering or explanations.`;
}

function buildProductDescriptionPrompt(context: Record<string, unknown>, tone: ContentTone): string {
  const features = Array.isArray(context.features) ? context.features : [];
  
  return `Write a compelling product description for "${context.productName}".

Category: ${context.category || 'General'}
${features.length ? `Features:\n- ${features.join('\n- ')}` : ''}
${context.price ? `Price: ${context.price}` : ''}

Requirements:
- Start with a hook that captures attention
- Highlight key benefits (not just features)
- Use sensory language where appropriate
- Match the ${tone} tone
- Include a call to action
- Be SEO-friendly
- Keep it under 200 words

Return only the description, no quotes or explanations.`;
}

function buildTestimonialPrompt(context: Record<string, unknown>, tone: ContentTone): string {
  return `Generate a realistic customer testimonial for ${context.productName || 'this product'}.

Requirements:
- Sound authentic and personal
- Mention specific benefits or features
- Include emotional impact
- Be 2-3 sentences
- Match a ${tone} tone

Return only the testimonial text, no quotes or attribution.`;
}

function buildFAQAnswerPrompt(context: Record<string, unknown>): string {
  return `Write a helpful answer to this FAQ question:
"${context.question}"

${context.productName ? `Product: ${context.productName}` : ''}
${context.category ? `Category: ${context.category}` : ''}

Requirements:
- Be clear and informative
- Answer the question directly
- Keep it to 2-3 sentences
- Be helpful and friendly

Return only the answer, no quotes or explanations.`;
}

function cleanGeneratedText(text: string): string {
  return text
    .replace(/^["']|["']$/g, '') // Remove surrounding quotes
    .replace(/^\s*[-•]\s*/gm, '') // Remove bullet points
    .trim();
}
