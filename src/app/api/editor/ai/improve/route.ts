/**
 * AI Content Improvement API
 * 
 * Improves existing content using AWS Bedrock for:
 * - Clarity improvements
 * - Engagement optimization
 * - SEO enhancement
 * - Brevity (making content more concise)
 * - Grammar fixes
 */

import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/infrastructure/services';

type ImprovementGoal = 'clarity' | 'engagement' | 'seo' | 'brevity' | 'grammar';

export async function POST(request: NextRequest) {
  // Instantiate inside handler to ensure providers are registered
  const ai = new AIService();
  
  try {
    const body = await request.json();
    const { 
      content,
      goal,
      context = {},
    } = body as {
      content: string;
      goal: ImprovementGoal;
      context?: {
        targetAudience?: string;
        keywords?: string[];
      };
    };

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    if (!goal) {
      return NextResponse.json(
        { success: false, error: 'Improvement goal is required' },
        { status: 400 }
      );
    }

    const prompt = buildImprovementPrompt(content, goal, context);

    const result = await ai.generateText(prompt, {
      maxTokens: Math.max(content.length * 2, 500),
      temperature: 0.5,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Clean up the response
    const improvedContent = cleanGeneratedText(result.content || '');

    return NextResponse.json({
      success: true,
      originalContent: content,
      improvedContent,
      goal,
      usage: result.usage,
    });
  } catch (error) {
    console.error('[AI Improve] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to improve content' },
      { status: 500 }
    );
  }
}

function buildImprovementPrompt(
  content: string, 
  goal: ImprovementGoal,
  context: { targetAudience?: string; keywords?: string[] }
): string {
  const goalDescriptions: Record<ImprovementGoal, string> = {
    clarity: 'Make the content clearer and easier to understand. Simplify complex sentences, remove jargon, and improve readability.',
    engagement: 'Make the content more engaging and compelling. Add emotional appeal, use active voice, and create a stronger connection with the reader.',
    seo: 'Optimize the content for search engines while keeping it natural. Include relevant keywords naturally, improve structure, and enhance readability.',
    brevity: 'Make the content more concise without losing meaning. Remove redundancy, tighten sentences, and eliminate filler words.',
    grammar: 'Fix any grammar, spelling, or punctuation errors. Improve sentence structure and ensure proper usage.',
  };

  let prompt = `${goalDescriptions[goal]}

Original content:
"${content}"

Requirements:
- Maintain the original meaning and intent
- Keep a similar length (unless brevity is the goal)
- Preserve any formatting or structure
- Make meaningful improvements, not just minor tweaks`;

  if (context.targetAudience) {
    prompt += `\n- Target audience: ${context.targetAudience}`;
  }

  if (context.keywords?.length) {
    prompt += `\n- Include these keywords naturally: ${context.keywords.join(', ')}`;
  }

  prompt += '\n\nReturn only the improved content, no explanations.';

  return prompt;
}

function cleanGeneratedText(text: string): string {
  return text
    .replace(/^["']|["']$/g, '')
    .trim();
}
