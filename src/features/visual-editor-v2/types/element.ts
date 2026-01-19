/**
 * Visual Editor V2 - Element Types
 * 
 * Core element types for the Framer/Webflow-level visual editor.
 * Elements are flexible, nestable, and support pixel-perfect positioning.
 */

// ============================================================================
// ELEMENT TYPES
// ============================================================================

export type ElementType =
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

// ============================================================================
// LAYOUT CONFIGURATION
// ============================================================================

export interface LayoutConfig {
  display: 'block' | 'flex' | 'grid' | 'inline' | 'inline-flex' | 'none';
  
  // Flexbox
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  alignContent?: 'start' | 'center' | 'end' | 'between' | 'around' | 'stretch';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  
  // Grid
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridAutoFlow?: 'row' | 'column' | 'dense' | 'row dense' | 'column dense';
  gridAutoColumns?: string;
  gridAutoRows?: string;
  
  // Child positioning in grid/flex
  gridColumn?: string;
  gridRow?: string;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: string | number;
  alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justifySelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch';
}

export const DEFAULT_LAYOUT: LayoutConfig = {
  display: 'block',
};


// ============================================================================
// POSITION CONFIGURATION
// ============================================================================

export type PositionType = 'relative' | 'absolute' | 'fixed' | 'sticky';

export type ConstraintHorizontal = 'left' | 'right' | 'center' | 'scale' | 'left-right';
export type ConstraintVertical = 'top' | 'bottom' | 'center' | 'scale' | 'top-bottom';

export interface PositionConfig {
  type: PositionType;
  top?: number | 'auto';
  right?: number | 'auto';
  bottom?: number | 'auto';
  left?: number | 'auto';
  zIndex?: number;
  
  // Constraints (like Figma) - how element responds to parent resize
  constraints: {
    horizontal: ConstraintHorizontal;
    vertical: ConstraintVertical;
  };
}

export const DEFAULT_POSITION: PositionConfig = {
  type: 'relative',
  constraints: {
    horizontal: 'left',
    vertical: 'top',
  },
};

// ============================================================================
// SIZE CONFIGURATION
// ============================================================================

export type SizeValue = number | 'auto' | 'fill' | 'hug';

export interface SizeConfig {
  width: SizeValue;
  height: SizeValue;
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number; // width / height
}

export const DEFAULT_SIZE: SizeConfig = {
  width: 'auto',
  height: 'auto',
};

// ============================================================================
// STYLE CONFIGURATION
// ============================================================================

export interface BackgroundStyle {
  type: 'solid' | 'gradient' | 'image';
  color?: string;
  gradient?: {
    type: 'linear' | 'radial';
    angle?: number;
    stops: Array<{ color: string; position: number }>;
  };
  image?: {
    url: string;
    size: 'cover' | 'contain' | 'auto' | string;
    position: string;
    repeat: 'no-repeat' | 'repeat' | 'repeat-x' | 'repeat-y';
  };
}

export interface BorderStyle {
  width: number;
  style: 'solid' | 'dashed' | 'dotted' | 'none';
  color: string;
}

export interface ShadowStyle {
  type: 'drop' | 'inner';
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}

export interface TypographyStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textDecoration?: 'none' | 'underline' | 'line-through';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  color?: string;
}

export interface TransitionConfig {
  property: string;
  duration: number;
  easing: string;
  delay?: number;
}

export interface StyleConfig {
  // Background
  background?: BackgroundStyle;
  
  // Border
  border?: BorderStyle;
  borderTop?: BorderStyle;
  borderRight?: BorderStyle;
  borderBottom?: BorderStyle;
  borderLeft?: BorderStyle;
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
  overflowX?: 'visible' | 'hidden' | 'scroll' | 'auto';
  overflowY?: 'visible' | 'hidden' | 'scroll' | 'auto';
  
  // Cursor
  cursor?: string;
  
  // Transitions
  transitions?: TransitionConfig[];
  
  // Custom CSS (escape hatch)
  customCSS?: string;
}

export const DEFAULT_STYLE: StyleConfig = {};


// ============================================================================
// CONTENT CONFIGURATION
// ============================================================================

export interface TextContent {
  type: 'text';
  text: string;
  richText?: boolean; // If true, text contains HTML
}

export interface ImageContent {
  type: 'image';
  src: string;
  alt: string;
  loading?: 'lazy' | 'eager';
}

export interface VideoContent {
  type: 'video';
  src: string;
  poster?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
}

export interface LinkContent {
  type: 'link';
  href: string;
  target?: '_self' | '_blank';
  rel?: string;
}

export interface IconContent {
  type: 'icon';
  name: string; // Lucide icon name
  size?: number;
  strokeWidth?: number;
}

export interface EmbedContent {
  type: 'embed';
  html: string;
}

export interface FormInputContent {
  type: 'input';
  inputType: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string }>; // For select/radio
}

export type ContentConfig =
  | TextContent
  | ImageContent
  | VideoContent
  | LinkContent
  | IconContent
  | EmbedContent
  | FormInputContent;

// ============================================================================
// INTERACTION CONFIGURATION
// ============================================================================

