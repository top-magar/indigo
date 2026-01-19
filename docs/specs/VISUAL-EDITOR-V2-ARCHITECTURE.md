# Visual Editor V2 - Framer/Webflow/Figma-Level Architecture

## Executive Summary

This document outlines the architecture for a professional-grade visual editor that rivals Framer, Webflow, and Figma. Unlike the current block-based editor, this new system provides:

- **Infinite Canvas** with pan/zoom (like Figma/Miro)
- **Pixel-Perfect Positioning** with absolute, flex, and grid layouts
- **AI-Powered Page Generation** using AWS Bedrock to generate entire e-commerce pages
- **Component System** with variants, props, and responsive breakpoints
- **Design Tokens** for consistent styling across the platform
- **Real-time Collaboration** (future phase)

## Research Summary

### Industry Analysis

| Platform | Strengths | Architecture |
|----------|-----------|--------------|
| **Framer** | Motion animations, code components, responsive | Canvas + React components |
| **Webflow** | CSS visual control, CMS, interactions | DOM-based with visual CSS |
| **Figma** | Infinite canvas, constraints, auto-layout | WebGL/WASM canvas |
| **v0.dev** | AI generation, shadcn/ui, iterative refinement | Prompt → React code |
| **Puck** | React components, drag-drop, extensible | Block-based, customizable |
| **GrapesJS** | Absolute mode, plugins, React renderer | DOM-based builder |

### Key Insights from Research

1. **v0.dev Architecture**: Uses composite AI model with "AutoFix" pass for self-healing code generation
2. **Figma MCP**: Provides structured design context (tokens, components, variables) to AI
3. **GrapesJS Absolute Mode**: Enables free-form positioning without CSS hacks
4. **Puck**: Modular, embeddable, works with existing React components
5. **Canvas Implementation**: DndKit + D3-zoom for Figma-like pan/zoom (~250 lines)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         VISUAL EDITOR V2                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Canvas    │  │   Layers    │  │  Properties │  │  AI Panel   │    │
│  │  (Infinite) │  │   Panel     │  │    Panel    │  │             │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                         CORE ENGINE                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Layout    │  │  Component  │  │   Design    │  │  Responsive │    │
│  │   Engine    │  │   System    │  │   Tokens    │  │   System    │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                         AI LAYER                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │    Page     │  │  Component  │  │   Content   │  │   Layout    │    │
│  │  Generator  │  │  Generator  │  │  Generator  │  │  Suggester  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
├─────────────────────────────────────────────────────────────────────────┤
│                      AWS SERVICES                                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Bedrock   │  │ Rekognition │  │  Translate  │  │    Polly    │    │
│  │  (Claude)   │  │  (Images)   │  │   (i18n)    │  │   (Audio)   │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```


## Core Data Model

### Element Tree (Not Blocks)

```typescript
// Core element type - NOT a block, but a flexible element
interface VisualElement {
  id: string;
  type: ElementType;
  name: string;
  
  // Layout & Positioning
  layout: LayoutConfig;
  position: PositionConfig;
  size: SizeConfig;
  
  // Styling
  styles: StyleConfig;
  
  // Content
  content?: ContentConfig;
  
  // Component props (if component type)
  componentId?: string;
  props?: Record<string, unknown>;
  
  // Hierarchy
  parentId: string | null;
  children: string[]; // Element IDs
  
  // Responsive
  breakpointOverrides: Record<Breakpoint, Partial<VisualElement>>;
  
  // Interactions
  interactions: Interaction[];
  
  // Metadata
  locked: boolean;
  hidden: boolean;
  collapsed: boolean;
}

type ElementType = 
  | 'frame'        // Container (like Figma frame)
  | 'text'         // Text element
  | 'image'        // Image element
  | 'video'        // Video element
  | 'component'    // Reusable component instance
  | 'slot'         // Dynamic content slot
  | 'form'         // Form container
  | 'input'        // Form input
  | 'button'       // Button element
  | 'link'         // Link element
  | 'icon'         // Icon element
  | 'divider'      // Divider/separator
  | 'embed'        // External embed
  | 'code'         // Code block
  | 'html';        // Raw HTML

