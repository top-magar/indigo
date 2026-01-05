---
inclusion: fileMatch
fileMatchPattern: "**/editor/**/*.{ts,tsx},**/storefront/**/*.{ts,tsx},**/blocks/**/*.{ts,tsx}"
---

# Store Editor Development Guide

This steering document provides guidelines for developing the visual store editor, including current features, planned enhancements, and architectural decisions.

## Current Architecture

### Core Components
- **Editor Store**: `src/lib/editor/store.ts` - Zustand store with immer for state management
- **Block Types**: `src/types/blocks.ts` - 19 block types (atomic + container)
- **Field System**: `src/lib/editor/fields/` - Auto-field system with 15+ field types
- **Visual Editor**: `src/app/(editor)/storefront/visual-editor.tsx` - Main editor component

### Existing Features
- Drag-and-drop block reordering
- Multi-variant blocks (5 variants per block type)
- Responsive viewport switching (mobile/tablet/desktop)
- Autosave with debounce (3s) and retry logic
- Undo/redo history (50 actions)
- Inline text editing
- Keyboard shortcuts (⌘Z, ⌘S, ⌘C, ⌘V, ⌘D, etc.)
- Draft/publish workflow
- Block locking and grouping
- Smart guides for alignment
- Focus mode for isolated editing

## Planned Enhancements

### 1. Global Styles System (Priority: High)
**Status**: Implemented

Centralized design token management for brand consistency.

**Implementation**:
- Types: `src/lib/editor/global-styles/types.ts`
- Store: `src/lib/editor/global-styles/store.ts` (Zustand)
- Presets: `src/lib/editor/global-styles/presets.ts` (5 themes: minimal, bold, elegant, playful, corporate)
- CSS Generator: `src/lib/editor/global-styles/css-generator.ts`
- UI Panel: `src/app/(editor)/storefront/components/global-styles-panel.tsx`

**Features**:
- Typography configuration (fonts, scale, line-height, weights)
- Color palette management (primary, secondary, accent, etc.)
- Spacing scale configuration
- Border radius presets
- Shadow presets
- Theme presets with one-click application

### 2. Animation System (Priority: High)
**Status**: Implemented

Block-level animation configuration for entrance, scroll, and hover effects.

**Implementation**:
- Types: `src/lib/editor/animations/types.ts`
- Motion Wrapper: `src/lib/editor/animations/motion-wrapper.tsx` (Framer Motion)
- Scroll Hook: `src/lib/editor/animations/use-scroll-animation.ts`
- UI Picker: `src/app/(editor)/storefront/components/animation-picker.tsx`

**Features**:
- Entrance animations (fade, slide, zoom, flip, bounce, rotate)
- Scroll animations (parallax, fade-on-scroll, scale-on-scroll)
- Hover animations (lift, glow, scale, tilt, shake, pulse)
- Animation presets for quick selection
- Reduced motion support for accessibility
- Integrated into Settings Panel Advanced section

### 3. SEO & Meta Management (Priority: High)
**Status**: Implemented

Per-page SEO configuration with schema markup generation.

**Implementation**:
- Types: `src/lib/editor/seo/types.ts`
- Schema Generators: `src/lib/editor/seo/schema-generators.ts`
- UI Panel: `src/app/(editor)/storefront/components/seo-panel.tsx`

**Features**:
- Basic SEO (title, description, keywords)
- Open Graph meta tags
- Twitter card configuration
- Social preview card
- Canonical URL
- noIndex/noFollow options
- Character count validation

### 4. AI Content Assistant (Priority: Medium)
**Status**: Disabled - Planned for Future

AI-powered content generation for headlines, descriptions, and suggestions.

```typescript
// Planned structure: src/lib/editor/ai/types.ts
interface AIAssistantConfig {
  enabled: boolean; // Currently false - feature flag
  provider: 'openai' | 'anthropic' | 'disabled';
  features: {
    generateHeadline: boolean;
    generateDescription: boolean;
    suggestLayout: boolean;
    improveContent: boolean;
    translateContent: boolean;
  };
}

// Feature flag check
const AI_FEATURES_ENABLED = false; // Set to true when ready to enable

interface AIGenerateRequest {
  type: 'headline' | 'description' | 'cta' | 'product-description';
  context: {
    blockType: BlockType;
    existingContent?: string;
    tone?: 'professional' | 'casual' | 'playful' | 'urgent';
    maxLength?: number;
  };
}
```

