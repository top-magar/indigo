# Visual Editor V3 Design System Specification

## Figma Design Systems Engineer Analysis

**Author**: Design Systems Engineering Team  
**Date**: January 2025  
**Version**: 1.0

---

## Executive Summary

This document provides a comprehensive design system specification for the Indigo Visual Editor V3, analyzed from the perspective of a Figma Design Systems Engineer. The analysis covers block component architecture, design tokens, editor-specific components, theming, documentation, and specific component APIs.

---

## 1. BLOCK COMPONENT ARCHITECTURE

### 1.1 Current Registry Analysis

The current `BlockRegistryManager` class provides a solid foundation but can be enhanced with Figma-style patterns:

**Current Strengths:**
- Zod schema validation for type safety
- Category-based organization (layout, content, media, interactive, commerce)
- Centralized component registration

**Recommended Improvements:**

#### 1.1.1 Enhanced Block Definition Interface

```typescript
// src/features/visual-editor-v3/types/block-definition.ts

import { z } from 'zod';
import type { LucideIcon } from 'lucide-react';

/**
 * Block variant definition for different visual states
 */
export interface BlockVariant {
  name: string;
  description: string;
  defaultProps: Record<string, unknown>;
  preview?: React.ComponentType;
}

/**
 * Block slot definition for nested content areas
 */
export interface BlockSlot {
  name: string;
  description: string;
  allowedTypes: BlockType[];
  minItems?: number;
  maxItems?: number;
}

/**
 * Property field definition for the properties panel
 */
export interface PropertyField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'color' | 'select' | 'boolean' | 'spacing' | 'typography';
  group: 'content' | 'layout' | 'appearance' | 'typography' | 'effects';
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  responsive?: boolean; // Can be overridden per breakpoint
  aiGeneratable?: boolean; // Can be AI-generated
}


/**
 * Enhanced Block Definition following Figma patterns
 */
export interface EnhancedBlockDefinition<T = unknown> {
  // Identity
  type: BlockType;
  label: string;
  description: string;
  icon: LucideIcon;
  category: 'layout' | 'content' | 'media' | 'interactive' | 'commerce';
  
  // Schema & Validation
  contentSchema: z.ZodType<T>;
  styleSchema: z.ZodType<Record<string, unknown>>;
  
  // Component
  component: React.ComponentType<BlockComponentProps<T>>;
  
  // Variants (like Figma component variants)
  variants?: BlockVariant[];
  
  // Slots for nested content
  slots?: BlockSlot[];
  
  // Property panel configuration
  propertyFields: PropertyField[];
  
  // Defaults
  defaultContent: Partial<T>;
  defaultStyles: Record<string, string>;
  
  // Constraints
  constraints?: {
    canBeRoot?: boolean;
    canHaveChildren?: boolean;
    allowedParents?: BlockType[];
    allowedChildren?: BlockType[];
  };
  
  // Metadata
  tags?: string[];
  version?: string;
  deprecated?: boolean;
  deprecationMessage?: string;
}
```


#### 1.1.2 Standardized Block Component Props Interface

```typescript
// src/features/visual-editor-v3/types/block-props.ts

/**
 * Base props that ALL block components must accept
 * This ensures consistency across the entire block system
 */
export interface BlockComponentProps<TContent = Record<string, unknown>> {
  // Content data (validated by contentSchema)
  content: TContent;
  
  // Merged responsive styles
  styles: React.CSSProperties;
  
  // Editor state
  isSelected?: boolean;
  isHovered?: boolean;
  isEditing?: boolean;
  
  // Slot children
  children?: React.ReactNode;
  
  // Forwarded ref for DOM access
  ref?: React.Ref<HTMLElement>;
  
  // Additional className for selection rings, etc.
  className?: string;
  
  // Block metadata
  blockId: string;
  blockType: BlockType;
}

/**
 * Props for blocks that support inline editing
 */
export interface EditableBlockProps<TContent> extends BlockComponentProps<TContent> {
  onContentChange: (key: keyof TContent, value: unknown) => void;
  onBlur?: () => void;
}
```


#### 1.1.3 Block Variant System

```typescript
// Example: Button block with variants (like Figma component variants)
const ButtonBlockDefinition: EnhancedBlockDefinition<ButtonContent> = {
  type: 'button',
  label: 'Button',
  description: 'Interactive button with multiple variants',
  icon: MousePointerClick,
  category: 'interactive',
  
  variants: [
    {
      name: 'primary',
      description: 'High-emphasis button for primary actions',
      defaultProps: { variant: 'primary' },
    },
    {
      name: 'secondary',
      description: 'Medium-emphasis button for secondary actions',
      defaultProps: { variant: 'secondary' },
    },
    {
      name: 'outline',
      description: 'Low-emphasis button with border',
      defaultProps: { variant: 'outline' },
    },
    {
      name: 'ghost',
      description: 'Minimal button for tertiary actions',
      defaultProps: { variant: 'ghost' },
    },
  ],
  
  propertyFields: [
    { key: 'label', label: 'Label', type: 'text', group: 'content', aiGeneratable: true },
    { key: 'variant', label: 'Variant', type: 'select', group: 'appearance', 
      options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Secondary', value: 'secondary' },
        { label: 'Outline', value: 'outline' },
        { label: 'Ghost', value: 'ghost' },
      ]
    },
    { key: 'size', label: 'Size', type: 'select', group: 'appearance',
      options: [
        { label: 'Small', value: 'sm' },
        { label: 'Medium', value: 'md' },
        { label: 'Large', value: 'lg' },
      ]
    },
    { key: 'href', label: 'Link URL', type: 'text', group: 'content' },
  ],
  // ...
};
```


---

## 2. DESIGN TOKEN SYSTEM

### 2.1 Current Token Analysis

The existing `geist-tokens-oklch.css` provides an excellent foundation with OKLCH color space. Here are recommended additions:

### 2.2 Additional Editor-Specific Tokens