interface LayoutConfig {
  display: 'block' | 'flex' | 'grid' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  gap?: number;
  wrap?: boolean;
  
  // Grid specific
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense';
}

interface PositionConfig {
  type: 'relative' | 'absolute' | 'fixed' | 'sticky';
  top?: number | 'auto';
  right?: number | 'auto';
  bottom?: number | 'auto';
  left?: number | 'auto';
  zIndex?: number;
  
  // Constraints (like Figma)
  constraints: {
    horizontal: 'left' | 'right' | 'center' | 'scale' | 'left-right';
    vertical: 'top' | 'bottom' | 'center' | 'scale' | 'top-bottom';
  };
}

interface SizeConfig {
  width: number | 'auto' | 'fill' | 'hug';
  height: number | 'auto' | 'fill' | 'hug';
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

interface StyleConfig {
  // Background
  background?: BackgroundStyle;
  
  // Border
  border?: BorderStyle;
  borderRadius?: number | [number, number, number, number];
  
  // Shadow
  boxShadow?: ShadowStyle[];
  
  // Typography (for text elements)
  typography?: TypographyStyle;
  
  // Effects
  opacity?: number;
  blur?: number;
  
  // Spacing
  padding?: number | [number, number, number, number];
  margin?: number | [number, number, number, number];
  
  // Overflow
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Cursor
  cursor?: string;
  
  // Transitions
  transition?: TransitionConfig;
}
```


### Page Structure

```typescript
interface Page {
  id: string;
  name: string;
  slug: string;
  
  // Root element (the page frame)
  rootElementId: string;
  
  // All elements in the page (flat map for O(1) lookup)
  elements: Record<string, VisualElement>;
  
  // Page settings
  settings: PageSettings;
  
  // SEO
  seo: SEOConfig;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
  version: number;
}

interface PageSettings {
  width: number;           // Default: 1440
  backgroundColor: string;
  favicon?: string;
  customCode?: {
    head?: string;
    bodyStart?: string;
    bodyEnd?: string;
  };
}

// Breakpoints for responsive design
type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

const BREAKPOINTS: Record<Breakpoint, { min: number; max: number }> = {
  mobile: { min: 0, max: 767 },
  tablet: { min: 768, max: 1023 },
  desktop: { min: 1024, max: 1439 },
  wide: { min: 1440, max: Infinity },
};
```

## Component System

### Reusable Components

```typescript
interface ComponentDefinition {
  id: string;
  name: string;
  category: ComponentCategory;
  description: string;
  
  // The component's element tree
  rootElementId: string;
  elements: Record<string, VisualElement>;
  
  // Exposed props that can be customized
  props: ComponentProp[];
  
  // Variants (like Figma variants)
  variants: ComponentVariant[];
  
  // Default variant
  defaultVariantId: string;
  
  // Thumbnail for component picker
  thumbnail?: string;
  
  // Tags for search
  tags: string[];
}

type ComponentCategory = 
  | 'layout'      // Headers, footers, sections
  | 'navigation'  // Navbars, menus, breadcrumbs
  | 'hero'        // Hero sections
  | 'features'    // Feature grids, lists
  | 'products'    // Product cards, grids
  | 'testimonials'// Reviews, testimonials
  | 'pricing'     // Pricing tables
  | 'cta'         // Call-to-action sections
  | 'forms'       // Contact forms, newsletter
  | 'footer'      // Footer sections
  | 'ecommerce'   // Cart, checkout, product details
  | 'custom';     // User-created

interface ComponentProp {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'color' | 'image' | 'select' | 'rich-text';
  label: string;
  defaultValue: unknown;
  options?: { label: string; value: unknown }[]; // For select type
  
