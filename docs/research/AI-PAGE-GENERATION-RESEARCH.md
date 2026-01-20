# AI Page Generation Research

> Research on best practices for AI-powered visual page generation in editors like v0, Builder.io, Framer, and others.

---

## Executive Summary

The current implementation generates page structure (layers) but elements aren't rendering visibly on the canvas. This research identifies the root causes and industry best practices for reliable AI page generation.

---

## Current Issues Identified

### 1. **Invisible Elements**
- AI generates valid JSON structure but elements lack visible styling
- Frames without backgrounds appear invisible
- Text without explicit colors doesn't render visibly

### 2. **Style Mapping Gap**
- AI outputs styles in various formats (direct properties vs nested objects)
- Renderer expects specific structure (`styles.background.color` vs `styles.backgroundColor`)
- Numeric values need `px` suffix for CSS

### 3. **Type-Specific Defaults Missing**
- Buttons need default styling (background, padding, border-radius)
- Text needs default color
- Frames need minimum height or visible indicator

---

## Industry Best Practices

### 1. **v0.dev (Vercel) Approach**

v0 generates **actual React/Tailwind code**, not JSON:

```tsx
// v0 output - real code with visible styling
<div className="bg-gray-100 p-8">
  <h1 className="text-4xl font-bold text-gray-900">Welcome</h1>
  <button className="bg-black text-white px-6 py-3 rounded-lg">
    Shop Now
  </button>
</div>
```

**Key Insight**: v0 uses shadcn/ui components with built-in styling, ensuring everything is visible by default.

### 2. **Builder.io Approach**

Builder.io uses a **component catalog** with predefined styling:

```json
{
  "component": "Hero",
  "options": {
    "title": "Welcome",
    "backgroundColor": "#f5f5f5",
    "textColor": "#111111"
  }
}
```

**Key Insight**: Components have sensible defaults - you can't create an invisible hero.

### 3. **json-render.dev Approach**

Uses **Zod schemas** to constrain AI output:

```typescript
const catalog = createCatalog({
  components: {
    Card: {
      props: z.object({
        title: z.string(),
        backgroundColor: z.string().default('#ffffff'),
      }),
      hasChildren: true,
    },
  },
});
```

**Key Insight**: Schema validation ensures required styling properties are always present.

### 4. **Reka.js (Craft.js) Approach**

Uses an **AST-based state system** with a separate View tree:

```typescript
// State (what AI generates)
{
  type: 'TagTemplate',
  tag: 'div',
  props: { className: 'hero' },
  children: [...]
}

// View (what renderer uses) - computed from state
{
  type: 'TagView',
  tag: 'div',
  props: { className: 'hero' },
  children: [...]
}
```

**Key Insight**: Separation between data model and render model allows transformation/validation.

---

## Recommended Solutions

### Solution 1: **Component-Based Generation** (Recommended)

Instead of generating raw elements, generate from a predefined component library:

```typescript
// Define component templates with guaranteed visible styling
const COMPONENT_TEMPLATES = {
  hero: {
    type: 'frame',
    styles: {
      background: { type: 'solid', color: '#f5f5f5' },
      padding: [64, 24, 64, 24],
    },
    layout: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 },
    size: { width: 'fill', height: 400 },
  },
  button: {
    type: 'button',
    styles: {
      background: { type: 'solid', color: '#111111' },
      typography: { color: '#ffffff', fontSize: 16, fontWeight: 500 },
      padding: [12, 24, 12, 24],
      borderRadius: 6,
    },
    size: { width: 'auto', height: 'auto' },
  },
  // ... more components
};
```

**AI Prompt Change**:
```
Generate a page using these components: hero, button, text, productGrid, features.
Each component has predefined styling - just specify content and arrangement.
```

### Solution 2: **Style Normalization Layer**

Add a transformation step between AI output and renderer:

```typescript
function normalizeElement(element: AIElement): VisualElement {
  return {
    ...element,
    styles: {
      ...element.styles,
      // Ensure background is always visible for frames
      background: element.styles.background || 
        (element.type === 'frame' ? { type: 'solid', color: '#ffffff' } : undefined),
      // Ensure text has color
      typography: {
        ...element.styles.typography,
        color: element.styles.typography?.color || '#111111',
      },
    },
  };
}
```