```css
/* src/styles/editor-tokens.css */

@layer base {
  :root {
    /* =========================================================================
       EDITOR-SPECIFIC TOKENS
       ========================================================================= */
    
    /* Selection & Focus */
    --editor-selection-color: var(--ds-blue-700);
    --editor-selection-bg: var(--ds-blue-100);
    --editor-hover-color: var(--ds-gray-alpha-400);
    --editor-focus-ring: 0 0 0 2px var(--ds-background-100), 0 0 0 4px var(--ds-blue-700);
    
    /* Drop Zones */
    --editor-drop-zone-color: var(--ds-blue-500);
    --editor-drop-zone-bg: var(--ds-blue-100);
    --editor-drop-zone-border: 2px dashed var(--ds-blue-400);
    
    /* Resize Handles */
    --editor-handle-size: 8px;
    --editor-handle-color: var(--ds-blue-700);
    --editor-handle-bg: var(--ds-background-100);
    --editor-handle-border: 1px solid var(--ds-blue-700);
    
    /* Canvas */
    --editor-canvas-bg: var(--ds-gray-100);
    --editor-canvas-grid-color: var(--ds-gray-alpha-300);
    --editor-canvas-grid-size: 24px;
    
    /* Panels */
    --editor-panel-bg: var(--ds-background-100);
    --editor-panel-border: var(--ds-gray-200);
    --editor-panel-header-height: 44px;
    --editor-panel-width-left: 280px;
    --editor-panel-width-right: 280px;

    
    /* Toolbar */
    --editor-toolbar-height: 48px;
    --editor-toolbar-bg: var(--ds-background-100);
    --editor-toolbar-border: var(--ds-gray-200);
    
    /* Block Labels */
    --editor-label-bg: var(--ds-blue-700);
    --editor-label-color: white;
    --editor-label-font-size: 10px;
    --editor-label-padding: 2px 6px;
    --editor-label-radius: 2px;
    
    /* =========================================================================
       SPACING TOKENS (4px base, extended for editor)
       ========================================================================= */
    
    --space-px: 1px;
    --space-0-5: 2px;
    --space-1: 4px;
    --space-1-5: 6px;
    --space-2: 8px;
    --space-2-5: 10px;
    --space-3: 12px;
    --space-3-5: 14px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --space-7: 28px;
    --space-8: 32px;
    --space-9: 36px;
    --space-10: 40px;
    --space-11: 44px;
    --space-12: 48px;
    --space-14: 56px;
    --space-16: 64px;
    --space-20: 80px;
    --space-24: 96px;
    --space-28: 112px;
    --space-32: 128px;
    
    /* =========================================================================
       SIZING TOKENS
       ========================================================================= */
    
    /* Component Heights (Geist scale) */
    --size-tiny: 24px;
    --size-small: 32px;
    --size-medium: 40px;
    --size-large: 48px;
    --size-xlarge: 56px;
    
    /* Icon Sizes */
    --icon-xs: 12px;
    --icon-sm: 14px;
    --icon-md: 16px;
    --icon-lg: 20px;
    --icon-xl: 24px;

    
    /* =========================================================================
       ANIMATION TOKENS (Editor-specific)
       ========================================================================= */
    
    /* Selection animations */
    --editor-transition-selection: 100ms ease-out;
    --editor-transition-panel: 200ms ease-out;
    --editor-transition-canvas: 300ms ease-out;
    
    /* Drag & Drop */
    --editor-drag-opacity: 0.5;
    --editor-drag-scale: 1.02;
    --editor-drop-scale: 1.05;
    
    /* =========================================================================
       Z-INDEX SCALE
       ========================================================================= */
    
    --z-canvas: 1;
    --z-block: 10;
    --z-block-selected: 15;
    --z-panel: 20;
    --z-header: 30;
    --z-overlay: 40;
    --z-modal: 50;
    --z-tooltip: 60;
    --z-drag: 100;
  }

  .dark {
    /* Dark mode overrides for editor tokens */
    --editor-canvas-bg: var(--ds-gray-200);
    --editor-panel-bg: var(--ds-background-100);
    --editor-selection-bg: oklch(0.25 0.08 240);
    --editor-drop-zone-bg: oklch(0.22 0.06 240);
  }
}
```


### 2.3 Semantic Token Naming Convention

Following Figma's token naming patterns:

```
--{namespace}-{category}-{property}-{variant}-{state}

Examples:
--ds-gray-100                    // Color scale
--editor-panel-bg                // Editor-specific
--editor-selection-color         // Selection state
--space-4                        // Spacing
--size-medium                    // Sizing
--radius-md                      // Border radius
--duration-normal                // Animation
--ease-out-cubic                 // Easing
```

---

## 3. EDITOR-SPECIFIC COMPONENTS

### 3.1 Reusable Editor Components to Extract

Based on the analysis, here are the key components to build:

#### 3.1.1 Panel System Components

```typescript
// src/features/visual-editor-v3/shared/layout/index.ts

export { Panel } from './Panel';
export { PanelHeader } from './PanelHeader';
export { PanelContent } from './PanelContent';
export { PanelFooter } from './PanelFooter';
export { PanelSection } from './PanelSection';
export { PanelTabs } from './PanelTabs';
export { ResizablePanel } from './ResizablePanel';
```


#### 3.1.2 Input Components for Property Editing

```typescript
// src/features/visual-editor-v3/shared/inputs/index.ts

// Basic Inputs
export { PropertyInput } from './PropertyInput';
export { TextInput } from './TextInput';
export { NumberInput } from './NumberInput';
export { SelectInput } from './SelectInput';
export { ColorPicker } from './ColorPicker';
export { BooleanToggle } from './BooleanToggle';

// Compound Inputs
export { SpacingInput } from './SpacingInput';      // 4-sided spacing control
export { SizeInput } from './SizeInput';            // Width/Height with units
export { TypographyInput } from './TypographyInput'; // Font family, size, weight
export { BorderInput } from './BorderInput';        // Width, style, color, radius
export { ShadowInput } from './ShadowInput';        // Box shadow editor
export { GradientInput } from './GradientInput';    // Gradient editor

// AI-Enhanced Inputs
export { AITextInput } from './AITextInput';        // Text with AI generation
export { AIImageInput } from './AIImageInput';      // Image with AI suggestions
```

#### 3.1.3 Control Components

```typescript
// src/features/visual-editor-v3/shared/controls/index.ts

export { IconButton } from './IconButton';
export { ToolbarButton } from './ToolbarButton';
export { ToolbarGroup } from './ToolbarGroup';
export { ToolbarDivider } from './ToolbarDivider';
export { BreakpointSelector } from './BreakpointSelector';
export { ZoomControl } from './ZoomControl';
export { UndoRedoButtons } from './UndoRedoButtons';
export { ViewModeToggle } from './ViewModeToggle';
```