  // Which element property this maps to
  targetElementId: string;
  targetProperty: string; // e.g., 'content.text', 'styles.background.color'
}

interface ComponentVariant {
  id: string;
  name: string;
  propOverrides: Record<string, unknown>;
}
```

### E-commerce Specific Components

```typescript
// Pre-built e-commerce components
const ECOMMERCE_COMPONENTS: ComponentDefinition[] = [
  // Product Display
  'product-card',
  'product-grid',
  'product-carousel',
  'product-detail',
  'product-gallery',
  'product-reviews',
  
  // Cart & Checkout
  'cart-drawer',
  'cart-page',
  'checkout-form',
  'order-summary',
  
  // Navigation
  'store-header',
  'category-nav',
  'search-bar',
  'mega-menu',
  
  // Marketing
  'hero-banner',
  'promo-bar',
  'newsletter-signup',
  'trust-badges',
  
  // Content
  'collection-grid',
  'featured-products',
  'recently-viewed',
  'related-products',
];
```


## AI Page Generation System

### Overview

The AI system generates complete e-commerce pages from natural language prompts, similar to v0.dev but specialized for e-commerce.

### AI Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      AI PAGE GENERATION FLOW                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. USER PROMPT                                                          │
│     "Create a modern product page for a luxury watch brand               │
│      with hero image, features grid, and customer reviews"               │
│                                                                          │
│                              ▼                                           │
│                                                                          │
│  2. CONTEXT ENRICHMENT                                                   │
│     ┌─────────────────────────────────────────────────────────────┐     │
│     │ • Store info (name, industry, brand colors)                  │     │
│     │ • Design tokens (colors, typography, spacing)                │     │
│     │ • Available components (from component library)              │     │
│     │ • Product data (if available)                                │     │
│     │ • Existing pages (for style consistency)                     │     │
│     └─────────────────────────────────────────────────────────────┘     │
│                                                                          │
│                              ▼                                           │
│                                                                          │
│  3. AI GENERATION (AWS Bedrock - Claude)                                 │
│     ┌─────────────────────────────────────────────────────────────┐     │
│     │ Generate structured page JSON:                               │     │
│     │ • Element tree with layout                                   │     │
│     │ • Component instances with props                             │     │
│     │ • Responsive breakpoint overrides                            │     │
│     │ • Content (headlines, descriptions, CTAs)                    │     │
│     │ • Styling (colors, typography, spacing)                      │     │
│     └─────────────────────────────────────────────────────────────┘     │
│                                                                          │
│                              ▼                                           │
│                                                                          │
│  4. VALIDATION & AUTO-FIX                                                │
│     ┌─────────────────────────────────────────────────────────────┐     │
│     │ • Validate element tree structure                            │     │
│     │ • Check component prop types                                 │     │
│     │ • Verify design token usage                                  │     │
│     │ • Auto-fix common issues                                     │     │
│     │ • Ensure responsive breakpoints                              │     │
│     └─────────────────────────────────────────────────────────────┘     │
│                                                                          │
│                              ▼                                           │
│                                                                          │
│  5. RENDER & ITERATE                                                     │
│     ┌─────────────────────────────────────────────────────────────┐     │
│     │ • Render page in editor canvas                               │     │
│     │ • User can refine via chat ("make the hero taller")          │     │
│     │ • AI applies incremental changes                             │     │
│     │ • Full edit capability in visual editor                      │     │
│     └─────────────────────────────────────────────────────────────┘     │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### AI Prompt Engineering

```typescript
interface AIPageGenerationRequest {
  // User's natural language prompt
  prompt: string;
  
  // Page type hint
  pageType?: 'home' | 'product' | 'collection' | 'about' | 'contact' | 'custom';
  
  // Store context
  storeContext: {
    name: string;
    industry: string;
    brandColors: string[];
    targetAudience: string;
    tone: 'professional' | 'casual' | 'luxury' | 'playful';
  };
  
  // Design system context
  designTokens: DesignTokens;
  
  // Available components
  availableComponents: ComponentDefinition[];
  
  // Product data (if product page)
  productData?: {
    name: string;
    description: string;
    price: number;
    images: string[];
    features: string[];
    variants: ProductVariant[];
  };
  