export type InteractionTrigger = 'click' | 'hover' | 'scroll-into-view' | 'page-load';

export type InteractionAction =
  | { type: 'navigate'; url: string; target?: '_self' | '_blank' }
  | { type: 'scroll-to'; elementId: string; offset?: number }
  | { type: 'open-modal'; modalId: string }
  | { type: 'close-modal' }
  | { type: 'toggle-class'; className: string }
  | { type: 'set-variable'; name: string; value: unknown }
  | { type: 'submit-form' }
  | { type: 'custom'; code: string };

export interface Interaction {
  id: string;
  trigger: InteractionTrigger;
  action: InteractionAction;
  animation?: {
    type: 'fade' | 'slide' | 'scale' | 'rotate' | 'custom';
    duration: number;
    easing: string;
    delay?: number;
  };
}

// ============================================================================
// BREAKPOINTS
// ============================================================================

export type Breakpoint = 'mobile' | 'tablet' | 'desktop' | 'wide';

export const BREAKPOINTS: Record<Breakpoint, { min: number; max: number; label: string }> = {
  mobile: { min: 0, max: 767, label: 'Mobile' },
  tablet: { min: 768, max: 1023, label: 'Tablet' },
  desktop: { min: 1024, max: 1439, label: 'Desktop' },
  wide: { min: 1440, max: Infinity, label: 'Wide' },
};

export const BREAKPOINT_ORDER: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'wide'];

// ============================================================================
// VISUAL ELEMENT (MAIN TYPE)
// ============================================================================

export interface VisualElement {
  id: string;
  type: ElementType;
  name: string;
  
  // Layout & Positioning
  layout: LayoutConfig;
  position: PositionConfig;
  size: SizeConfig;
  
  // Styling
  styles: StyleConfig;
  
  // Content (type-specific)
  content?: ContentConfig;
  
  // Component reference (if type === 'component')
  componentId?: string;
  props?: Record<string, unknown>;
  
  // Hierarchy
  parentId: string | null;
  children: string[]; // Element IDs
  
  // Responsive overrides
  breakpointOverrides: Partial<Record<Breakpoint, BreakpointOverride>>;
  
  // Interactions
  interactions: Interaction[];
  
  // Metadata
  locked: boolean;
  hidden: boolean;
  collapsed: boolean; // In layers panel
  
  // Data binding (for dynamic content)
  dataBinding?: {
    source: 'product' | 'collection' | 'cart' | 'user' | 'custom';
    field: string;
    fallback?: unknown;
  };
}

export interface BreakpointOverride {
  layout?: Partial<LayoutConfig>;
  position?: Partial<PositionConfig>;
  size?: Partial<SizeConfig>;
  styles?: Partial<StyleConfig>;
  hidden?: boolean;
}

// ============================================================================
// FACTORY FUNCTIONS
// ============================================================================

let elementIdCounter = 0;

export function generateElementId(type: ElementType): string {
  elementIdCounter++;
  return `${type}-${Date.now()}-${elementIdCounter}`;
}

export function createVisualElement(
  type: ElementType,
  overrides: Partial<VisualElement> = {}
): VisualElement {
  return {
    id: generateElementId(type),
    type,
    name: type.charAt(0).toUpperCase() + type.slice(1),
    layout: { ...DEFAULT_LAYOUT },
    position: { ...DEFAULT_POSITION },
    size: { ...DEFAULT_SIZE },
    styles: { ...DEFAULT_STYLE },
    parentId: null,
    children: [],
    breakpointOverrides: {},
    interactions: [],
    locked: false,
    hidden: false,
    collapsed: false,
    ...overrides,
  };
}

export function createFrameElement(overrides: Partial<VisualElement> = {}): VisualElement {
  return createVisualElement('frame', {
    name: 'Frame',
    layout: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    size: {
      width: 'fill',
      height: 'auto',
    },
    styles: {
      padding: 16,
    },
    ...overrides,
  });
}

export function createTextElement(text: string, overrides: Partial<VisualElement> = {}): VisualElement {
  return createVisualElement('text', {
    name: 'Text',
    content: {
      type: 'text',
      text,
    },
    size: {
      width: 'auto',
      height: 'auto',
    },
    styles: {
      typography: {
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.5,
      },
    },
    ...overrides,
  });
}

export function createImageElement(src: string, alt: string, overrides: Partial<VisualElement> = {}): VisualElement {
  return createVisualElement('image', {
    name: 'Image',
    content: {
      type: 'image',
      src,
      alt,
    },
    size: {
      width: 'fill',
      height: 'auto',
    },
    ...overrides,
  });
}

export function createButtonElement(text: string, overrides: Partial<VisualElement> = {}): VisualElement {
  return createVisualElement('button', {
    name: 'Button',
    content: {
      type: 'text',
      text,
    },
    layout: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    size: {
      width: 'hug',
      height: 'hug',
    },
    styles: {
      padding: [12, 24, 12, 24],
      borderRadius: 8,
      background: {
        type: 'solid',
        color: 'var(--ds-gray-1000)',
      },
      typography: {
        fontSize: 14,
        fontWeight: 500,
        color: 'white',
      },
    },
    ...overrides,
  });
}