---

## 4. THEMING & CUSTOMIZATION

### 4.1 Tenant-Specific Theming System

```typescript
// src/features/visual-editor-v3/theming/types.ts

/**
 * Tenant theme configuration
 * Allows each tenant to customize their storefront appearance
 */
export interface TenantTheme {
  // Brand Identity
  brand: {
    hue: number;           // 0-360, changes --ds-brand-hue
    name: string;
    logo?: string;
  };
  
  // Color Overrides
  colors: {
    primary?: string;      // Override primary color
    secondary?: string;
    accent?: string;
    background?: string;
    foreground?: string;
  };
  
  // Typography
  typography: {
    fontFamily?: string;
    headingFontFamily?: string;
    baseFontSize?: number;
    scale?: 'compact' | 'default' | 'relaxed';
  };
  
  // Spacing & Layout
  layout: {
    borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
    density?: 'compact' | 'default' | 'comfortable';
    maxWidth?: string;
  };
  
  // Dark Mode
  darkMode: {
    enabled: boolean;
    default?: 'light' | 'dark' | 'system';
  };
}
```


### 4.2 CSS Custom Property Structure

```css
/* Theme application via CSS custom properties */

/* Base theme layer - applied to :root */
:root {
  /* Brand theming via hue rotation */
  --ds-brand-hue: 240; /* Default blue */
  
  /* Computed brand colors */
  --ds-brand-100: oklch(0.97 0.02 var(--ds-brand-hue));
  --ds-brand-500: oklch(0.65 0.15 var(--ds-brand-hue));
  --ds-brand-700: oklch(0.55 0.20 var(--ds-brand-hue));
  --ds-brand-900: oklch(0.40 0.16 var(--ds-brand-hue));
}

/* Tenant theme override layer */
[data-tenant-theme="custom"] {
  --ds-brand-hue: var(--tenant-brand-hue, 240);
  --ds-background-100: var(--tenant-bg, oklch(1 0 0));
  --ds-gray-1000: var(--tenant-fg, oklch(0.15 0 0));
}

/* Dark mode for editor UI (separate from storefront) */
.editor-dark {
  --editor-panel-bg: oklch(0.14 0 0);
  --editor-canvas-bg: oklch(0.18 0 0);
}
```

### 4.3 Theme Provider Component

```typescript
// src/features/visual-editor-v3/theming/ThemeProvider.tsx

interface ThemeProviderProps {
  theme: TenantTheme;
  children: React.ReactNode;
  mode?: 'editor' | 'preview' | 'storefront';
}

export function ThemeProvider({ theme, children, mode = 'editor' }: ThemeProviderProps) {
  const cssVariables = useMemo(() => generateCSSVariables(theme), [theme]);
  
  return (
    <div 
      style={cssVariables}
      data-tenant-theme="custom"
      data-mode={mode}
      className={cn(
        mode === 'editor' && 'editor-theme',
        theme.darkMode.default === 'dark' && 'dark'
      )}
    >
      {children}
    </div>
  );
}
```


---

## 5. COMPONENT DOCUMENTATION

### 5.1 Storybook Stories Structure

```
stories/
├── editor/
│   ├── blocks/
│   │   ├── TextBlock.stories.tsx
│   │   ├── ButtonBlock.stories.tsx
│   │   ├── HeroBlock.stories.tsx
│   │   ├── ProductCardBlock.stories.tsx
│   │   └── ...
│   ├── inputs/
│   │   ├── PropertyInput.stories.tsx
│   │   ├── ColorPicker.stories.tsx
│   │   ├── SpacingInput.stories.tsx
│   │   └── ...
│   ├── panels/
│   │   ├── PropertiesPanel.stories.tsx
│   │   ├── LayersPanel.stories.tsx
│   │   └── ComponentsPanel.stories.tsx
│   └── controls/
│       ├── IconButton.stories.tsx
│       ├── BreakpointSelector.stories.tsx
│       └── ...
└── tokens/
    ├── Colors.stories.tsx
    ├── Typography.stories.tsx
    ├── Spacing.stories.tsx
    └── Shadows.stories.tsx
```

### 5.2 Example Storybook Story

```typescript
// stories/editor/blocks/ButtonBlock.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { ButtonBlock } from '@/features/visual-editor-v3/components/blocks/defaults';

const meta: Meta<typeof ButtonBlock> = {
  title: 'Editor/Blocks/ButtonBlock',
  component: ButtonBlock,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size following Geist scale',
    },
    label: {
      control: 'text',
      description: 'Button text content',
    },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://figma.com/file/xxx/Button',
    },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonBlock>;

export const Primary: Story = {
  args: { label: 'Primary Button', variant: 'primary', size: 'md' },
};

export const Secondary: Story = {
  args: { label: 'Secondary Button', variant: 'secondary', size: 'md' },
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <ButtonBlock label="Primary" variant="primary" />
      <ButtonBlock label="Secondary" variant="secondary" />
      <ButtonBlock label="Outline" variant="outline" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-end">
      <ButtonBlock label="Small" size="sm" />
      <ButtonBlock label="Medium" size="md" />
      <ButtonBlock label="Large" size="lg" />
    </div>
  ),
};
```


### 5.3 Testing Patterns

```typescript
// __tests__/blocks/ButtonBlock.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { ButtonBlock } from '@/features/visual-editor-v3/components/blocks/defaults';

describe('ButtonBlock', () => {
  it('renders with default props', () => {
    render(<ButtonBlock />);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('applies variant classes correctly', () => {
    const { rerender } = render(<ButtonBlock variant="primary" />);
    expect(screen.getByRole('button')).toHaveClass('bg-[var(--ds-gray-1000)]');
    
    rerender(<ButtonBlock variant="outline" />);
    expect(screen.getByRole('button')).toHaveClass('border');
  });

  it('renders as anchor when href is provided', () => {
    render(<ButtonBlock href="https://example.com" label="Link" />);
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.com');
  });

  it('applies size classes correctly', () => {
    render(<ButtonBlock size="lg" />);
    expect(screen.getByRole('button')).toHaveClass('h-12');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<ButtonBlock ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```


