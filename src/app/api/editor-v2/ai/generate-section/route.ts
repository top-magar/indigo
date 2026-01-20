/**
 * AI Section Generation API
 *
 * Generates individual sections from natural language prompts
 * using AWS Bedrock (Claude).
 */

import { NextRequest, NextResponse } from 'next/server';
import { aiPageGeneratorServer } from '@/features/visual-editor-v2/ai/page-generator.server';
import { DEFAULT_DESIGN_TOKENS } from '@/features/visual-editor-v2/tokens/default-tokens';
import type { AISectionGenerationRequest } from '@/features/visual-editor-v2/ai/page-generator';

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

    const {
      prompt,
      sectionType,
      storeContext,
      designTokens,
      availableComponents = [],
      existingPage,
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
    const generationRequest: AISectionGenerationRequest = {
      prompt,
      sectionType,
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
      existingPage,
      tenantId,
    };

    // Generate the section
    const result = await aiPageGeneratorServer.generateSection(generationRequest);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      elements: result.elements,
      rootElementId: result.rootElementId,
      message: result.message,
    });
  } catch (error) {
    console.error('AI section generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate section',
      },
      { status: 500 }
    );
  }
}