  // Reference pages for style consistency
  referencePages?: Page[];
}

interface AIPageGenerationResponse {
  success: boolean;
  page?: Page;
  suggestions?: string[];
  error?: string;
}
```

### System Prompt for Page Generation

```typescript
const PAGE_GENERATION_SYSTEM_PROMPT = `
You are an expert e-commerce website designer and developer. Your task is to generate 
complete, production-ready page layouts in a structured JSON format.

## Your Capabilities:
1. Create visually stunning e-commerce pages
2. Use the provided design tokens for consistent styling
3. Leverage the available component library
4. Generate responsive layouts for all breakpoints
5. Write compelling copy that converts

## Output Format:
You must output valid JSON matching the Page schema. Each element must have:
- Unique ID (use descriptive names like "hero-section", "product-grid")
- Proper parent-child relationships
- Complete styling using design tokens
- Responsive breakpoint overrides

## Design Principles:
1. Visual Hierarchy: Guide the eye with size, color, and spacing
2. Whitespace: Use generous padding and margins
3. Consistency: Stick to the design token system
4. Mobile-First: Design for mobile, enhance for desktop
5. Conversion: Every page should have clear CTAs

## E-commerce Best Practices:
1. Hero sections should be impactful but not overwhelming
2. Product images should be large and high-quality
3. Trust signals (reviews, badges) should be visible
4. CTAs should be prominent and action-oriented
5. Navigation should be intuitive

## Available Components:
{componentList}

## Design Tokens:
{designTokens}

## Store Context:
{storeContext}

Generate a complete page based on the user's request.
`;
```


## Canvas Implementation

### Infinite Canvas with Pan/Zoom

Based on research, we'll use **DndKit + D3-zoom** for the canvas:

```typescript
// Canvas state
interface CanvasState {
  // Transform (pan + zoom)
  transform: {
    x: number;      // Pan X
    y: number;      // Pan Y
    k: number;      // Zoom scale (1 = 100%)
  };
  
  // Selection
  selectedElementIds: string[];
  hoveredElementId: string | null;
  
  // Drag state
  isDragging: boolean;
  draggedElementId: string | null;
  
  // Resize state
  isResizing: boolean;
  resizeHandle: ResizeHandle | null;
  
  // Multi-select box
  selectionBox: {
    active: boolean;
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  
  // Guides
  guides: Guide[];
  snappingEnabled: boolean;
  
  // Rulers
  showRulers: boolean;
  
  // Grid
  showGrid: boolean;
  gridSize: number;
}

type ResizeHandle = 
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right';
```

### Canvas Component Architecture

```typescript
// Main canvas component
const VisualCanvas: React.FC<CanvasProps> = ({ page, onUpdate }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  
  // D3 zoom for pan/zoom
  const zoomBehavior = useMemo(() => zoom<HTMLDivElement, unknown>(), []);
  
  useLayoutEffect(() => {
    if (!canvasRef.current) return;
    
    zoomBehavior
      .scaleExtent([0.1, 4]) // 10% to 400% zoom
      .on('zoom', ({ transform }) => setTransform(transform));
    
    select(canvasRef.current).call(zoomBehavior);
  }, [zoomBehavior]);
  
  return (
    <div ref={canvasRef} className="canvas-viewport">
      <div 
        className="canvas-content"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Page frame */}
        <PageFrame page={page}>
          {/* Render element tree */}
          <ElementRenderer 
            elementId={page.rootElementId}
            elements={page.elements}
            transform={transform}
          />
        </PageFrame>
        
        {/* Selection overlays */}
        <SelectionOverlay />
        
        {/* Guides */}
        <GuidesOverlay />
        
        {/* Resize handles */}
        <ResizeHandles />
      </div>
      
      {/* Rulers (fixed position) */}
      <Rulers transform={transform} />
    </div>
  );
};
```

### Element Renderer

```typescript
// Recursive element renderer
const ElementRenderer: React.FC<{
  elementId: string;
  elements: Record<string, VisualElement>;
  transform: Transform;
}> = ({ elementId, elements, transform }) => {
  const element = elements[elementId];
  if (!element || element.hidden) return null;
  
  // Get computed styles for current breakpoint
  const styles = useComputedStyles(element);
  
  // Render based on element type
  const renderContent = () => {
    switch (element.type) {
      case 'frame':
        return (
          <div style={styles}>
            {element.children.map(childId => (
              <ElementRenderer
                key={childId}
                elementId={childId}
                elements={elements}
                transform={transform}
              />
            ))}
          </div>
        );
      
      case 'text':
        return <TextElement element={element} styles={styles} />;
      
      case 'image':
        return <ImageElement element={element} styles={styles} />;
      
      case 'component':
        return <ComponentInstance element={element} styles={styles} />;
      
      // ... other element types
    }
  };
  
  return (
    <DraggableElement elementId={elementId} transform={transform}>
      {renderContent()}
    </DraggableElement>
  );
};
```


## Design Token System

### Token Structure

```typescript
interface DesignTokens {
  colors: ColorTokens;
  typography: TypographyTokens;
  spacing: SpacingTokens;
  borderRadius: BorderRadiusTokens;
  shadows: ShadowTokens;
  breakpoints: BreakpointTokens;
}

interface ColorTokens {
  // Brand colors
  brand: {
    primary: string;
    secondary: string;
    accent: string;
  };
  
