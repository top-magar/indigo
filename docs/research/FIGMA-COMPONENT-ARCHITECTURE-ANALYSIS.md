# Figma Component Architecture Analysis for Indigo Visual Editor V3

> **Author**: Figma Design Systems Architect  
> **Date**: January 2025  
> **Version**: 1.0  
> **Status**: Architecture Recommendations

---

## Executive Summary

This document provides a comprehensive analysis of how Figma's component architecture patterns can be applied to enhance the Indigo Visual Editor V3. The analysis covers component variants, property systems, design token integration, and code export mapping—all designed to create a more powerful, scalable, and designer-friendly visual editing experience.

**Key Recommendations**:
1. Implement a **Variant Property System** for blocks with multiple states/sizes
2. Adopt **Slash Naming Convention** for hierarchical block organization
3. Create a **Design Token Bridge** connecting editor blocks to CSS variables
4. Enhance the **Block Registry** with Figma-like component definitions
5. Build **Code Connect** mapping for seamless design-to-code export

---

## Table of Contents

1. [Current State Analysis](#1-current-state-analysis)
2. [Block Component Architecture](#2-block-component-architecture)
3. [Property System Design](#3-property-system-design)
4. [Design Token Integration](#4-design-token-integration)
5. [Block Registry Enhancement](#5-block-registry-enhancement)
6. [Code Export Mapping](#6-code-export-mapping)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. Current State Analysis

### 1.1 Existing Block Structure

The Visual Editor V3 currently uses a normalized block data model:

```typescript
// Current EditorBlock structure
interface EditorBlock {
  id: BlockId;
  type: BlockType;
  parentId: BlockId | null;
  children: BlockId[];
  content: Record<string, any>;      // Block-specific data
  styles: Record<string, any>;       // CSS properties
  responsiveStyles?: ResponsiveStyles;
  meta?: {
    label?: string;
    locked?: boolean;
    hidden?: boolean;
    expanded?: boolean;
  };
}
```

### 1.2 Current Block Registry

The registry uses a class-based manager with Zod schemas:

```typescript
// Current BlockDefinition
interface BlockDefinition<T = any> {
  type: BlockType;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  category: 'layout' | 'content' | 'media' | 'interactive' | 'commerce';
  schema: z.ZodType<T>;
  component: React.ComponentType<any>;
  defaultProps?: Partial<T>;
}
```

### 1.3 Gaps Identified

| Gap | Current State | Figma Pattern |
|-----|---------------|---------------|
| **Variants** | Single component per type | Multiple variants per component |
| **Properties** | Flat content object | Structured property definitions |
| **States** | No state management | Default, hover, pressed, disabled |
| **Naming** | Flat type names | Hierarchical slash naming |
| **Tokens** | Direct CSS values | Token references |
| **Code Mapping** | Basic export | Component-aware code generation |

---

## 2. Block Component Architecture

### 2.1 Figma-Style Variant System

Figma organizes components using **Variant Properties** that define all possible combinations of a component's states and configurations.

#### Proposed Variant Architecture

```typescript
/**
 * Variant Property Definition
 * Defines a single axis of variation (e.g., size, state, color)
 */
interface VariantProperty {
  name: string;                    // Property name (e.g., "Size", "State")
  type: 'enum' | 'boolean';        // Property type
  values?: string[];               // Enum values (e.g., ["sm", "md", "lg"])
  default: string | boolean;       // Default value
  description?: string;            // Documentation
}

/**
 * Variant Definition
 * A specific combination of property values
 */
interface VariantDefinition {
  id: string;                      // Unique variant ID
  properties: Record<string, string | boolean>;  // Property values
  styles: Record<string, any>;     // Variant-specific styles
  content?: Record<string, any>;   // Variant-specific content defaults
}

/**
 * Component Set Definition
 * Groups related variants under a single component
 */
interface ComponentSetDefinition {
  name: string;                    // Component set name (e.g., "Button")
  description?: string;
  properties: VariantProperty[];   // Available properties
  variants: VariantDefinition[];   // All variant combinations
  baseStyles: Record<string, any>; // Shared base styles
  baseContent: Record<string, any>;// Shared content defaults
}
```

#### Button Component Set Example

```typescript
const ButtonComponentSet: ComponentSetDefinition = {
  name: 'Button',
  description: 'Interactive button component with multiple variants',
  properties: [
    {
      name: 'Size',
      type: 'enum',
      values: ['sm', 'md', 'lg'],
      default: 'md',
      description: 'Button size variant'
    },
    {
      name: 'Variant',
      type: 'enum',
      values: ['primary', 'secondary', 'outline', 'ghost', 'destructive'],
      default: 'primary',
      description: 'Visual style variant'
    },
    {
      name: 'State',
      type: 'enum',
      values: ['default', 'hover', 'pressed', 'disabled', 'loading'],
      default: 'default',
      description: 'Interactive state'
    },
    {
      name: 'HasIcon',
      type: 'boolean',
      default: false,
      description: 'Whether button includes an icon'
    }
  ],
  baseStyles: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    fontWeight: '500',
    transition: 'all 150ms ease-out',
    cursor: 'pointer'
  },
  baseContent: {
    label: 'Button'
  },
  variants: [
    // Size variants
    {
      id: 'button/sm',
      properties: { Size: 'sm' },
      styles: { height: '32px', padding: '0 12px', fontSize: '13px', gap: '6px' }
    },
    {
      id: 'button/md',
      properties: { Size: 'md' },
      styles: { height: '40px', padding: '0 16px', fontSize: '14px', gap: '8px' }
    },
    {
      id: 'button/lg',
      properties: { Size: 'lg' },
      styles: { height: '48px', padding: '0 24px', fontSize: '16px', gap: '10px' }
    },
    // Style variants
    {
      id: 'button/primary',
      properties: { Variant: 'primary' },
      styles: {
        backgroundColor: 'var(--ds-gray-1000)',
        color: 'white',
        border: 'none'
      }
    },
    {
      id: 'button/secondary',
      properties: { Variant: 'secondary' },
      styles: {
        backgroundColor: 'var(--ds-gray-100)',
        color: 'var(--ds-gray-900)',
        border: '1px solid var(--ds-gray-300)'
      }
    },
    // ... more variants
  ]
};
```

### 2.2 Slash Naming Convention

Figma uses slash-separated names to create component hierarchies:

```
Button/Primary/Large/Default
Button/Primary/Large/Hover
Button/Secondary/Medium/Default
Card/Product/Horizontal
Card/Product/Vertical
Card/Testimonial/Simple
Card/Testimonial/WithRating
```

#### Implementation in Block Registry

```typescript
/**
 * Block Path represents hierarchical naming
 * e.g., "Button/Primary/Large" → ["Button", "Primary", "Large"]
 */
type BlockPath = string[];

/**
 * Parse slash-separated name into path
 */
function parseBlockPath(name: string): BlockPath {
  return name.split('/').map(s => s.trim());
}

/**
 * Build slash-separated name from path
 */
function buildBlockName(path: BlockPath): string {
  return path.join('/');
}

/**
 * Enhanced Block Type with hierarchical naming
 */
interface HierarchicalBlockType {
  path: BlockPath;           // ["Button", "Primary", "Large"]
  fullName: string;          // "Button/Primary/Large"
  category: string;          // "Button" (root)
  variant: string;           // "Primary"
  modifier?: string;         // "Large"
}


/**
 * Block hierarchy tree for UI display
 */
interface BlockHierarchyNode {
  name: string;
  fullPath: string;
  children: BlockHierarchyNode[];
  definition?: EnhancedBlockDefinition;
}

/**
 * Build hierarchy tree from flat block definitions
 */
function buildBlockHierarchy(
  definitions: EnhancedBlockDefinition[]
): BlockHierarchyNode {
  const root: BlockHierarchyNode = { 
    name: 'Components', 
    fullPath: '', 
    children: [] 
  };
  
  for (const def of definitions) {
    const path = parseBlockPath(def.name);
    let current = root;
    
    for (let i = 0; i < path.length; i++) {
      const segment = path[i];
      const fullPath = path.slice(0, i + 1).join('/');
      
      let child = current.children.find(c => c.name === segment);
      if (!child) {
        child = { name: segment, fullPath, children: [] };
        current.children.push(child);
      }
      
      if (i === path.length - 1) {
        child.definition = def;
      }
      
      current = child;
    }
  }
  
  return root;
}
```

---

## 3. Property System Design

### 3.1 Figma-Style Property Definitions

Figma's property system provides structured, typed configuration for components.

#### Property Types

```typescript
/**
 * Property Type Definitions
 */
type PropertyType = 
  | 'text'           // Free-form text input
  | 'number'         // Numeric value with optional unit
  | 'boolean'        // Toggle switch
  | 'enum'           // Dropdown selection
  | 'color'          // Color picker
  | 'spacing'        // 4-value spacing (padding/margin)
  | 'size'           // Width/height with unit
  | 'image'          // Image URL or upload
  | 'icon'           // Icon selector
  | 'action'         // Click action (URL, function)
  | 'slot'           // Child content slot
  | 'token';         // Design token reference

/**
 * Base Property Definition
 */
interface BasePropertyDefinition {
  name: string;                    // Property key
  label: string;                   // Display label
  type: PropertyType;              // Property type
  description?: string;            // Help text
  required?: boolean;              // Is required
  group?: string;                  // Property group (Content, Layout, Style)
  responsive?: boolean;            // Can have breakpoint overrides
  aiGeneratable?: boolean;         // Can be AI-generated
}

/**
 * Text Property
 */
interface TextPropertyDefinition extends BasePropertyDefinition {
  type: 'text';
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  richText?: boolean;              // Support formatting
}

/**
 * Number Property
 */
interface NumberPropertyDefinition extends BasePropertyDefinition {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
  unit?: string;                   // px, %, rem, etc.
  allowedUnits?: string[];         // Multiple unit options
}

/**
 * Enum Property
 */
interface EnumPropertyDefinition extends BasePropertyDefinition {
  type: 'enum';
  options: Array<{
    value: string;
    label: string;
    icon?: string;
    description?: string;
  }>;
  allowCustom?: boolean;           // Allow custom values
}

/**
 * Color Property
 */
interface ColorPropertyDefinition extends BasePropertyDefinition {
  type: 'color';
  allowOpacity?: boolean;
  presets?: string[];              // Preset color options
  tokenCategory?: string;          // Limit to token category
}

/**
 * Spacing Property (4-value)
 */
interface SpacingPropertyDefinition extends BasePropertyDefinition {
  type: 'spacing';
  linked?: boolean;                // Link all 4 values
  allowNegative?: boolean;
}

/**
 * Token Property
 */
interface TokenPropertyDefinition extends BasePropertyDefinition {
  type: 'token';
  tokenType: 'color' | 'spacing' | 'typography' | 'shadow' | 'radius';
  allowRawValue?: boolean;         // Allow non-token values
}

/**
 * Union of all property definitions
 */
type PropertyDefinition = 
  | TextPropertyDefinition
  | NumberPropertyDefinition
  | EnumPropertyDefinition
  | ColorPropertyDefinition
  | SpacingPropertyDefinition
  | TokenPropertyDefinition
  // ... other types
;
```

### 3.2 Property Groups

Organize properties into logical groups for the Properties Panel:

```typescript
/**
 * Property Group Definition
 */
interface PropertyGroup {
  id: string;
  label: string;
  icon?: React.ComponentType;
  defaultExpanded?: boolean;
  properties: string[];            // Property names in this group
}

/**
 * Standard Property Groups
 */
const STANDARD_PROPERTY_GROUPS: PropertyGroup[] = [
  {
    id: 'content',
    label: 'Content',
    defaultExpanded: true,
    properties: ['text', 'title', 'subtitle', 'label', 'placeholder']
  },
  {
    id: 'layout',
    label: 'Layout',
    defaultExpanded: true,
    properties: ['width', 'height', 'padding', 'margin', 'gap']
  },
  {
    id: 'appearance',
    label: 'Appearance',
    defaultExpanded: true,
    properties: ['backgroundColor', 'color', 'opacity']
  },
  {
    id: 'typography',
    label: 'Typography',
    defaultExpanded: false,
    properties: ['fontSize', 'fontWeight', 'lineHeight', 'textAlign']
  },
  {
    id: 'border',
    label: 'Border',
    defaultExpanded: false,
    properties: ['borderRadius', 'borderWidth', 'borderColor', 'borderStyle']
  },
  {
    id: 'effects',
    label: 'Effects',
    defaultExpanded: false,
    properties: ['boxShadow', 'transform', 'transition']
  },
  {
    id: 'actions',
    label: 'Actions',
    defaultExpanded: false,
    properties: ['onClick', 'href', 'target']
  }
];
```

### 3.3 Property Panel Component

```tsx
/**
 * Enhanced Properties Panel with Figma-style organization
 */
interface PropertiesPanelProps {
  block: EditorBlock;
  definition: EnhancedBlockDefinition;
  activeBreakpoint: Breakpoint;
  onPropertyChange: (property: string, value: any) => void;
  onStyleChange: (property: string, value: any) => void;
}

const EnhancedPropertiesPanel: React.FC<PropertiesPanelProps> = ({
  block,
  definition,
  activeBreakpoint,
  onPropertyChange,
  onStyleChange
}) => {
  // Group properties by their group assignment
  const groupedProperties = useMemo(() => {
    const groups = new Map<string, PropertyDefinition[]>();
    
    for (const prop of definition.properties) {
      const groupId = prop.group || 'other';
      if (!groups.has(groupId)) {
        groups.set(groupId, []);
      }
      groups.get(groupId)!.push(prop);
    }
    
    return groups;
  }, [definition.properties]);

  return (
    <div className="properties-panel">
      {/* Block Header */}
      <BlockHeader 
        name={definition.name}
        icon={definition.icon}
        path={parseBlockPath(definition.name)}
      />
      
      {/* Variant Selector (if component has variants) */}
      {definition.variants && definition.variants.length > 0 && (
        <VariantSelector
          variants={definition.variants}
          currentVariant={block.content._variant}
          onChange={(variant) => onPropertyChange('_variant', variant)}
        />
      )}
      
      {/* Breakpoint Selector */}
      <BreakpointSelector
        activeBreakpoint={activeBreakpoint}
        responsiveStyles={block.responsiveStyles}
      />
      
      {/* Property Groups */}
      {STANDARD_PROPERTY_GROUPS.map(group => {
        const properties = groupedProperties.get(group.id);
        if (!properties || properties.length === 0) return null;
        
        return (
          <PropertySection
            key={group.id}
            title={group.label}
            defaultExpanded={group.defaultExpanded}
          >
            {properties.map(prop => (
              <PropertyField
                key={prop.name}
                definition={prop}
                value={getPropertyValue(block, prop.name)}
                hasOverride={hasBreakpointOverride(
                  block.responsiveStyles, 
                  activeBreakpoint, 
                  prop.name
                )}
                onChange={(value) => {
                  if (prop.group === 'content') {
                    onPropertyChange(prop.name, value);
                  } else {
                    onStyleChange(prop.name, value);
                  }
                }}
              />
            ))}
          </PropertySection>
        );
      })}
    </div>
  );
};
```


---

## 4. Design Token Integration

### 4.1 Token System Architecture

Connect editor blocks to the Geist/OKLCH design token system:

```typescript
/**
 * Design Token Categories
 */
type TokenCategory = 
  | 'color'
  | 'spacing'
  | 'typography'
  | 'shadow'
  | 'radius'
  | 'border'
  | 'animation';

/**
 * Token Definition
 */
interface DesignToken {
  name: string;                    // Token name (e.g., "gray-900")
  category: TokenCategory;
  cssVariable: string;             // CSS variable name
  value: string;                   // Resolved value
  description?: string;
  aliases?: string[];              // Alternative names
}

/**
 * Token Collection
 */
interface TokenCollection {
  name: string;                    // Collection name (e.g., "Geist")
  version: string;
  tokens: Record<TokenCategory, DesignToken[]>;
}

/**
 * Geist Design Token Collection
 */
const GEIST_TOKENS: TokenCollection = {
  name: 'Geist',
  version: '1.0.0',
  tokens: {
    color: [
      // Gray Scale (100-1000)
      { name: 'gray-100', category: 'color', cssVariable: '--ds-gray-100', value: 'oklch(0.97 0 0)' },
      { name: 'gray-200', category: 'color', cssVariable: '--ds-gray-200', value: 'oklch(0.93 0 0)' },
      { name: 'gray-300', category: 'color', cssVariable: '--ds-gray-300', value: 'oklch(0.87 0 0)' },
      { name: 'gray-400', category: 'color', cssVariable: '--ds-gray-400', value: 'oklch(0.70 0 0)' },
      { name: 'gray-500', category: 'color', cssVariable: '--ds-gray-500', value: 'oklch(0.55 0 0)' },
      { name: 'gray-600', category: 'color', cssVariable: '--ds-gray-600', value: 'oklch(0.45 0 0)' },
      { name: 'gray-700', category: 'color', cssVariable: '--ds-gray-700', value: 'oklch(0.35 0 0)' },
      { name: 'gray-800', category: 'color', cssVariable: '--ds-gray-800', value: 'oklch(0.25 0 0)' },
      { name: 'gray-900', category: 'color', cssVariable: '--ds-gray-900', value: 'oklch(0.18 0 0)' },
      { name: 'gray-1000', category: 'color', cssVariable: '--ds-gray-1000', value: 'oklch(0.11 0 0)' },
      
      // Semantic Colors
      { name: 'success', category: 'color', cssVariable: '--ds-green-600', value: 'oklch(0.55 0.15 145)' },
      { name: 'error', category: 'color', cssVariable: '--ds-red-600', value: 'oklch(0.55 0.20 25)' },
      { name: 'warning', category: 'color', cssVariable: '--ds-amber-600', value: 'oklch(0.55 0.15 85)' },
      { name: 'info', category: 'color', cssVariable: '--ds-blue-600', value: 'oklch(0.55 0.15 240)' },
    ],
    spacing: [
      { name: 'spacing-1', category: 'spacing', cssVariable: '--spacing-1', value: '4px' },
      { name: 'spacing-2', category: 'spacing', cssVariable: '--spacing-2', value: '8px' },
      { name: 'spacing-3', category: 'spacing', cssVariable: '--spacing-3', value: '12px' },
      { name: 'spacing-4', category: 'spacing', cssVariable: '--spacing-4', value: '16px' },
      { name: 'spacing-6', category: 'spacing', cssVariable: '--spacing-6', value: '24px' },
      { name: 'spacing-8', category: 'spacing', cssVariable: '--spacing-8', value: '32px' },
      { name: 'spacing-12', category: 'spacing', cssVariable: '--spacing-12', value: '48px' },
      { name: 'spacing-16', category: 'spacing', cssVariable: '--spacing-16', value: '64px' },
    ],
    radius: [
      { name: 'radius-sm', category: 'radius', cssVariable: '--radius-sm', value: '4px' },
      { name: 'radius-md', category: 'radius', cssVariable: '--radius-md', value: '6px' },
      { name: 'radius-lg', category: 'radius', cssVariable: '--radius-lg', value: '8px' },
      { name: 'radius-xl', category: 'radius', cssVariable: '--radius-xl', value: '12px' },
      { name: 'radius-full', category: 'radius', cssVariable: '--radius-full', value: '9999px' },
    ],
    typography: [
      { name: 'text-xs', category: 'typography', cssVariable: '--text-xs', value: '12px' },
      { name: 'text-sm', category: 'typography', cssVariable: '--text-sm', value: '14px' },
      { name: 'text-base', category: 'typography', cssVariable: '--text-base', value: '16px' },
      { name: 'text-lg', category: 'typography', cssVariable: '--text-lg', value: '18px' },
      { name: 'text-xl', category: 'typography', cssVariable: '--text-xl', value: '20px' },
      { name: 'text-2xl', category: 'typography', cssVariable: '--text-2xl', value: '24px' },
    ],
    shadow: [
      { name: 'shadow-sm', category: 'shadow', cssVariable: '--shadow-sm', value: '0 1px 2px rgba(0,0,0,0.05)' },
      { name: 'shadow-md', category: 'shadow', cssVariable: '--shadow-md', value: '0 4px 6px rgba(0,0,0,0.1)' },
      { name: 'shadow-lg', category: 'shadow', cssVariable: '--shadow-lg', value: '0 10px 15px rgba(0,0,0,0.1)' },
    ],
    border: [],
    animation: []
  }
};
```

### 4.2 Token Resolver

```typescript
/**
 * Token Resolver Service
 * Resolves token references to CSS values
 */
class TokenResolver {
  private tokens: Map<string, DesignToken> = new Map();
  
  constructor(collection: TokenCollection) {
    // Index all tokens by name and CSS variable
    for (const category of Object.values(collection.tokens)) {
      for (const token of category) {
        this.tokens.set(token.name, token);
        this.tokens.set(token.cssVariable, token);
      }
    }
  }
  
  /**
   * Resolve a value that may be a token reference
   * @param value - Raw value or token reference
   * @returns Resolved CSS value
   */
  resolve(value: string): string {
    // Check if it's a CSS variable reference
    if (value.startsWith('var(')) {
      const varName = value.match(/var\((--[^)]+)\)/)?.[1];
      if (varName) {
        const token = this.tokens.get(varName);
        return token ? value : value; // Keep var() for CSS
      }
    }
    
    // Check if it's a token name reference
    if (value.startsWith('$')) {
      const tokenName = value.slice(1);
      const token = this.tokens.get(tokenName);
      if (token) {
        return `var(${token.cssVariable})`;
      }
    }
    
    return value;
  }
  
  /**
   * Get token by name
   */
  getToken(name: string): DesignToken | undefined {
    return this.tokens.get(name);
  }
  
  /**
   * Get all tokens in a category
   */
  getTokensByCategory(category: TokenCategory): DesignToken[] {
    return Array.from(this.tokens.values())
      .filter(t => t.category === category);
  }
  
  /**
   * Search tokens by name
   */
  searchTokens(query: string): DesignToken[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.tokens.values())
      .filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery)
      );
  }
}

// Global token resolver instance
export const tokenResolver = new TokenResolver(GEIST_TOKENS);
```

### 4.3 Token-Aware Style Input

```tsx
/**
 * Token-aware color input component
 */
interface TokenColorInputProps {
  value: string;
  onChange: (value: string) => void;
  tokenCategory?: string;
  label?: string;
}

const TokenColorInput: React.FC<TokenColorInputProps> = ({
  value,
  onChange,
  tokenCategory = 'color',
  label
}) => {
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const tokens = tokenResolver.getTokensByCategory(tokenCategory as TokenCategory);
  
  // Check if current value is a token
  const isToken = value.startsWith('var(--ds-');
  const currentToken = isToken 
    ? tokens.find(t => value.includes(t.cssVariable))
    : null;
  
  return (
    <div className="token-color-input">
      {label && <label className="text-[11px] font-medium text-[var(--ds-gray-600)]">{label}</label>}
      
      <div className="flex items-center gap-2">
        {/* Color Preview */}
        <button
          onClick={() => setShowTokenPicker(!showTokenPicker)}
          className="w-8 h-8 rounded-md border border-[var(--ds-gray-300)] overflow-hidden"
          style={{ backgroundColor: isToken ? value : value }}
        >
          {isToken && (
            <div className="w-full h-full flex items-center justify-center bg-[var(--ds-gray-100)]">
              <span className="text-[8px] font-mono">T</span>
            </div>
          )}
        </button>
        
        {/* Value Display */}
        <input
          type="text"
          value={currentToken?.name || value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-8 px-2 text-[13px] rounded-md border border-[var(--ds-gray-300)]"
        />
      </div>
      
      {/* Token Picker Dropdown */}
      {showTokenPicker && (
        <div className="absolute z-50 mt-1 p-2 bg-white rounded-lg border shadow-lg max-h-64 overflow-auto">
          <div className="grid grid-cols-5 gap-1">
            {tokens.map(token => (
              <button
                key={token.name}
                onClick={() => {
                  onChange(`var(${token.cssVariable})`);
                  setShowTokenPicker(false);
                }}
                className="w-8 h-8 rounded-md border hover:ring-2 ring-[var(--ds-blue-500)]"
                style={{ backgroundColor: `var(${token.cssVariable})` }}
                title={token.name}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```


---

## 5. Block Registry Enhancement

### 5.1 Enhanced Block Definition Schema

```typescript
/**
 * Enhanced Block Definition with Figma-style features
 */
interface EnhancedBlockDefinition<T = any> {
  // Identity
  name: string;                    // Slash-separated name (e.g., "Button/Primary")
  type: BlockType;                 // Base type for compatibility
  description?: string;
  
  // Categorization
  category: BlockCategory;
  tags?: string[];                 // Searchable tags
  
  // Visual
  icon?: React.ComponentType<{ className?: string }>;
  thumbnail?: string;              // Preview image URL
  
  // Properties
  properties: PropertyDefinition[];
  propertyGroups?: PropertyGroup[];
  
  // Variants (Figma-style)
  variantProperties?: VariantProperty[];
  variants?: VariantDefinition[];
  
  // Validation
  schema: z.ZodType<T>;
  
  // Rendering
  component: React.ComponentType<any>;
  
  // Defaults
  defaultContent: Record<string, any>;
  defaultStyles: Record<string, any>;
  
  // Constraints
  allowedChildren?: BlockType[];   // Which blocks can be children
  allowedParents?: BlockType[];    // Which blocks can be parents
  maxChildren?: number;
  
  // Code Export
  codeMapping?: CodeMapping;
  
  // AI
  aiPromptHints?: string[];        // Hints for AI generation
}

/**
 * Block Category with subcategories
 */
interface BlockCategory {
  primary: 'layout' | 'content' | 'media' | 'interactive' | 'commerce';
  secondary?: string;              // Subcategory (e.g., "forms", "navigation")
}
```

### 5.2 Enhanced Registry Manager

```typescript
/**
 * Enhanced Block Registry with Figma-style features
 */
class EnhancedBlockRegistry {
  private blocks: Map<string, EnhancedBlockDefinition> = new Map();
  private hierarchy: BlockHierarchyNode | null = null;
  
  /**
   * Register a block definition
   */
  register(definition: EnhancedBlockDefinition): void {
    this.blocks.set(definition.name, definition);
    this.hierarchy = null; // Invalidate cache
  }
  
  /**
   * Register multiple blocks at once
   */
  registerAll(definitions: EnhancedBlockDefinition[]): void {
    for (const def of definitions) {
      this.register(def);
    }
  }
  
  /**
   * Get block by name (supports slash paths)
   */
  get(name: string): EnhancedBlockDefinition | null {
    return this.blocks.get(name) || null;
  }
  
  /**
   * Get block by type (for backward compatibility)
   */
  getByType(type: BlockType): EnhancedBlockDefinition | null {
    for (const def of this.blocks.values()) {
      if (def.type === type) return def;
    }
    return null;
  }
  
  /**
   * Get all blocks in a category
   */
  getByCategory(category: string): EnhancedBlockDefinition[] {
    return Array.from(this.blocks.values())
      .filter(def => def.category.primary === category);
  }
  
  /**
   * Search blocks by name, description, or tags
   */
  search(query: string): EnhancedBlockDefinition[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.blocks.values())
      .filter(def => 
        def.name.toLowerCase().includes(lowerQuery) ||
        def.description?.toLowerCase().includes(lowerQuery) ||
        def.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
  }
  
  /**
   * Get hierarchy tree for UI display
   */
  getHierarchy(): BlockHierarchyNode {
    if (!this.hierarchy) {
      this.hierarchy = buildBlockHierarchy(Array.from(this.blocks.values()));
    }
    return this.hierarchy;
  }
  
  /**
   * Get all variants for a component set
   */
  getVariants(baseName: string): EnhancedBlockDefinition[] {
    return Array.from(this.blocks.values())
      .filter(def => def.name.startsWith(baseName + '/'));
  }
  
  /**
   * Validate block content against schema
   */
  validate(name: string, content: unknown): ValidationResult {
    const def = this.get(name);
    if (!def) {
      return { valid: false, errors: [`Unknown block: ${name}`] };
    }
    
    const result = def.schema.safeParse(content);
    if (!result.success) {
      return {
        valid: false,
        errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
      };
    }
    
    return { valid: true };
  }
  
  /**
   * Create a new block instance with defaults
   */
  createBlock(
    name: string, 
    parentId: BlockId | null,
    overrides?: Partial<EditorBlock>
  ): EditorBlock {
    const def = this.get(name);
    if (!def) {
      throw new Error(`Unknown block: ${name}`);
    }
    
    return {
      id: generateBlockId(),
      type: def.type,
      parentId,
      children: [],
      content: { ...def.defaultContent, ...overrides?.content },
      styles: { ...def.defaultStyles, ...overrides?.styles },
      meta: {
        label: def.name.split('/').pop(),
        ...overrides?.meta
      }
    };
  }
  
  /**
   * Render a block using its registered component
   */
  render(block: EditorBlock, props?: any): React.ReactNode {
    const def = this.getByType(block.type);
    if (!def) {
      return <div className="text-red-500">Unknown block: {block.type}</div>;
    }
    
    const Component = def.component;
    return <Component {...block.content} styles={block.styles} {...props} />;
  }
}

// Export singleton instance
export const ENHANCED_BLOCK_REGISTRY = new EnhancedBlockRegistry();
```

### 5.3 Example Block Definitions

```typescript
/**
 * Button Block Definition with Variants
 */
const ButtonBlockDefinition: EnhancedBlockDefinition = {
  name: 'Button',
  type: 'button',
  description: 'Interactive button with multiple style variants',
  category: { primary: 'interactive' },
  tags: ['button', 'cta', 'action', 'link'],
  icon: MousePointer,
  
  properties: [
    {
      name: 'label',
      label: 'Label',
      type: 'text',
      group: 'content',
      required: true,
      aiGeneratable: true,
      placeholder: 'Button text…'
    },
    {
      name: 'variant',
      label: 'Variant',
      type: 'enum',
      group: 'appearance',
      options: [
        { value: 'primary', label: 'Primary', description: 'Main action button' },
        { value: 'secondary', label: 'Secondary', description: 'Secondary action' },
        { value: 'outline', label: 'Outline', description: 'Bordered button' },
        { value: 'ghost', label: 'Ghost', description: 'Minimal button' },
        { value: 'destructive', label: 'Destructive', description: 'Danger action' }
      ]
    },
    {
      name: 'size',
      label: 'Size',
      type: 'enum',
      group: 'layout',
      options: [
        { value: 'sm', label: 'Small' },
        { value: 'md', label: 'Medium' },
        { value: 'lg', label: 'Large' }
      ]
    },
    {
      name: 'href',
      label: 'Link URL',
      type: 'text',
      group: 'actions',
      placeholder: 'https://…'
    },
    {
      name: 'fullWidth',
      label: 'Full Width',
      type: 'boolean',
      group: 'layout'
    }
  ],
  
  variantProperties: [
    { name: 'Variant', type: 'enum', values: ['primary', 'secondary', 'outline', 'ghost', 'destructive'], default: 'primary' },
    { name: 'Size', type: 'enum', values: ['sm', 'md', 'lg'], default: 'md' }
  ],
  
  schema: ButtonBlockSchema,
  component: ButtonBlock,
  
  defaultContent: {
    label: 'Click me',
    variant: 'primary',
    size: 'md'
  },
  
  defaultStyles: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    fontWeight: '500'
  },
  
  allowedParents: ['section', 'container', 'column', 'form', 'hero'],
  allowedChildren: [],
  
  codeMapping: {
    react: {
      import: "import { Button } from '@/components/ui/button'",
      component: 'Button',
      propsMapping: {
        label: 'children',
        variant: 'variant',
        size: 'size',
        href: 'asChild ? Link href : undefined'
      }
    },
    html: {
      tag: 'button',
      classMapping: {
        variant: {
          primary: 'bg-gray-900 text-white hover:bg-gray-800',
          secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
          outline: 'border border-gray-300 hover:bg-gray-100',
          ghost: 'hover:bg-gray-100',
          destructive: 'bg-red-600 text-white hover:bg-red-700'
        },
        size: {
          sm: 'h-8 px-3 text-sm',
          md: 'h-10 px-4 text-sm',
          lg: 'h-12 px-6 text-base'
        }
      }
    }
  },
  
  aiPromptHints: [
    'Use action-oriented verbs',
    'Keep labels concise (2-4 words)',
    'Match tone to page context'
  ]
};

/**
 * Product Card Block Definition
 */
const ProductCardBlockDefinition: EnhancedBlockDefinition = {
  name: 'Card/Product',
  type: 'product-card',
  description: 'E-commerce product card with image, title, price, and actions',
  category: { primary: 'commerce', secondary: 'cards' },
  tags: ['product', 'card', 'ecommerce', 'shop', 'item'],
  icon: ShoppingBag,
  
  properties: [
    {
      name: 'title',
      label: 'Product Name',
      type: 'text',
      group: 'content',
      required: true,
      aiGeneratable: true
    },
    {
      name: 'price',
      label: 'Price',
      type: 'number',
      group: 'content',
      required: true,
      min: 0,
      step: 0.01
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'enum',
      group: 'content',
      options: [
        { value: '$', label: 'USD ($)' },
        { value: '€', label: 'EUR (€)' },
        { value: '£', label: 'GBP (£)' }
      ]
    },
    {
      name: 'image',
      label: 'Product Image',
      type: 'image',
      group: 'media'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'text',
      group: 'content',
      multiline: true,
      aiGeneratable: true
    },
    {
      name: 'badge',
      label: 'Badge',
      type: 'text',
      group: 'content',
      placeholder: 'New, Sale, etc.'
    }
  ],
  
  schema: ProductCardBlockSchema,
  component: ProductCardBlock,
  
  defaultContent: {
    title: 'Product Name',
    price: 99.99,
    currency: '$',
    description: 'A brief description of this amazing product.'
  },
  
  defaultStyles: {
    width: '100%',
    maxWidth: '320px',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden'
  },
  
  allowedParents: ['section', 'container', 'column', 'product-grid'],
  allowedChildren: [],
  
  codeMapping: {
    react: {
      import: "import { ProductCard } from '@/components/store/ProductCard'",
      component: 'ProductCard',
      propsMapping: {
        title: 'title',
        price: 'price',
        currency: 'currency',
        image: 'imageSrc',
        description: 'description',
        badge: 'badge'
      }
    }
  }
};
```


---

## 6. Code Export Mapping

### 6.1 Code Connect Architecture

Figma's Code Connect maps design components to code implementations. We implement a similar system for the Visual Editor.

```typescript
/**
 * Code Mapping Definition
 * Maps editor blocks to code output
 */
interface CodeMapping {
  react?: ReactCodeMapping;
  html?: HTMLCodeMapping;
  tailwind?: TailwindCodeMapping;
}

/**
 * React Code Mapping
 */
interface ReactCodeMapping {
  import: string;                  // Import statement
  component: string;               // Component name
  propsMapping: Record<string, string | PropTransform>;
  wrappers?: string[];             // Wrapper components
  children?: 'slot' | 'content';   // How to handle children
}

/**
 * HTML Code Mapping
 */
interface HTMLCodeMapping {
  tag: string;                     // HTML tag
  attributes?: Record<string, string | AttrTransform>;
  classMapping?: Record<string, Record<string, string>>;
  dataAttributes?: string[];       // Props to convert to data-* attrs
}

/**
 * Tailwind Code Mapping
 */
interface TailwindCodeMapping {
  baseClasses: string[];
  variantClasses: Record<string, Record<string, string>>;
  responsiveClasses?: Record<Breakpoint, string[]>;
}

/**
 * Property Transform Function
 */
type PropTransform = {
  type: 'direct' | 'conditional' | 'computed';
  transform?: (value: any, block: EditorBlock) => any;
  condition?: (value: any) => boolean;
};

type AttrTransform = PropTransform;
```

### 6.2 Code Generator Service

```typescript
/**
 * Code Generator Service
 * Generates code from editor blocks
 */
class CodeGenerator {
  private registry: EnhancedBlockRegistry;
  private tokenResolver: TokenResolver;
  
  constructor(registry: EnhancedBlockRegistry, tokenResolver: TokenResolver) {
    this.registry = registry;
    this.tokenResolver = tokenResolver;
  }
  
  /**
   * Generate React code from blocks
   */
  generateReact(blocks: BlockMap, rootId: BlockId): GeneratedCode {
    const imports = new Set<string>();
    const components: string[] = [];
    
    const generateBlock = (blockId: BlockId, indent: number = 0): string => {
      const block = blocks[blockId];
      if (!block) return '';
      
      const def = this.registry.getByType(block.type);
      if (!def?.codeMapping?.react) {
        return this.generateGenericReact(block, indent);
      }
      
      const mapping = def.codeMapping.react;
      imports.add(mapping.import);
      
      // Build props
      const props = this.buildReactProps(block, mapping);
      const propsString = this.formatProps(props);
      
      // Build children
      const childrenCode = block.children
        .map(childId => generateBlock(childId, indent + 2))
        .join('\n');
      
      const indentStr = ' '.repeat(indent);
      
      if (childrenCode) {
        return `${indentStr}<${mapping.component}${propsString}>\n${childrenCode}\n${indentStr}</${mapping.component}>`;
      } else if (mapping.children === 'content' && block.content.text) {
        return `${indentStr}<${mapping.component}${propsString}>${block.content.text}</${mapping.component}>`;
      } else {
        return `${indentStr}<${mapping.component}${propsString} />`;
      }
    };
    
    const code = generateBlock(rootId);
    
    return {
      language: 'tsx',
      imports: Array.from(imports).join('\n'),
      code,
      fullCode: `${Array.from(imports).join('\n')}\n\nexport default function Page() {\n  return (\n${code}\n  );\n}`
    };
  }
  
  /**
   * Generate HTML code from blocks
   */
  generateHTML(blocks: BlockMap, rootId: BlockId): GeneratedCode {
    const generateBlock = (blockId: BlockId, indent: number = 0): string => {
      const block = blocks[blockId];
      if (!block) return '';
      
      const def = this.registry.getByType(block.type);
      const mapping = def?.codeMapping?.html;
      
      const tag = mapping?.tag || this.inferHTMLTag(block.type);
      const classes = this.buildHTMLClasses(block, mapping);
      const styles = this.buildInlineStyles(block);
      const attrs = this.buildHTMLAttributes(block, mapping);
      
      const indentStr = ' '.repeat(indent);
      const classAttr = classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
      const styleAttr = styles ? ` style="${styles}"` : '';
      const attrsStr = attrs ? ` ${attrs}` : '';
      
      // Build children
      const childrenCode = block.children
        .map(childId => generateBlock(childId, indent + 2))
        .join('\n');
      
      // Handle text content
      const textContent = block.content.text || block.content.label || '';
      
      if (childrenCode) {
        return `${indentStr}<${tag}${classAttr}${styleAttr}${attrsStr}>\n${childrenCode}\n${indentStr}</${tag}>`;
      } else if (textContent) {
        return `${indentStr}<${tag}${classAttr}${styleAttr}${attrsStr}>${textContent}</${tag}>`;
      } else {
        return `${indentStr}<${tag}${classAttr}${styleAttr}${attrsStr}></${tag}>`;
      }
    };
    
    const code = generateBlock(rootId);
    
    return {
      language: 'html',
      code,
      fullCode: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Page</title>\n</head>\n<body>\n${code}\n</body>\n</html>`
    };
  }
  
  /**
   * Generate Tailwind CSS classes from styles
   */
  generateTailwindClasses(styles: Record<string, any>): string[] {
    const classes: string[] = [];
    
    // Map CSS properties to Tailwind classes
    const mappings: Record<string, (value: string) => string | null> = {
      display: (v) => v === 'flex' ? 'flex' : v === 'grid' ? 'grid' : null,
      flexDirection: (v) => v === 'column' ? 'flex-col' : v === 'row' ? 'flex-row' : null,
      justifyContent: (v) => {
        const map: Record<string, string> = {
          'flex-start': 'justify-start',
          'center': 'justify-center',
          'flex-end': 'justify-end',
          'space-between': 'justify-between',
          'space-evenly': 'justify-evenly'
        };
        return map[v] || null;
      },
      alignItems: (v) => {
        const map: Record<string, string> = {
          'flex-start': 'items-start',
          'center': 'items-center',
          'flex-end': 'items-end',
          'stretch': 'items-stretch'
        };
        return map[v] || null;
      },
      gap: (v) => this.spacingToTailwind(v, 'gap'),
      padding: (v) => this.spacingToTailwind(v, 'p'),
      margin: (v) => this.spacingToTailwind(v, 'm'),
      width: (v) => v === '100%' ? 'w-full' : v === 'auto' ? 'w-auto' : null,
      height: (v) => v === '100%' ? 'h-full' : v === 'auto' ? 'h-auto' : null,
      borderRadius: (v) => this.radiusToTailwind(v),
      fontSize: (v) => this.fontSizeToTailwind(v),
      fontWeight: (v) => this.fontWeightToTailwind(v),
      textAlign: (v) => `text-${v}`,
    };
    
    for (const [prop, value] of Object.entries(styles)) {
      if (value && mappings[prop]) {
        const tailwindClass = mappings[prop](value);
        if (tailwindClass) {
          classes.push(tailwindClass);
        }
      }
    }
    
    return classes;
  }
  
  // Helper methods
  private buildReactProps(block: EditorBlock, mapping: ReactCodeMapping): Record<string, any> {
    const props: Record<string, any> = {};
    
    for (const [contentKey, propKey] of Object.entries(mapping.propsMapping)) {
      const value = block.content[contentKey];
      if (value !== undefined) {
        if (typeof propKey === 'string') {
          props[propKey] = value;
        } else {
          // Handle transform
          props[contentKey] = propKey.transform?.(value, block) ?? value;
        }
      }
    }
    
    // Add className from styles
    const tailwindClasses = this.generateTailwindClasses(block.styles);
    if (tailwindClasses.length > 0) {
      props.className = tailwindClasses.join(' ');
    }
    
    return props;
  }
  
  private formatProps(props: Record<string, any>): string {
    const entries = Object.entries(props);
    if (entries.length === 0) return '';
    
    return ' ' + entries
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : '';
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .filter(Boolean)
      .join(' ');
  }
  
  private inferHTMLTag(type: BlockType): string {
    const tagMap: Record<string, string> = {
      'page': 'div',
      'section': 'section',
      'container': 'div',
      'column': 'div',
      'text': 'p',
      'button': 'button',
      'image': 'img',
      'hero': 'section',
      'form': 'form',
      'input': 'input'
    };
    return tagMap[type] || 'div';
  }
  
  private buildHTMLClasses(block: EditorBlock, mapping?: HTMLCodeMapping): string[] {
    const classes: string[] = [];
    
    // Add variant classes from mapping
    if (mapping?.classMapping) {
      for (const [prop, variants] of Object.entries(mapping.classMapping)) {
        const value = block.content[prop];
        if (value && variants[value]) {
          classes.push(...variants[value].split(' '));
        }
      }
    }
    
    // Add Tailwind classes from styles
    classes.push(...this.generateTailwindClasses(block.styles));
    
    return classes;
  }
  
  private buildInlineStyles(block: EditorBlock): string {
    // Only include styles that can't be converted to Tailwind
    const unconvertedStyles: string[] = [];
    
    for (const [prop, value] of Object.entries(block.styles)) {
      // Check if this is a token reference
      if (typeof value === 'string' && value.startsWith('var(')) {
        const cssProp = this.camelToKebab(prop);
        unconvertedStyles.push(`${cssProp}: ${value}`);
      }
    }
    
    return unconvertedStyles.join('; ');
  }
  
  private buildHTMLAttributes(block: EditorBlock, mapping?: HTMLCodeMapping): string {
    const attrs: string[] = [];
    
    // Add data attributes
    if (mapping?.dataAttributes) {
      for (const prop of mapping.dataAttributes) {
        const value = block.content[prop];
        if (value !== undefined) {
          attrs.push(`data-${prop}="${value}"`);
        }
      }
    }
    
    // Add specific attributes based on block type
    if (block.type === 'image' && block.content.src) {
      attrs.push(`src="${block.content.src}"`);
      attrs.push(`alt="${block.content.alt || ''}"`);
    }
    
    if (block.type === 'button' && block.content.href) {
      // Convert to anchor
      attrs.push(`href="${block.content.href}"`);
    }
    
    return attrs.join(' ');
  }
  
  private spacingToTailwind(value: string, prefix: string): string | null {
    const pxMatch = value.match(/^(\d+)px$/);
    if (pxMatch) {
      const px = parseInt(pxMatch[1]);
      const scale = Math.round(px / 4);
      return `${prefix}-${scale}`;
    }
    return null;
  }
  
  private radiusToTailwind(value: string): string | null {
    const map: Record<string, string> = {
      '4px': 'rounded-sm',
      '6px': 'rounded-md',
      '8px': 'rounded-lg',
      '12px': 'rounded-xl',
      '9999px': 'rounded-full'
    };
    return map[value] || null;
  }
  
  private fontSizeToTailwind(value: string): string | null {
    const map: Record<string, string> = {
      '12px': 'text-xs',
      '14px': 'text-sm',
      '16px': 'text-base',
      '18px': 'text-lg',
      '20px': 'text-xl',
      '24px': 'text-2xl'
    };
    return map[value] || null;
  }
  
  private fontWeightToTailwind(value: string): string | null {
    const map: Record<string, string> = {
      '300': 'font-light',
      '400': 'font-normal',
      '500': 'font-medium',
      '600': 'font-semibold',
      '700': 'font-bold'
    };
    return map[value] || null;
  }
  
  private camelToKebab(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}

/**
 * Generated Code Output
 */
interface GeneratedCode {
  language: 'tsx' | 'html' | 'css';
  imports?: string;
  code: string;
  fullCode: string;
}

// Export singleton
export const codeGenerator = new CodeGenerator(ENHANCED_BLOCK_REGISTRY, tokenResolver);
```


---

## 7. Implementation Roadmap

### 7.1 Phase 1: Foundation (Week 1-2)

**Goal**: Establish the enhanced type system and registry structure.

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Define `EnhancedBlockDefinition` interface | High | 2h | None |
| Create `PropertyDefinition` types | High | 3h | None |
| Implement `EnhancedBlockRegistry` class | High | 4h | Types |
| Migrate existing blocks to new schema | High | 6h | Registry |
| Add Zod schemas for new property types | Medium | 3h | Types |

**Deliverables**:
- `src/features/visual-editor-v3/types/enhanced-block.ts`
- `src/features/visual-editor-v3/registry/enhanced-registry.ts`
- Updated block definitions in `registry.tsx`

### 7.2 Phase 2: Property System (Week 2-3)

**Goal**: Implement Figma-style property panel with groups and types.

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Create property input components | High | 6h | Types |
| Implement property groups | High | 3h | Inputs |
| Add token-aware color picker | Medium | 4h | Tokens |
| Build spacing input (4-value) | Medium | 2h | Inputs |
| Add responsive property indicators | High | 3h | Inputs |

**Deliverables**:
- `src/features/visual-editor-v3/shared/inputs/PropertyInput.tsx`
- `src/features/visual-editor-v3/shared/inputs/TokenColorInput.tsx`
- `src/features/visual-editor-v3/shared/inputs/SpacingInput.tsx`
- Enhanced `PropertiesPanel.tsx`

### 7.3 Phase 3: Variant System (Week 3-4)

**Goal**: Implement component variants like Figma.

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Define variant property types | High | 2h | Types |
| Create variant selector UI | High | 4h | Registry |
| Implement variant style merging | High | 3h | Store |
| Add variant preview in components panel | Medium | 3h | UI |
| Build variant documentation | Low | 2h | All |

**Deliverables**:
- `src/features/visual-editor-v3/components/VariantSelector.tsx`
- Variant-aware block rendering
- Updated ComponentsPanel with variant previews

### 7.4 Phase 4: Design Tokens (Week 4-5)

**Goal**: Full design token integration.

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Define token collection schema | High | 2h | None |
| Create Geist token collection | High | 4h | Schema |
| Implement TokenResolver service | High | 3h | Collection |
| Build token picker UI | Medium | 4h | Resolver |
| Add token documentation panel | Low | 3h | UI |

**Deliverables**:
- `src/features/visual-editor-v3/tokens/geist-tokens.ts`
- `src/features/visual-editor-v3/tokens/token-resolver.ts`
- `src/features/visual-editor-v3/shared/inputs/TokenPicker.tsx`

### 7.5 Phase 5: Code Export (Week 5-6)

**Goal**: Implement code generation with component mapping.

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Define CodeMapping interface | High | 2h | Types |
| Implement React code generator | High | 6h | Mapping |
| Implement HTML code generator | High | 4h | Mapping |
| Add Tailwind class generation | Medium | 4h | Generator |
| Build export dialog UI | Medium | 3h | Generators |
| Add copy-to-clipboard | Low | 1h | Dialog |

**Deliverables**:
- `src/features/visual-editor-v3/export/code-generator.ts`
- `src/features/visual-editor-v3/export/react-generator.ts`
- `src/features/visual-editor-v3/export/html-generator.ts`
- Enhanced `ExportDialog.tsx`

### 7.6 Phase 6: Polish & Documentation (Week 6-7)

**Goal**: Final polish and comprehensive documentation.

| Task | Priority | Effort | Dependencies |
|------|----------|--------|--------------|
| Add slash naming to all blocks | Medium | 3h | Registry |
| Build component hierarchy UI | Medium | 4h | Naming |
| Create block documentation | Medium | 4h | All |
| Add AI prompt hints | Low | 2h | Blocks |
| Write developer documentation | Medium | 4h | All |
| Performance optimization | High | 4h | All |

**Deliverables**:
- Complete block documentation
- Developer guide for adding new blocks
- Performance benchmarks

---

## 8. Summary

### Key Architectural Decisions

1. **Variant System**: Adopt Figma's variant property model for blocks with multiple states/sizes
2. **Slash Naming**: Use hierarchical naming for better organization and discoverability
3. **Property Types**: Implement strongly-typed property definitions with validation
4. **Token Integration**: Connect all style values to the Geist design token system
5. **Code Mapping**: Enable seamless export to React/HTML with component awareness

### Benefits

| Benefit | Impact |
|---------|--------|
| **Designer Familiarity** | Figma users will recognize patterns |
| **Scalability** | Easy to add new blocks and variants |
| **Consistency** | Token system ensures design consistency |
| **Code Quality** | Generated code follows best practices |
| **AI Integration** | Property hints improve AI generation |

### Migration Path

The enhanced architecture is designed to be backward-compatible:

1. Existing `BlockDefinition` can be wrapped in `EnhancedBlockDefinition`
2. Current blocks continue to work during migration
3. New features can be adopted incrementally
4. No breaking changes to the editor store

---

## Appendix A: Type Definitions Summary

```typescript
// Core Types
type BlockPath = string[];
type PropertyType = 'text' | 'number' | 'boolean' | 'enum' | 'color' | 'spacing' | 'size' | 'image' | 'icon' | 'action' | 'slot' | 'token';
type TokenCategory = 'color' | 'spacing' | 'typography' | 'shadow' | 'radius' | 'border' | 'animation';

// Main Interfaces
interface EnhancedBlockDefinition<T = any> { /* ... */ }
interface PropertyDefinition { /* ... */ }
interface VariantProperty { /* ... */ }
interface VariantDefinition { /* ... */ }
interface ComponentSetDefinition { /* ... */ }
interface DesignToken { /* ... */ }
interface TokenCollection { /* ... */ }
interface CodeMapping { /* ... */ }
interface GeneratedCode { /* ... */ }

// Services
class EnhancedBlockRegistry { /* ... */ }
class TokenResolver { /* ... */ }
class CodeGenerator { /* ... */ }
```

---

## Appendix B: References

- [Figma Component Properties](https://help.figma.com/hc/en-us/articles/5579474826519-Create-and-use-component-properties)
- [Figma Variants](https://help.figma.com/hc/en-us/articles/360056440594-Create-and-use-variants)
- [Figma Code Connect](https://www.figma.com/developers/api#code-connect)
- [Vercel Geist Design System](https://vercel.com/geist/introduction)
- [OKLCH Color Space](https://oklch.com/)

---

*Document created by Figma Design Systems Architect for Indigo Visual Editor V3*
