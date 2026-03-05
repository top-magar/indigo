# Puck-like AI Features for Visual Editor V2

## Overview

This document describes the Puck-like AI features implemented in the Visual Editor V2, enabling intelligent, component-aware page generation with real-time data integration.

## Key Features

### 1. Component Registry (`component-registry.ts`)

A comprehensive registry of available components with AI-friendly metadata:

```typescript
import { 
  COMPONENT_REGISTRY,
  findMatchingComponents,
  getComponentPromptContext 
} from '@/features/visual-editor-v2/ai';

// Find components matching user intent
const matches = findMatchingComponents('hero section with products');

// Get AI prompt context with all available components
const context = getComponentPromptContext();
```

**Component Entry Structure:**
- `id` - Unique identifier
- `name` - Display name
- `category` - Component category (hero, products, navigation, etc.)
- `description` - What the component does
- `aiHints` - AI generation hints (use cases, trigger phrases, semantic tags)
- `structure` - Element structure (root type, required/optional children)
- `props` - Configurable properties
- `variants` - Available variants
- `defaultStyles` - Geist/OKLCH default styles

**Available Components:**
- Hero (centered, minimal, bold, split)
- Product Grid (compact, featured, minimal)
- Product Card (standard, hover-reveal, badge)
- Header Navigation (standard, centered, minimal)
- Features Grid (cards, icons-only, list)
- Testimonials Carousel (single, grid, minimal)
- CTA Banner (full-width, contained, split)
- Footer (standard, minimal, centered)
- Text Block (standard, centered, narrow)
- Image Gallery (grid, masonry, carousel)

### 2. AI Tools System (`tools/`)

Tools that allow AI to query real data during page generation:

```typescript
import { 
  createToolExecutor,
  getToolPromptContext 
} from '@/features/visual-editor-v2/ai';

// Create executor with tenant context
const executor = createToolExecutor({ tenantId: 'tenant-123' });

// Execute a tool
const result = await executor.execute({
  toolName: 'get_products',
  parameters: { limit: 8, status: 'active' }
});
```

**Available Tools:**

| Tool | Description |
|------|-------------|
| `get_products` | Fetch products with filters |
| `get_categories` | Fetch product categories |
| `get_product` | Get single product by ID/slug |
| `get_product_stats` | Get product statistics |
| `search_products` | Search products |
| `get_store_settings` | Get store name, logo, settings |
| `get_navigation` | Get navigation structure |
| `get_social_links` | Get social media links |
| `get_trust_badges` | Get trust badges and guarantees |
| `get_testimonials` | Get customer testimonials |
| `get_promotions` | Get active promotions |

### 3. Component Mapper (`component-mapper.ts`)

Maps AI-generated elements to registered components:

```typescript
import { createComponentMapper } from '@/features/visual-editor-v2/ai';

const mapper = createComponentMapper();
const result = mapper.mapElements(generatedElements);

// Result includes:
// - mappedElements: Elements with component defaults applied
// - componentUsage: Which components were matched
// - warnings: Any mapping issues
```

**Features:**
- Semantic analysis of element names and content
- Confidence scoring for component matches
- Automatic style application from component defaults
- Contextual suggestions based on page type

### 4. Enhanced Prompts (`agents/prompts.ts`)

Component-aware prompts that include:
- Available component registry
- Tool descriptions and usage
- Geist/OKLCH design system guidelines
- Structured output requirements

## Architecture

```
src/features/visual-editor-v2/ai/
├── index.ts                    # Main exports
├── component-registry.ts       # Component definitions
├── component-mapper.ts         # Element-to-component mapping
├── page-generator.server.ts    # Server-side generation
├── agents/
│   ├── orchestrator.ts         # Multi-agent orchestration
│   ├── prompts.ts              # AI prompts
│   ├── types.ts                # Type definitions
│   └── schemas.ts              # Zod schemas
└── tools/
    ├── index.ts                # Tool exports
    ├── types.ts                # Tool types
    ├── product-tools.ts        # Product data tools
    ├── store-tools.ts          # Store data tools
    └── tool-executor.ts        # Tool execution
```

## Usage Example

```typescript
import { 
  AgentOrchestrator,
  createToolExecutor 
} from '@/features/visual-editor-v2/ai';

// Create orchestrator with progress callback
const orchestrator = new AgentOrchestrator((progress) => {
  console.log(`${progress.stage}: ${progress.message}`);
});

// Set tenant context for tools
orchestrator.setTenantContext('tenant-123');

// Generate a full site
const result = await orchestrator.generateFullSite({
  businessName: 'My Store',
  industry: 'Fashion',
  description: 'Premium clothing and accessories',
  hasProducts: true,
  productCategories: ['Clothing', 'Accessories'],
  tone: 'luxury',
});

if (result.success) {
  console.log('Generated pages:', result.pages?.length);
  console.log('Design tokens:', result.designTokens);
}
```

## Comparison with Puck AI

| Feature | Puck AI | Indigo Visual Editor V2 |
|---------|---------|------------------------|
| Component Registry | ✅ Cloud-based | ✅ Local registry |
| Tools Integration | ✅ API-based | ✅ Direct DB access |
| Fine-Tuning | ✅ Per-component | ✅ Via aiHints |
| Component Mapping | ✅ Automatic | ✅ Confidence-based |
| Multi-Agent | ❌ Single agent | ✅ 5 specialized agents |
| Design System | ❌ Generic | ✅ Geist/OKLCH |
| Self-Hosted | ❌ Cloud only | ✅ AWS Bedrock |

## Design System Integration

All generated components follow the Vercel/Geist design system:

- **Colors**: OKLCH color space with CSS variables (`var(--ds-gray-900)`)
- **Spacing**: 4px base scale
- **Typography**: Inter font family
- **Border Radius**: sm=4px, md=6px, lg=8px, xl=12px
- **Shadows**: Minimal, layered approach

## Future Enhancements

1. **Component Fine-Tuning UI** - Visual interface for adjusting AI hints
2. **Custom Tool Registration** - Allow users to add custom tools
3. **Component Versioning** - Track component changes over time
4. **A/B Testing Integration** - Generate variants for testing
5. **Analytics Feedback Loop** - Learn from user interactions