  // Semantic colors
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  
  // Neutral scale (using OKLCH)
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    950: string;
  };
  
  // Background colors
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  
  // Text colors
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
}

interface TypographyTokens {
  fontFamilies: {
    heading: string;
    body: string;
    mono: string;
  };
  
  fontSizes: {
    xs: string;    // 12px
    sm: string;    // 14px
    base: string;  // 16px
    lg: string;    // 18px
    xl: string;    // 20px
    '2xl': string; // 24px
    '3xl': string; // 30px
    '4xl': string; // 36px
    '5xl': string; // 48px
    '6xl': string; // 60px
  };
  
  fontWeights: {
    normal: number;  // 400
    medium: number;  // 500
    semibold: number; // 600
    bold: number;    // 700
  };
  
  lineHeights: {
    tight: number;   // 1.25
    normal: number;  // 1.5
    relaxed: number; // 1.75
  };
}

interface SpacingTokens {
  0: string;   // 0px
  1: string;   // 4px
  2: string;   // 8px
  3: string;   // 12px
  4: string;   // 16px
  5: string;   // 20px
  6: string;   // 24px
  8: string;   // 32px
  10: string;  // 40px
  12: string;  // 48px
  16: string;  // 64px
  20: string;  // 80px
  24: string;  // 96px
}
```

## Editor UI Components

### Panel Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│  [Logo]  [Page: Home ▼]  [Undo] [Redo]  [Preview] [Publish]  [Settings] │
├─────────┬───────────────────────────────────────────────────┬───────────┤
│         │                                                   │           │
│  LAYERS │              CANVAS                               │ PROPERTIES│
│         │                                                   │           │
│  ├ Page │     ┌─────────────────────────────────┐          │  Element  │
│  │ ├ He │     │                                 │          │  ─────────│
│  │ │ ├  │     │      [Page Content]             │          │  Position │
│  │ │ └  │     │                                 │          │  Size     │
│  │ ├ Fe │     │                                 │          │  Layout   │
│  │ └ Fo │     │                                 │          │  Style    │
│         │     │                                 │          │  Effects  │
│─────────│     └─────────────────────────────────┘          │           │
│         │                                                   │───────────│
│  COMPO- │     [─────────────────────────────────]          │    AI     │
│  NENTS  │     [  100%  ▼ ] [Desktop ▼] [Grid ▼]            │  ─────────│
│         │                                                   │  Generate │
│  Layout │                                                   │  Improve  │
│  Hero   │                                                   │  Suggest  │
│  Product│                                                   │           │
│  ...    │                                                   │           │
│         │                                                   │           │
└─────────┴───────────────────────────────────────────────────┴───────────┘
```

### AI Chat Panel

```typescript
interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  
  // For assistant messages
  generatedElements?: string[]; // Element IDs that were created/modified
  suggestions?: string[];
}

const AIChatPanel: React.FC = () => {
  const [messages, setMessages] = useState<AIChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleSubmit = async () => {
    if (!input.trim() || isGenerating) return;
    
    // Add user message
    const userMessage: AIChatMessage = {
      id: generateId(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsGenerating(true);
    
    try {
      // Call AI generation API
      const response = await generateWithAI({
        prompt: input,
        context: getCurrentPageContext(),
      });
      
      // Add assistant message
      const assistantMessage: AIChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        generatedElements: response.elementIds,
        suggestions: response.suggestions,
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Apply changes to canvas
      if (response.elements) {
        applyElementChanges(response.elements);
      }
    } catch (error) {
      // Handle error
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="ai-chat-panel">
      <div className="messages">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
      </div>
      
      <div className="input-area">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Describe what you want to create..."
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
        />
        <Button onClick={handleSubmit} disabled={isGenerating}>
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>
      </div>
      
      {/* Quick prompts */}
      <div className="quick-prompts">
        <QuickPrompt>Create a hero section</QuickPrompt>
        <QuickPrompt>Add a product grid</QuickPrompt>
        <QuickPrompt>Design a footer</QuickPrompt>
      </div>
    </div>
  );
};
```