---

## 6. SPECIFIC COMPONENTS TO BUILD

### Component 1: SpacingInput

A 4-sided spacing control for padding/margin editing.

```typescript
// src/features/visual-editor-v3/shared/inputs/SpacingInput.tsx

export interface SpacingInputProps {
  label: string;
  value: SpacingValue;
  onChange: (value: SpacingValue) => void;
  mode?: 'all' | 'axis' | 'individual';
  unit?: 'px' | 'rem' | '%';
  min?: number;
  max?: number;
  hasOverride?: boolean;
  onClearOverride?: () => void;
}

export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
  linked?: boolean; // All sides linked
}

export const SpacingInput: React.FC<SpacingInputProps> = ({
  label,
  value,
  onChange,
  mode = 'individual',
  unit = 'px',
  min = 0,
  max = 999,
  hasOverride,
  onClearOverride,
}) => {
  const [isLinked, setIsLinked] = useState(value.linked ?? true);
  
  const handleChange = (side: keyof SpacingValue, newValue: number) => {
    if (isLinked) {
      onChange({ top: newValue, right: newValue, bottom: newValue, left: newValue, linked: true });
    } else {
      onChange({ ...value, [side]: newValue, linked: false });
    }
  };

  return (
    <div className="flex flex-col gap-1.5 mb-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-[var(--ds-gray-600)] uppercase tracking-wide">
          {label}
        </label>
        {hasOverride && onClearOverride && (
          <OverrideBadge onClick={onClearOverride} />
        )}
      </div>
      
      <div className="relative grid grid-cols-3 gap-1 p-2 bg-[var(--ds-gray-100)] rounded-md">
        {/* Top */}
        <div className="col-start-2">
          <NumberInput value={value.top} onChange={(v) => handleChange('top', v)} min={min} max={max} />
        </div>
        
        {/* Left & Link & Right */}
        <NumberInput value={value.left} onChange={(v) => handleChange('left', v)} min={min} max={max} />
        <button 
          onClick={() => setIsLinked(!isLinked)}
          className={cn(
            "flex items-center justify-center rounded",
            isLinked ? "text-[var(--ds-blue-700)]" : "text-[var(--ds-gray-500)]"
          )}
        >
          <Link2 className="w-4 h-4" />
        </button>
        <NumberInput value={value.right} onChange={(v) => handleChange('right', v)} min={min} max={max} />
        
        {/* Bottom */}
        <div className="col-start-2">
          <NumberInput value={value.bottom} onChange={(v) => handleChange('bottom', v)} min={min} max={max} />
        </div>
      </div>
    </div>
  );
};
```


### Component 2: TypographyInput

Compound input for typography properties.

```typescript
// src/features/visual-editor-v3/shared/inputs/TypographyInput.tsx

export interface TypographyInputProps {
  value: TypographyValue;
  onChange: (value: TypographyValue) => void;
  showFontFamily?: boolean;
  showLineHeight?: boolean;
  showLetterSpacing?: boolean;
}

export interface TypographyValue {
  fontFamily?: string;
  fontSize: string;
  fontWeight: string;
  lineHeight?: string;
  letterSpacing?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
}

const fontFamilyOptions = [
  { label: 'Geist Sans', value: 'var(--font-sans)' },
  { label: 'Geist Mono', value: 'var(--font-mono)' },
  { label: 'System UI', value: 'system-ui' },
];

const fontWeightOptions = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
];

const textAlignOptions = [
  { icon: AlignLeft, value: 'left' },
  { icon: AlignCenter, value: 'center' },
  { icon: AlignRight, value: 'right' },
  { icon: AlignJustify, value: 'justify' },
];

export const TypographyInput: React.FC<TypographyInputProps> = ({
  value,
  onChange,
  showFontFamily = true,
  showLineHeight = true,
  showLetterSpacing = false,
}) => {
  return (
    <div className="space-y-3">
      {showFontFamily && (
        <SelectInput
          label="Font Family"
          value={value.fontFamily || 'var(--font-sans)'}
          onChange={(v) => onChange({ ...value, fontFamily: v })}
          options={fontFamilyOptions}
        />
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Size"
          value={parseInt(value.fontSize) || 16}
          onChange={(v) => onChange({ ...value, fontSize: `${v}px` })}
          unit="px"
          min={8}
          max={120}
        />
        <SelectInput
          label="Weight"
          value={value.fontWeight}
          onChange={(v) => onChange({ ...value, fontWeight: v })}
          options={fontWeightOptions}
        />
      </div>
      
      {showLineHeight && (
        <NumberInput
          label="Line Height"
          value={parseFloat(value.lineHeight || '1.5')}
          onChange={(v) => onChange({ ...value, lineHeight: String(v) })}
          step={0.1}
          min={0.5}
          max={3}
        />
      )}
      
      <div className="flex gap-1">
        {textAlignOptions.map(({ icon: Icon, value: alignValue }) => (
          <IconButton
            key={alignValue}
            icon={<Icon className="w-4 h-4" />}
            active={value.textAlign === alignValue}
            onClick={() => onChange({ ...value, textAlign: alignValue })}
            size="sm"
          />
        ))}
      </div>
    </div>
  );
};
```


### Component 3: BorderInput

Compound input for border properties.

```typescript
// src/features/visual-editor-v3/shared/inputs/BorderInput.tsx

export interface BorderInputProps {
  value: BorderValue;
  onChange: (value: BorderValue) => void;
  showRadius?: boolean;
}

export interface BorderValue {
  width: string;
  style: 'none' | 'solid' | 'dashed' | 'dotted';
  color: string;
  radius?: string;
}

const borderStyleOptions = [
  { label: 'None', value: 'none' },
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
];

export const BorderInput: React.FC<BorderInputProps> = ({
  value,
  onChange,
  showRadius = true,
}) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <NumberInput
          label="Width"
          value={parseInt(value.width) || 0}
          onChange={(v) => onChange({ ...value, width: `${v}px` })}
          unit="px"
          min={0}
          max={20}
        />
        <SelectInput
          label="Style"
          value={value.style}
          onChange={(v) => onChange({ ...value, style: v as BorderValue['style'] })}
          options={borderStyleOptions}
        />
      </div>
      
      <ColorPicker
        label="Color"
        value={value.color}
        onChange={(v) => onChange({ ...value, color: v })}
      />
      
      {showRadius && (
        <NumberInput
          label="Radius"
          value={parseInt(value.radius || '0') || 0}
          onChange={(v) => onChange({ ...value, radius: `${v}px` })}
          unit="px"
          min={0}
          max={100}
        />
      )}
    </div>
  );
};
```