### Solution 3: **Structured Output with JSON Schema**

Use Claude's structured output capability:

```typescript
const schema = {
  type: 'object',
  properties: {
    elements: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        required: ['id', 'type', 'styles'],
        properties: {
          styles: {
            type: 'object',
            required: ['background'], // Force background
            properties: {
              background: {
                type: 'object',
                required: ['type', 'color'],
              },
            },
          },
        },
      },
    },
  },
};
```

### Solution 4: **Two-Pass Generation**

1. **Pass 1**: Generate semantic structure (what sections, what content)
2. **Pass 2**: Apply styling from design system

```typescript
// Pass 1: Structure
const structure = await ai.generate(`
  Create page structure for: ${prompt}
  Return: { sections: [{ type: 'hero', content: {...} }] }
`);

// Pass 2: Apply design system
const page = applyDesignSystem(structure, designTokens);
```

---

## Immediate Fixes Applied

### 1. **Enhanced SimpleElementRenderer**
- Added `px` suffix for numeric width/height
- Added handling for direct `color`/`backgroundColor` properties
- Added default styles for button type
- Added default text color

### 2. **Updated AI Prompt**
- Added explicit instruction to use visible backgrounds
- Updated example JSON to include backgrounds
- Added button example with proper styling

---

## Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Page Generation                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Prompt     │───▶│  AI Model    │───▶│  Raw JSON    │  │
│  │   Builder    │    │  (Claude)    │    │  Response    │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                                       │           │
│         │                                       ▼           │
│         │                              ┌──────────────┐     │
│         │                              │   Parser &   │     │
│         │                              │  Validator   │     │
│         │                              └──────────────┘     │
│         │                                       │           │
│         ▼                                       ▼           │
│  ┌──────────────┐                      ┌──────────────┐     │
│  │  Component   │◀─────────────────────│  Normalizer  │     │
│  │  Templates   │                      │  (defaults)  │     │
│  └──────────────┘                      └──────────────┘     │
│                                                 │           │
│                                                 ▼           │
│                                        ┌──────────────┐     │
│                                        │    Page      │     │
│                                        │   Object     │     │
│                                        └──────────────┘     │
│                                                 │           │
└─────────────────────────────────────────────────┼───────────┘
                                                  │
                                                  ▼
┌─────────────────────────────────────────────────────────────┐
│                        Renderer                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │    Page      │───▶│   Element    │───▶│    DOM       │  │
│  │   Object     │    │   Renderer   │    │   Output     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Next Steps

### Short-term (Current Sprint)
1. ✅ Fix renderer to handle various style formats
2. ✅ Update AI prompt to include visible backgrounds
3. ⬜ Add style normalization layer
4. ⬜ Test with multiple prompts

### Medium-term
5. ⬜ Implement component templates
6. ⬜ Add JSON schema validation
7. ⬜ Create design token integration

### Long-term
8. ⬜ Two-pass generation (structure → styling)
9. ⬜ Component library with AI awareness
10. ⬜ Real-time preview during generation

---

## Key Takeaways

1. **v0's success** comes from generating actual code with Tailwind classes, not abstract JSON
2. **Builder.io's reliability** comes from component-based generation with defaults
3. **json-render's predictability** comes from schema-constrained output
4. **Our gap**: We generate raw JSON without guaranteed visible styling

The fix is either:
- **Option A**: Generate code (like v0) - major architecture change
- **Option B**: Use component templates with defaults - moderate change
- **Option C**: Add normalization layer - quick fix (implemented)

---

## Sources

- [Vercel v0 Blog - Maximizing Outputs](https://vercel.com/blog/maximizing-outputs-with-v0-from-ui-generation-to-code-creation)
- [Builder.io - How to Build Reliable AI Tools](https://www.builder.io/blog/build-ai-tools)
- [json-render.dev - AI-generated UI with guardrails](https://json-render.dev/)
- [Reka.js Documentation](https://reka.js.org/docs/introduction)
- [Craft.js Overview](https://craft.js.org/docs/overview)

*Content was rephrased for compliance with licensing restrictions*