## Implementation Plan

### Phase 1: Core Canvas (2-3 weeks)

**Goal**: Basic infinite canvas with element rendering

1. **Canvas Infrastructure**
   - [ ] Infinite canvas with pan/zoom (D3-zoom)
   - [ ] Element tree data model
   - [ ] Basic element renderer
   - [ ] Selection system (single + multi)
   - [ ] Drag to move elements (DndKit)

2. **Basic Elements**
   - [ ] Frame element (container)
   - [ ] Text element
   - [ ] Image element
   - [ ] Basic styling (background, border, padding)

3. **Editor UI**
   - [ ] Layers panel (element tree)
   - [ ] Properties panel (basic)
   - [ ] Toolbar (zoom, undo/redo)

### Phase 2: Layout System (2 weeks)

**Goal**: Flexbox/Grid layout with responsive breakpoints

1. **Layout Engine**
   - [ ] Flexbox layout support
   - [ ] Grid layout support
   - [ ] Absolute positioning
   - [ ] Constraints system (like Figma)

2. **Responsive System**
   - [ ] Breakpoint definitions
   - [ ] Breakpoint overrides per element
   - [ ] Viewport switcher in editor
   - [ ] Responsive preview

3. **Guides & Snapping**
   - [ ] Smart guides
   - [ ] Snap to grid
   - [ ] Snap to elements
   - [ ] Rulers

### Phase 3: Component System (2 weeks)

**Goal**: Reusable components with variants

1. **Component Definition**
   - [ ] Create component from selection
   - [ ] Component props system
   - [ ] Component variants
   - [ ] Component library panel

2. **E-commerce Components**
   - [ ] Product card
   - [ ] Product grid
   - [ ] Hero section
   - [ ] Navigation header
   - [ ] Footer
   - [ ] Cart drawer

3. **Component Instances**
   - [ ] Drag components to canvas
   - [ ] Override component props
   - [ ] Detach instance

### Phase 4: AI Integration (2-3 weeks)

**Goal**: AI-powered page generation

1. **AI Page Generator**
   - [ ] Page generation API (AWS Bedrock)
   - [ ] Context enrichment (store, tokens, components)
   - [ ] Structured output parsing
   - [ ] Validation & auto-fix

2. **AI Chat Interface**
   - [ ] Chat panel UI
   - [ ] Conversational refinement
   - [ ] Quick prompts
   - [ ] Generation history

3. **AI Element Operations**
   - [ ] Generate section from prompt
   - [ ] Improve existing content
   - [ ] Suggest layouts
   - [ ] Auto-generate responsive variants

4. **AI Content Generation**
   - [ ] Headlines & copy
   - [ ] Product descriptions
   - [ ] CTAs
   - [ ] Image alt text

### Phase 5: Advanced Features (2 weeks)

**Goal**: Production-ready editor

1. **Interactions**
   - [ ] Hover states
   - [ ] Click actions
   - [ ] Scroll animations
   - [ ] Page transitions

2. **Forms**
   - [ ] Form builder
   - [ ] Input validation
   - [ ] Form submission handling

3. **Publishing**
   - [ ] Preview mode
   - [ ] Publish to storefront
   - [ ] Version history
   - [ ] Rollback

4. **Performance**
   - [ ] Virtualized element rendering
   - [ ] Lazy loading
   - [ ] Optimized re-renders

## File Structure