### Component 4: ShadowInput

Visual shadow editor with presets and custom values.

```typescript
// src/features/visual-editor-v3/shared/inputs/ShadowInput.tsx

export interface ShadowInputProps {
  value: string;
  onChange: (value: string) => void;
  showCustom?: boolean;
}

const shadowPresets = [
  { label: 'None', value: 'none', preview: 'none' },
  { label: 'Small', value: 'var(--ds-shadow-small)', preview: '0 1px 2px rgba(0,0,0,0.05)' },
  { label: 'Medium', value: 'var(--ds-shadow-medium)', preview: '0 4px 6px rgba(0,0,0,0.1)' },
  { label: 'Large', value: 'var(--ds-shadow-large)', preview: '0 10px 15px rgba(0,0,0,0.1)' },
  { label: 'XL', value: '0 20px 25px -5px rgba(0,0,0,0.1)', preview: '0 20px 25px rgba(0,0,0,0.1)' },
];

export const ShadowInput: React.FC<ShadowInputProps> = ({
  value,
  onChange,
  showCustom = true,
}) => {
  const [isCustom, setIsCustom] = useState(false);
  
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-medium text-[var(--ds-gray-600)] uppercase tracking-wide">
        Shadow
      </label>
      
      {/* Preset Grid */}
      <div className="grid grid-cols-5 gap-1">
        {shadowPresets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onChange(preset.value)}
            className={cn(
              "aspect-square rounded-md border transition-all",
              "flex items-center justify-center",
              value === preset.value 
                ? "border-[var(--ds-blue-700)] ring-2 ring-[var(--ds-blue-200)]"
                : "border-[var(--ds-gray-200)] hover:border-[var(--ds-gray-400)]"
            )}
          >
            <div 
              className="w-6 h-6 bg-white rounded"
              style={{ boxShadow: preset.preview }}
            />
          </button>
        ))}
      </div>
      
      {/* Custom Input */}
      {showCustom && (
        <div className="pt-2">
          <button
            onClick={() => setIsCustom(!isCustom)}
            className="text-[11px] text-[var(--ds-blue-700)] hover:underline"
          >
            {isCustom ? 'Hide custom' : 'Custom shadow…'}
          </button>
          
          {isCustom && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="0 4px 6px rgba(0,0,0,0.1)"
              className={cn(
                "mt-2 w-full h-7 px-2 rounded-md text-xs font-mono",
                "border border-[var(--ds-gray-300)]",
                "focus:border-[var(--ds-gray-900)] focus:ring-2 focus:ring-[var(--ds-gray-200)]"
              )}
            />
          )}
        </div>
      )}
    </div>
  );
};
```


### Component 5: BreakpointSelector

Device/breakpoint selector with override indicators.

```typescript
// src/features/visual-editor-v3/shared/controls/BreakpointSelector.tsx

export interface BreakpointSelectorProps {
  activeBreakpoint: Breakpoint;
  onBreakpointChange: (breakpoint: Breakpoint) => void;
  overrideCounts?: Record<Breakpoint, number>;
  variant?: 'toolbar' | 'panel';
}

const breakpointConfig = [
  { key: 'mobile' as Breakpoint, icon: Smartphone, label: 'Mobile', width: '375px' },
  { key: 'tablet' as Breakpoint, icon: Tablet, label: 'Tablet', width: '768px' },
  { key: 'desktop' as Breakpoint, icon: Monitor, label: 'Desktop', width: '100%' },
];

export const BreakpointSelector: React.FC<BreakpointSelectorProps> = ({
  activeBreakpoint,
  onBreakpointChange,
  overrideCounts = {},
  variant = 'toolbar',
}) => {
  return (
    <div className={cn(
      "flex items-center p-0.5 rounded-md",
      variant === 'toolbar' ? "bg-[var(--ds-gray-100)]" : "bg-[var(--ds-gray-100)]"
    )}>
      {breakpointConfig.map(({ key, icon: Icon, label, width }) => {
        const overrideCount = overrideCounts[key] || 0;
        const isActive = activeBreakpoint === key;
        
        return (
          <Tooltip key={key} content={`${label} (${width})`}>
            <button
              onClick={() => onBreakpointChange(key)}
              className={cn(
                "relative flex items-center justify-center gap-1.5 h-7 px-2 rounded-md",
                "text-[11px] font-medium transition-all duration-100",
                isActive 
                  ? "bg-[var(--ds-background-100)] text-[var(--ds-gray-1000)] shadow-sm" 
                  : "text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-900)]"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {variant === 'panel' && <span>{label}</span>}
              
              {/* Override Badge */}
              {overrideCount > 0 && (
                <span className={cn(
                  "absolute -top-1 -right-1 w-4 h-4 rounded-full",
                  "flex items-center justify-center",
                  "text-[9px] font-semibold text-white",
                  "bg-[var(--ds-blue-600)]"
                )}>
                  {overrideCount}
                </span>
              )}
            </button>
          </Tooltip>
        );
      })}
    </div>
  );
};
```


### Component 6: LayerTreeItem

Recursive layer tree item with drag-and-drop support.