**Implementation Notes**:
- Feature is disabled by default via `AI_FEATURES_ENABLED` flag
- When enabled, add AI button to text fields in settings panel
- Use streaming for real-time generation feedback
- Store API keys in environment variables
- Implement rate limiting per tenant
- Add usage tracking for billing

### 5. Template Library (Priority: Medium)
**Status**: Planned

Save and reuse custom block configurations.

```typescript
// Planned structure: src/lib/editor/templates/types.ts
interface BlockTemplate {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  blockType: BlockType;
  variant: string;
  settings: Record<string, unknown>;
  createdAt: Date;
  isGlobal: boolean; // Available across all stores
  tenantId?: string; // If tenant-specific
}
```

### 6. Advanced Layout Features (Priority: Low)
**Status**: Planned

CSS Grid support and advanced positioning.

- CSS Grid layout option for sections
- Absolute positioning mode
- Z-index control
- Custom breakpoints
- Container queries support

### 7. Collaboration Features (Priority: Low)
**Status**: Planned

Real-time collaboration and version history.

- Real-time cursors (like Figma)
- Block-level comments
- Version history browser
- Change comparison view
- Restore previous versions

## Development Guidelines

### Adding New Block Types

1. Define type in `src/types/blocks.ts`
2. Add to `BlockType` union
3. Create variants type
4. Add settings interface
5. Register in `src/components/store/blocks/registry.ts`
6. Add field schema in `src/lib/editor/fields/block-fields.ts`
7. Add icon in `src/lib/editor/block-constants.ts`
8. Create block component in `src/components/store/blocks/`

### Adding New Field Types

1. Define type in `src/lib/editor/fields/types.ts`
2. Create field component in `src/lib/editor/fields/components/`
3. Register in `AutoField` component
4. Add to editable fields if supports inline editing

### State Management Rules

- Use `produce` from immer for all state mutations
- Always push to history for undoable actions
- Use selectors for derived state
- Batch related updates to prevent re-renders

### Performance Considerations

- Virtual scrolling for 50+ blocks
- Debounce field updates (300ms)
- Lazy load block components
- Use `React.memo` for block renderers
- Avoid inline object/function props

## File Structure

```
src/lib/editor/
├── store.ts              # Zustand store
├── types.ts              # Core types
├── autosave.ts           # Autosave service
├── block-constants.ts    # Block icons/colors
├── guides.ts             # Smart guides
├── presets.ts            # Block presets
├── fields/               # Field system
│   ├── types.ts
│   ├── block-fields.ts
│   ├── editable-fields.ts
│   └── components/
├── hooks/                # Editor hooks
│   ├── use-autosave.ts
│   ├── use-block-clipboard.ts
│   └── use-editor-preview.ts
├── global-styles/        # Global styles system
│   ├── index.ts
│   ├── types.ts
│   ├── store.ts
│   ├── presets.ts
│   └── css-generator.ts
├── animations/           # Animation system
│   ├── index.ts
│   ├── types.ts
│   ├── motion-wrapper.tsx
│   └── use-scroll-animation.ts
├── seo/                  # SEO management
│   ├── index.ts
│   ├── types.ts
│   └── schema-generators.ts
├── ai/                   # AI assistant - DISABLED
│   └── types.ts
└── templates/            # Template library
    ├── types.ts
    └── template-service.ts

src/app/(editor)/storefront/components/
├── visual-editor.tsx     # Main editor
├── settings-panel.tsx    # Block settings (with animation picker)
├── layers-panel.tsx      # Block layers
├── editor-header.tsx     # Header toolbar (with Global Styles & SEO buttons)
├── global-styles-panel.tsx  # Global styles UI
├── seo-panel.tsx         # SEO settings UI
├── animation-picker.tsx  # Animation configuration UI
└── ...
```

## Testing Requirements

- Property-based tests for drag-drop ordering
- Unit tests for store actions
- Integration tests for autosave
- Visual regression tests for blocks
- E2E tests for publish workflow