```
src/features/visual-editor-v2/
├── index.ts                    # Public exports
├── types/
│   ├── element.ts             # Element types
│   ├── page.ts                # Page types
│   ├── component.ts           # Component types
│   ├── tokens.ts              # Design token types
│   └── canvas.ts              # Canvas state types
├── store/
│   ├── editor-store.ts        # Main Zustand store
│   ├── canvas-store.ts        # Canvas state
│   ├── selection-store.ts     # Selection state
│   └── history-store.ts       # Undo/redo
├── canvas/
│   ├── Canvas.tsx             # Main canvas component
│   ├── CanvasViewport.tsx     # Pan/zoom viewport
│   ├── ElementRenderer.tsx    # Recursive renderer
│   ├── SelectionOverlay.tsx   # Selection UI
│   ├── GuidesOverlay.tsx      # Smart guides
│   ├── ResizeHandles.tsx      # Resize UI
│   └── Rulers.tsx             # Rulers
├── elements/
│   ├── FrameElement.tsx       # Container element
│   ├── TextElement.tsx        # Text element
│   ├── ImageElement.tsx       # Image element
│   ├── ComponentInstance.tsx  # Component instance
│   └── ...
├── panels/
│   ├── LayersPanel.tsx        # Element tree
│   ├── PropertiesPanel.tsx    # Element properties
│   ├── ComponentsPanel.tsx    # Component library
│   ├── AIChatPanel.tsx        # AI chat
│   └── DesignTokensPanel.tsx  # Token editor
├── ai/
│   ├── page-generator.ts      # AI page generation
│   ├── content-generator.ts   # AI content
│   ├── layout-suggester.ts    # AI layout suggestions
│   ├── prompts/
│   │   ├── page-generation.ts # System prompts
│   │   ├── content.ts
│   │   └── layout.ts
│   └── validators/
│       ├── element-validator.ts
│       └── page-validator.ts
├── components/
│   ├── library/               # Pre-built components
│   │   ├── hero/
│   │   ├── product/
│   │   ├── navigation/
│   │   └── ...
│   └── ComponentPicker.tsx
├── tokens/
│   ├── default-tokens.ts      # Default design tokens
│   └── token-utils.ts         # Token utilities
├── hooks/
│   ├── use-canvas.ts          # Canvas operations
│   ├── use-selection.ts       # Selection operations
│   ├── use-element.ts         # Element operations
│   ├── use-ai-generation.ts   # AI generation
│   └── use-responsive.ts      # Responsive utilities
└── utils/
    ├── element-utils.ts       # Element helpers
    ├── layout-utils.ts        # Layout calculations
    ├── style-utils.ts         # Style generation
    └── export-utils.ts        # Export to HTML/React
```

## API Routes

```
/api/editor-v2/
├── pages/
│   ├── GET    /              # List pages
│   ├── POST   /              # Create page
│   ├── GET    /[id]          # Get page
│   ├── PUT    /[id]          # Update page
│   ├── DELETE /[id]          # Delete page
│   └── POST   /[id]/publish  # Publish page
├── components/
│   ├── GET    /              # List components
│   ├── POST   /              # Create component
│   ├── GET    /[id]          # Get component
│   ├── PUT    /[id]          # Update component
│   └── DELETE /[id]          # Delete component
├── ai/
│   ├── POST   /generate-page     # Generate full page
│   ├── POST   /generate-section  # Generate section
│   ├── POST   /generate-content  # Generate content
│   ├── POST   /suggest-layout    # Suggest layouts
│   └── POST   /improve           # Improve content
└── assets/
    ├── POST   /upload        # Upload image
    └── GET    /[id]          # Get asset
```

## Success Metrics

1. **User Experience**
   - Time to create a page: < 5 minutes with AI
   - Learning curve: Intuitive for non-designers
   - Performance: 60fps canvas interactions

2. **AI Quality**
   - Page generation success rate: > 90%
   - User satisfaction with AI output: > 80%
   - Iteration count to final design: < 3

3. **Technical**
   - Canvas render time: < 16ms
   - AI response time: < 10s for full page
   - Bundle size: < 500KB for editor

## Conclusion

This architecture provides a foundation for building a professional-grade visual editor that:

1. **Rivals Framer/Webflow** with infinite canvas, pixel-perfect positioning, and responsive design
2. **Leverages AI** for rapid page generation using AWS Bedrock
3. **Specializes in E-commerce** with pre-built components and workflows
4. **Maintains Flexibility** with a component system and design tokens

The phased implementation allows for incremental delivery while building toward the full vision.