```typescript
// src/features/visual-editor-v3/shared/tree/LayerTreeItem.tsx

export interface LayerTreeItemProps {
  block: EditorBlock;
  depth: number;
  isSelected: boolean;
  isHovered: boolean;
  isExpanded: boolean;
  onSelect: (id: BlockId, multiselect?: boolean) => void;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
  onRename?: (newName: string) => void;
  children?: React.ReactNode;
}

export const LayerTreeItem: React.FC<LayerTreeItemProps> = ({
  block,
  depth,
  isSelected,
  isHovered,
  isExpanded,
  onSelect,
  onToggleExpand,
  onToggleVisibility,
  onDelete,
  onRename,
  children,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const hasChildren = block.children.length > 0;
  const isRoot = block.type === 'page';
  
  const blockIcon = blockIcons[block.type];
  const blockColor = blockTypeAccents[block.type];
  
  return (
    <div className="relative">
      {/* Connector Line */}
      {depth > 0 && (
        <div 
          className="absolute top-0 bottom-0 border-l border-[var(--ds-gray-200)]"
          style={{ left: `${(depth - 1) * 12 + 10}px` }}
        />
      )}

      <div
        className={cn(
          "group relative flex items-center gap-1.5 h-7 pr-2 cursor-pointer",
          "hover:bg-[var(--ds-gray-100)] transition-colors duration-100",
          isSelected && "bg-[var(--ds-blue-100)] hover:bg-[var(--ds-blue-100)]",
          isHovered && !isSelected && "bg-[var(--ds-gray-100)]"
        )}
        style={{ paddingLeft: `${depth * 12 + 4}px` }}
        onClick={(e) => onSelect(block.id, e.shiftKey || e.metaKey)}
        onDoubleClick={() => onRename && setIsRenaming(true)}
      >
        {/* Expand/Collapse */}
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            className="flex items-center justify-center w-4 h-4 rounded-sm hover:bg-[var(--ds-gray-200)]"
          >
            <ChevronRight className={cn(
              "w-3 h-3 text-[var(--ds-gray-600)] transition-transform",
              isExpanded && "rotate-90"
            )} />
          </button>
        ) : (
          <div className="w-4" />
        )}

        {/* Icon */}
        <span className={cn("flex-shrink-0", blockColor)}>
          {blockIcon}
        </span>

        {/* Label */}
        {isRenaming ? (
          <input
            autoFocus
            defaultValue={block.meta?.label || getBlockLabel(block.type)}
            onBlur={(e) => { onRename?.(e.target.value); setIsRenaming(false); }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { onRename?.(e.currentTarget.value); setIsRenaming(false); }
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            className="flex-1 h-5 px-1 text-[13px] bg-white border border-[var(--ds-blue-700)] rounded"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={cn(
            "flex-1 text-[13px] truncate",
            isSelected ? "text-[var(--ds-gray-1000)] font-medium" : "text-[var(--ds-gray-900)]"
          )}>
            {block.meta?.label || getBlockLabel(block.type)}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <IconButton
            icon={block.meta?.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            size="sm"
            onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
          />
          {!isRoot && (
            <IconButton
              icon={<Trash2 className="w-3 h-3 text-[var(--ds-red-700)]" />}
              size="sm"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            />
          )}
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && children}
    </div>
  );
};
```


### Component 7: DraggableBlockCard

Draggable component card for the components panel.

```typescript
// src/features/visual-editor-v3/shared/blocks/DraggableBlockCard.tsx

export interface DraggableBlockCardProps {
  type: BlockType;
  label: string;
  description: string;
  icon: React.ReactNode;
  preview?: React.ReactNode;
  variant?: 'compact' | 'card';
}

export const DraggableBlockCard: React.FC<DraggableBlockCardProps> = ({
  type,
  label,
  description,
  icon,
  preview,
  variant = 'compact',
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-${type}`,
    data: { type: 'new-block', blockType: type },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  if (variant === 'card') {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className={cn(
          "group relative p-3 rounded-lg border border-[var(--ds-gray-200)]",
          "cursor-grab active:cursor-grabbing",
          "hover:border-[var(--ds-gray-300)] hover:shadow-sm",
          "transition-all duration-150",
          isDragging && "opacity-50 shadow-lg"
        )}
      >
        {/* Preview */}
        {preview && (
          <div className="mb-3 p-2 bg-[var(--ds-gray-100)] rounded-md overflow-hidden">
            {preview}
          </div>
        )}
        
        <div className="flex items-start gap-2">
          <div className={cn(
            "flex items-center justify-center w-8 h-8 rounded-md",
            "bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)]"
          )}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-medium text-[var(--ds-gray-900)]">{label}</div>
            <div className="text-[11px] text-[var(--ds-gray-500)] line-clamp-2">{description}</div>
          </div>
        </div>
      </div>
    );
  }

  // Compact variant (list item)
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-2.5 px-2 py-2 rounded-md",
        "cursor-grab active:cursor-grabbing",
        "hover:bg-[var(--ds-gray-100)] transition-colors duration-100",
        isDragging && "opacity-50"
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-8 h-8 rounded-md",
        "bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)]",
        "group-hover:bg-[var(--ds-gray-200)] group-hover:text-[var(--ds-gray-900)]"
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[var(--ds-gray-900)]">{label}</div>
        <div className="text-[11px] text-[var(--ds-gray-500)] truncate">{description}</div>
      </div>
      <GripVertical className="w-3.5 h-3.5 text-[var(--ds-gray-400)] opacity-0 group-hover:opacity-100" />
    </div>
  );
};
```


### Component 8: AITextInput

Text input with AI generation capabilities.

```typescript
// src/features/visual-editor-v3/shared/inputs/AITextInput.tsx

export interface AITextInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  aiPrompt?: string;
  aiContext?: Record<string, unknown>;
  maxLength?: number;
}

