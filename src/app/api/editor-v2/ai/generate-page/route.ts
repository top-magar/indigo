/**
 * AI Page Generation API
 * 
 * Generates complete e-commerce pages from natural language prompts
 * using AWS Bedrock (Claude).
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiPageGenerator } from '@/features/visual-editor-v2/ai/page-generator';
import { DEFAULT_DESIGN_TOKENS } from '@/features/visual-editor-v2/tokens/default-tokens';
import type { AIPageGenerationRequest } from '@/features/visual-editor-v2/ai/page-generator';
import type { PageType } from '@/features/visual-editor-v2/types/page';

// Rate limiting (simple in-memory, use Redis in production)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_PER_MINUTE = 5; // Lower limit for expensive AI operations

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
    
    const {
      prompt,
      pageType,
      storeContext,
      designTokens,
      availableComponents = [],
      productData,
      tenantId = 'default',
    } = body;

    // Validate required fields
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!storeContext || !storeContext.name) {
      return NextResponse.json(
        { success: false, error: 'Store context with name is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    if (!checkRateLimit(tenantId)) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    // Build the request
    const generationRequest: AIPageGenerationRequest = {
      prompt,
      pageType: pageType as PageType,
      storeContext: {
        name: storeContext.name,
        industry: storeContext.industry || 'retail',
        brandColors: storeContext.brandColors || ['#000000', '#ffffff'],
        targetAudience: storeContext.targetAudience || 'general consumers',
        tone: storeContext.tone || 'professional',
        description: storeContext.description,
      },
      designTokens: designTokens || DEFAULT_DESIGN_TOKENS,
      availableComponents,
      productData,
      tenantId,
    };

    // Generate the page
    const result = await aiPageGenerator.generatePage(generationRequest);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      page: result.page,
      message: result.message,
      suggestions: result.suggestions,
    });
  } catch (error) {
    console.error('AI page generation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to generate page' 
      },
      { status: 500 }
    );
  }
}
