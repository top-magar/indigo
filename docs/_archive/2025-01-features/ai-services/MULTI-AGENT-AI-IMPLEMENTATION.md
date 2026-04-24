# Multi-Agent AI Architecture for Visual Editor V2

## Overview

The Visual Editor V2 now includes a sophisticated multi-agent AI system for generating complete e-commerce websites. This architecture uses specialized AI agents that work together to create comprehensive, well-designed pages.

## Architecture

### Agent Roles

1. **Planner Agent** - Creates site blueprints with page hierarchy, sections, and content requirements
2. **Designer Agent** - Generates design tokens (colors, typography, spacing, shadows)
3. **Layouter Agent** - Builds page layouts with proper element structure
4. **Copywriter Agent** - Writes marketing copy, headlines, and CTAs
5. **Merchandiser Agent** - Structures e-commerce elements (categories, trust badges, checkout flow)

### Orchestration Flow

```
User Input → Planner → (Designer + Merchandiser in parallel) → Layouter → Copywriter → Complete Site
```

## Files Created/Modified

### New Files

- `src/features/visual-editor-v2/ai/agents/types.ts` - Type definitions for agents
- `src/features/visual-editor-v2/ai/agents/schemas.ts` - Zod validation schemas
- `src/features/visual-editor-v2/ai/agents/prompts.ts` - System prompts for each agent
- `src/features/visual-editor-v2/ai/agents/orchestrator.ts` - Main orchestration logic
- `src/features/visual-editor-v2/ai/agents/index.ts` - Barrel exports
- `src/features/visual-editor-v2/components/SiteGenerationWizard.tsx` - Onboarding wizard UI
- `src/features/visual-editor-v2/components/index.ts` - Component exports
- `src/app/api/editor-v2/ai/generate-site/route.ts` - Full site generation API

### Modified Files

- `src/app/api/editor-v2/ai/generate-page/route.ts` - Added multi-agent mode support
- `src/features/visual-editor-v2/panels/AIChatPanel.tsx` - Added wizard integration

## API Endpoints

### POST /api/editor-v2/ai/generate-site

Generates a complete e-commerce site using multi-agent orchestration.

**Request Body:**
```typescript
{
  businessName: string;
  industry: string;
  description: string;
  targetAudience?: string;
  goals?: string[];
  requiredPages?: string[];
  hasProducts?: boolean;
  productCategories?: string[];
  checkoutType?: 'single-page' | 'multi-step' | 'drawer';
  tone?: 'professional' | 'casual' | 'luxury' | 'playful' | 'friendly';
  tenantId?: string;
}
```

**Response:**
```typescript
{
  success: boolean;
  blueprint?: SiteBlueprint;
  designTokens?: DesignTokens;
  pages?: Page[];
  commerceStructure?: CommerceStructure;
  warnings?: string[];
  message?: string;
}
```

### POST /api/editor-v2/ai/generate-page

Enhanced to support both single-agent (fast) and multi-agent (comprehensive) modes.

**New Parameter:**
- `useMultiAgent?: boolean` - When true, uses multi-agent orchestration

## Usage

### From the UI

1. Open the AI Chat Panel in the Visual Editor V2
2. Click "Generate Full Site" quick action
3. Complete the 4-step wizard:
   - Business Basics (name, industry, description)
   - Audience & Tone (target audience, goals, brand tone)
   - Products & Pages (product categories, pages to generate)
   - Review & Generate
4. The AI generates all pages and loads the home page in the editor

### Programmatically

```typescript
import { AgentOrchestrator } from '@/features/visual-editor-v2/ai/agents';

const orchestrator = new AgentOrchestrator((progress) => {
  console.log(`${progress.stage}: ${progress.progress}% - ${progress.message}`);
});

const result = await orchestrator.generateFullSite({
  businessName: 'My Store',
  industry: 'fashion',
  description: 'Premium fashion for modern professionals',
  targetAudience: 'Young professionals aged 25-40',
  goals: ['Increase online sales', 'Build brand awareness'],
  hasProducts: true,
  productCategories: ['Shirts', 'Pants', 'Accessories'],
  tone: 'professional',
});

if (result.success) {
  console.log(`Generated ${result.pages?.length} pages`);
}
```

## Rate Limiting

- **Single page generation:** 5 requests per minute
- **Full site generation:** 3 requests per hour

## Design Tokens

The Designer Agent generates comprehensive design tokens:

```typescript
interface DesignTokens {
  colors: {
    primary: ColorScale;    // 50-900 scale
    secondary: ColorScale;
    accent: ColorScale;
    semantic: { success, warning, error, info };
    neutral: { background, surface, border, text, textMuted };
  };
  typography: {
    fontFamily: { heading, body, mono };
    scale: { xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl };
    lineHeight: { tight, normal, relaxed };
    fontWeight: { normal, medium, semibold, bold };
  };
  spacing: { base, scale };
  borderRadius: { none, sm, md, lg, xl, full };
  shadows: { sm, md, lg, xl };
}
```

## Error Handling

The orchestrator includes:
- Input validation with Zod schemas
- Graceful fallbacks for failed agents
- Progress tracking with detailed messages
- Warning collection for partial failures

## Future Enhancements

1. **Streaming Progress** - Use SSE for real-time progress updates
2. **Page Persistence** - Save all generated pages to database
3. **Template Library** - Pre-built templates for common industries
4. **A/B Variants** - Generate multiple design variants
5. **Image Generation** - Integrate with image generation APIs
6. **SEO Optimization** - Enhanced SEO metadata generation