export const AITextInput: React.FC<AITextInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  multiline = false,
  aiPrompt = 'Improve this text for an e-commerce context',
  aiContext,
  maxLength,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateCopy(aiPrompt, value, aiContext);
      if (result.success && result.text) {
        onChange(result.text);
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGetSuggestions = async () => {
    setIsGenerating(true);
    try {
      const result = await getSuggestions(value, aiContext);
      if (result.success && result.suggestions) {
        setSuggestions(result.suggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className="flex flex-col gap-1.5 mb-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-[var(--ds-gray-600)] uppercase tracking-wide">
          {label}
        </label>
        <div className="flex items-center gap-1">
          <Tooltip content="Get AI suggestions">
            <button
              onClick={handleGetSuggestions}
              disabled={isGenerating || !value}
              className={cn(
                "flex items-center justify-center w-5 h-5 rounded-md",
                "text-[var(--ds-purple-700)] hover:bg-[var(--ds-purple-100)]",
                "transition-colors duration-100 disabled:opacity-50"
              )}
            >
              <Sparkles className="w-3 h-3" />
            </button>
          </Tooltip>
          <Tooltip content="AI improve">
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className={cn(
                "flex items-center justify-center w-5 h-5 rounded-md",
                "text-[var(--ds-purple-700)] hover:bg-[var(--ds-purple-100)]",
                "transition-colors duration-100 disabled:opacity-50"
              )}
            >
              {isGenerating ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Wand2 className="w-3 h-3" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="relative">
        <InputComponent
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={cn(
            "w-full px-2.5 rounded-md text-[13px]",
            "bg-[var(--ds-background-100)] border border-[var(--ds-gray-300)]",
            "text-[var(--ds-gray-900)] placeholder:text-[var(--ds-gray-500)]",
            "focus:border-[var(--ds-gray-900)] focus:ring-2 focus:ring-[var(--ds-gray-200)]",
            "transition-colors duration-100",
            multiline ? "h-20 py-2 resize-none" : "h-8"
          )}
        />
        
        {maxLength && (
          <span className="absolute right-2 bottom-1 text-[10px] text-[var(--ds-gray-500)]">
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="mt-1 p-2 bg-white border border-[var(--ds-gray-200)] rounded-md shadow-lg">
          <div className="text-[10px] font-medium text-[var(--ds-gray-600)] mb-2">
            AI Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => { onChange(suggestion); setShowSuggestions(false); }}
              className={cn(
                "w-full text-left px-2 py-1.5 rounded text-[12px]",
                "hover:bg-[var(--ds-gray-100)] transition-colors"
              )}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
```


### Component 9: ResizablePanel

Resizable panel with drag handle.

```typescript
// src/features/visual-editor-v3/shared/layout/ResizablePanel.tsx

export interface ResizablePanelProps {
  children: React.ReactNode;
  position: 'left' | 'right';
  defaultWidth: number;
  minWidth?: number;
  maxWidth?: number;
  onResize?: (width: number) => void;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  position,
  defaultWidth,
  minWidth = 200,
  maxWidth = 400,
  onResize,
  collapsible = true,
  collapsed = false,
  onCollapse,
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    
    const startX = e.clientX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = position === 'left' 
        ? e.clientX - startX 
        : startX - e.clientX;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth + delta));
      setWidth(newWidth);
      onResize?.(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (collapsed) {
    return (
      <div className={cn(
        "flex items-center justify-center w-10 h-full",
        "bg-[var(--ds-background-100)] border-[var(--ds-gray-200)]",
        position === 'left' ? 'border-r' : 'border-l'
      )}>
        <button
          onClick={() => onCollapse?.(false)}
          className="p-2 rounded-md hover:bg-[var(--ds-gray-100)]"
        >
          {position === 'left' ? <ChevronRight /> : <ChevronLeft />}
        </button>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className={cn(
        "relative flex flex-col h-full",
        "bg-[var(--ds-background-100)]",
        "border-[var(--ds-gray-200)]",
        position === 'left' ? 'border-r' : 'border-l'
      )}
      style={{ width, flexShrink: 0 }}
    >
      {children}

      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "absolute top-0 bottom-0 w-1 cursor-col-resize",
          "hover:bg-[var(--ds-blue-500)] transition-colors",
          isResizing && "bg-[var(--ds-blue-500)]",
          position === 'left' ? 'right-0' : 'left-0'
        )}
      />

      {/* Collapse Button */}
      {collapsible && (
        <button
          onClick={() => onCollapse?.(true)}
          className={cn(
            "absolute top-2 p-1 rounded-md",
            "text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-900)]",
            "hover:bg-[var(--ds-gray-100)]",
            position === 'left' ? 'right-2' : 'left-2'
          )}
        >
          {position === 'left' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
};
```


### Component 10: BlockSelectionOverlay

Visual overlay for selected blocks with resize handles.

```typescript
// src/features/visual-editor-v3/canvas/BlockSelectionOverlay.tsx

export interface BlockSelectionOverlayProps {
  blockId: BlockId;
  blockType: BlockType;
  blockLabel: string;
  bounds: DOMRect;
  isResizable?: boolean;
  onResize?: (direction: ResizeDirection, delta: { x: number; y: number }) => void;
  onMove?: (delta: { x: number; y: number }) => void;
}

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const resizeHandles: { direction: ResizeDirection; position: string; cursor: string }[] = [
  { direction: 'n', position: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', cursor: 'ns-resize' },
  { direction: 's', position: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', cursor: 'ns-resize' },
  { direction: 'e', position: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2', cursor: 'ew-resize' },
  { direction: 'w', position: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2', cursor: 'ew-resize' },
  { direction: 'ne', position: 'top-0 right-0 translate-x-1/2 -translate-y-1/2', cursor: 'nesw-resize' },
  { direction: 'nw', position: 'top-0 left-0 -translate-x-1/2 -translate-y-1/2', cursor: 'nwse-resize' },
  { direction: 'se', position: 'bottom-0 right-0 translate-x-1/2 translate-y-1/2', cursor: 'nwse-resize' },
  { direction: 'sw', position: 'bottom-0 left-0 -translate-x-1/2 translate-y-1/2', cursor: 'nesw-resize' },
];

export const BlockSelectionOverlay: React.FC<BlockSelectionOverlayProps> = ({
  blockId,
  blockType,
  blockLabel,
  bounds,
  isResizable = true,
  onResize,
  onMove,
}) => {
  const [isResizing, setIsResizing] = useState(false);

  const handleResizeStart = (direction: ResizeDirection, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = { x: e.clientX - startX, y: e.clientY - startY };
      onResize?.(direction, delta);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: bounds.top,
        left: bounds.left,
        width: bounds.width,
        height: bounds.height,
      }}
    >
      {/* Selection Border */}
      <div className="absolute inset-0 border-2 border-[var(--ds-blue-700)] rounded-sm" />

      {/* Block Label */}
      <div
        className={cn(
          "absolute -top-6 left-0 px-1.5 py-0.5 rounded-t-sm",
          "text-[10px] font-medium text-white",
          "bg-[var(--ds-blue-700)]"
        )}
      >
        {blockLabel}
      </div>

      {/* Resize Handles */}
      {isResizable && resizeHandles.map(({ direction, position, cursor }) => (
        <div
          key={direction}
          onMouseDown={(e) => handleResizeStart(direction, e)}
          className={cn(
            "absolute w-2 h-2 rounded-full pointer-events-auto",
            "bg-white border-2 border-[var(--ds-blue-700)]",
            "hover:bg-[var(--ds-blue-100)]",
            position
          )}
          style={{ cursor }}
        />
      ))}

      {/* Dimensions Display */}
      <div
        className={cn(
          "absolute -bottom-6 left-1/2 -translate-x-1/2",
          "px-1.5 py-0.5 rounded text-[10px] font-mono",
          "bg-[var(--ds-gray-900)] text-white"
        )}
      >
        {Math.round(bounds.width)} × {Math.round(bounds.height)}
      </div>
    </div>
  );
};
```


---

## 7. IMPLEMENTATION GUIDELINES

### 7.1 Component Development Checklist

When building new editor components:

- [ ] Use Geist CSS variables for all colors (`var(--ds-*)`)
- [ ] Follow the 4px spacing grid
- [ ] Support both light and dark modes
- [ ] Include proper TypeScript interfaces
- [ ] Add `forwardRef` for DOM access
- [ ] Support keyboard navigation
- [ ] Include ARIA attributes for accessibility
- [ ] Add focus-visible styles
- [ ] Support responsive breakpoints where applicable
- [ ] Include loading/disabled states
- [ ] Write unit tests
- [ ] Create Storybook stories

### 7.2 CSS Class Naming Convention

```tsx
// Use Tailwind with Geist CSS variables
className={cn(
  // Base styles
  "flex items-center gap-2 px-3 py-2 rounded-md",
  
  // Colors via CSS variables
  "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]",
  
  // Interactive states
  "hover:bg-[var(--ds-gray-200)]",
  "focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-700)]",
  
  // Transitions
  "transition-colors duration-150",
  
  // Conditional classes
  isActive && "bg-[var(--ds-blue-100)] text-[var(--ds-blue-900)]",
  isDisabled && "opacity-50 cursor-not-allowed"
)}
```

### 7.3 File Organization

```
src/features/visual-editor-v3/
├── components/
│   ├── blocks/
│   │   ├── defaults/           # Default block implementations
│   │   ├── registry.tsx        # Block registry
│   │   └── types.ts           # Block type definitions
│   ├── EditorLayout.tsx
│   ├── EditorHeader.tsx
│   └── ...
├── shared/
│   ├── controls/              # Buttons, toggles, etc.
│   ├── inputs/                # Form inputs
│   ├── layout/                # Panel components
│   ├── tree/                  # Layer tree components
│   └── index.ts               # Barrel export
├── panels/
│   ├── ComponentsPanel.tsx
│   ├── LayersPanel.tsx
│   ├── PropertiesPanel.tsx
│   └── ...
├── canvas/
│   ├── EditorCanvas.tsx
│   ├── BlockSelectionOverlay.tsx
│   └── ...
├── store/
│   └── useEditorEngine.ts
├── types/
│   ├── editor.ts
│   ├── block-definition.ts
│   └── block-props.ts
├── theming/
│   ├── types.ts
│   ├── ThemeProvider.tsx
│   └── utils.ts
└── utils/
    ├── responsive.ts
    └── ...
```


---

## 8. SUMMARY & RECOMMENDATIONS

### 8.1 Key Strengths of Current Implementation

1. **OKLCH Color System** - Excellent choice for perceptual uniformity
2. **Zod Schema Validation** - Type-safe block content validation
3. **Responsive Breakpoint System** - Well-designed mobile/tablet/desktop support
4. **Zustand + Immer** - Clean state management with undo/redo
5. **Geist Design System** - Consistent with Vercel's design language

### 8.2 Priority Improvements

1. **Enhanced Block Definition Interface** - Add variants, slots, and property field definitions
2. **Compound Input Components** - Build SpacingInput, TypographyInput, BorderInput
3. **AI Integration** - Standardize AI-enhanced inputs across the editor
4. **Theming System** - Implement tenant-specific theming with CSS custom properties
5. **Documentation** - Add Storybook stories and component documentation

### 8.3 Component Priority List

| Priority | Component | Effort | Impact |
|----------|-----------|--------|--------|
| P0 | SpacingInput | Medium | High |
| P0 | TypographyInput | Medium | High |
| P0 | BorderInput | Low | Medium |
| P1 | ShadowInput | Low | Medium |
| P1 | AITextInput | High | High |
| P1 | BreakpointSelector | Low | High |
| P2 | ResizablePanel | Medium | Medium |
| P2 | BlockSelectionOverlay | Medium | High |
| P2 | LayerTreeItem | Medium | Medium |
| P2 | DraggableBlockCard | Low | Low |

### 8.4 Token Additions

Add these token categories to complete the design system:

1. **Editor-specific tokens** - Selection, drop zones, handles
2. **Extended spacing scale** - 0.5, 1.5, 2.5, etc.
3. **Z-index scale** - Standardized layering
4. **Animation tokens** - Editor-specific transitions

---

## Appendix: Quick Reference

### Color Usage

```tsx
// Backgrounds
bg-[var(--ds-background-100)]  // Primary background
bg-[var(--ds-gray-100)]        // Secondary/hover background
bg-[var(--ds-blue-100)]        // Selected state

// Text
text-[var(--ds-gray-1000)]     // Primary text
text-[var(--ds-gray-900)]      // Headings
text-[var(--ds-gray-600)]      // Secondary text
text-[var(--ds-gray-500)]      // Placeholder

// Borders
border-[var(--ds-gray-200)]    // Default border
border-[var(--ds-gray-300)]    // Emphasized border
border-[var(--ds-blue-700)]    // Selection border

// Interactive
hover:bg-[var(--ds-gray-100)]
focus:ring-[var(--ds-blue-700)]
```

### Sizing

```tsx
// Heights
h-7   // 28px - Compact inputs
h-8   // 32px - Small buttons/inputs
h-10  // 40px - Default buttons/inputs
h-12  // 48px - Large buttons

// Icons
w-3 h-3     // 12px - Tiny
w-3.5 h-3.5 // 14px - Small
w-4 h-4     // 16px - Default
w-5 h-5     // 20px - Large
```

### Typography

```tsx
text-[10px]  // Labels, badges
text-[11px]  // Secondary labels
text-[13px]  // Default body
text-sm      // 14px - Buttons
text-base    // 16px - Large text
```

---

*Document generated by Figma Design Systems Engineering Team*
*Based on analysis of Indigo Visual Editor V3*
