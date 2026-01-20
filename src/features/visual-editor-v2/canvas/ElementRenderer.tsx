'use client';

/**
 * Visual Editor V2 - Element Renderer
 *
 * Recursively renders elements from the element tree with:
 * - Support for all element types (frame, text, image, button, link, icon, divider, component)
 * - Responsive breakpoint styles
 * - Hover and selection states
 * - DndKit draggable support
 */

import React, { useMemo, useCallback, CSSProperties } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import * as LucideIcons from 'lucide-react';
import { useEditorStoreV2 } from '../store/editor-store';
import type {
  VisualElement,
  Breakpoint,
  LayoutConfig,
  PositionConfig,
  SizeConfig,
  StyleConfig,
  SizeValue,
  TextContent,
  ImageContent,
  LinkContent,
  IconContent,
} from '../types/element';

// ============================================================================
// TYPES
// ============================================================================

export interface ElementRendererProps {
  elementId: string;
  elements: Record<string, VisualElement>;
  isRoot?: boolean;
}

interface ComputedStyles {
  layout: LayoutConfig;
  position: PositionConfig;
  size: SizeConfig;
  styles: StyleConfig;
  hidden: boolean;
}

// ============================================================================
// STYLE COMPUTATION UTILITIES
// ============================================================================

/**
 * Merges base element properties with breakpoint overrides
 */
function getComputedStyles(
  element: VisualElement,
  activeBreakpoint: Breakpoint
): ComputedStyles {
  const override = element.breakpointOverrides[activeBreakpoint];

  return {
    layout: override?.layout
      ? { ...element.layout, ...override.layout }
      : element.layout,
    position: override?.position
      ? { ...element.position, ...override.position }
      : element.position,
    size: override?.size
      ? { ...element.size, ...override.size }
      : element.size,
    styles: override?.styles
      ? { ...element.styles, ...override.styles }
      : element.styles,
    hidden: override?.hidden ?? element.hidden,
  };
}

/**
 * Converts SizeValue to CSS value
 */
function sizeValueToCSS(value: SizeValue): string | number {
  if (typeof value === 'number') return value;
  switch (value) {
    case 'auto':
      return 'auto';
    case 'fill':
      return '100%';
    case 'hug':
      return 'fit-content';
    default:
      return 'auto';
  }
}

/**
 * Converts spacing array to CSS value
 */
function spacingToCSS(
  value: number | [number, number, number, number] | undefined
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return value.map((v) => `${v}px`).join(' ');
}

/**
 * Converts border radius to CSS value
 */
function borderRadiusToCSS(
  value: number | [number, number, number, number] | undefined
): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return `${value}px`;
  return value.map((v) => `${v}px`).join(' ');
}

/**
 * Converts layout config to CSS properties
 */
function layoutToCSS(layout: LayoutConfig): CSSProperties {
  const styles: CSSProperties = {
    display: layout.display,
  };

  if (layout.display === 'flex' || layout.display === 'inline-flex') {
    styles.flexDirection = layout.flexDirection;
    styles.flexWrap = layout.flexWrap;
    styles.gap = layout.gap !== undefined ? `${layout.gap}px` : undefined;
    styles.rowGap = layout.rowGap !== undefined ? `${layout.rowGap}px` : undefined;
    styles.columnGap =
      layout.columnGap !== undefined ? `${layout.columnGap}px` : undefined;

    // Justify content mapping
    if (layout.justifyContent) {
      const justifyMap: Record<string, string> = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        between: 'space-between',
        around: 'space-around',
        evenly: 'space-evenly',
      };
      styles.justifyContent = justifyMap[layout.justifyContent] || layout.justifyContent;
    }

    // Align items mapping
    if (layout.alignItems) {
      const alignMap: Record<string, string> = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        stretch: 'stretch',
        baseline: 'baseline',
      };
      styles.alignItems = alignMap[layout.alignItems] || layout.alignItems;
    }

    // Align content mapping
    if (layout.alignContent) {
      const alignContentMap: Record<string, string> = {
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        between: 'space-between',
        around: 'space-around',
        stretch: 'stretch',
      };
      styles.alignContent = alignContentMap[layout.alignContent] || layout.alignContent;
    }

    // Child flex properties
    if (layout.flexGrow !== undefined) styles.flexGrow = layout.flexGrow;
    if (layout.flexShrink !== undefined) styles.flexShrink = layout.flexShrink;
    if (layout.flexBasis !== undefined) {
      styles.flexBasis =
        typeof layout.flexBasis === 'number'
          ? `${layout.flexBasis}px`
          : layout.flexBasis;
    }
    if (layout.alignSelf) {
      const alignSelfMap: Record<string, string> = {
        auto: 'auto',
        start: 'flex-start',
        center: 'center',
        end: 'flex-end',
        stretch: 'stretch',
        baseline: 'baseline',
      };
      styles.alignSelf = alignSelfMap[layout.alignSelf] || layout.alignSelf;
    }
  }

  if (layout.display === 'grid') {
    styles.gridTemplateColumns = layout.gridTemplateColumns;
    styles.gridTemplateRows = layout.gridTemplateRows;
    styles.gridAutoFlow = layout.gridAutoFlow;
    styles.gridAutoColumns = layout.gridAutoColumns;
    styles.gridAutoRows = layout.gridAutoRows;
    styles.gap = layout.gap !== undefined ? `${layout.gap}px` : undefined;
    styles.rowGap = layout.rowGap !== undefined ? `${layout.rowGap}px` : undefined;
    styles.columnGap =
      layout.columnGap !== undefined ? `${layout.columnGap}px` : undefined;

    // Child grid properties
    if (layout.gridColumn) styles.gridColumn = layout.gridColumn;
    if (layout.gridRow) styles.gridRow = layout.gridRow;
  }

  return styles;
}

/**
 * Converts position config to CSS properties
 */
function positionToCSS(position: PositionConfig): CSSProperties {
  const styles: CSSProperties = {
    position: position.type,
  };

  if (position.type !== 'relative') {
    if (position.top !== undefined && position.top !== 'auto') {
      styles.top = `${position.top}px`;
    } else if (position.top === 'auto') {
      styles.top = 'auto';
    }

    if (position.right !== undefined && position.right !== 'auto') {
      styles.right = `${position.right}px`;
    } else if (position.right === 'auto') {
      styles.right = 'auto';
    }

    if (position.bottom !== undefined && position.bottom !== 'auto') {
      styles.bottom = `${position.bottom}px`;
    } else if (position.bottom === 'auto') {
      styles.bottom = 'auto';
    }

    if (position.left !== undefined && position.left !== 'auto') {
      styles.left = `${position.left}px`;
    } else if (position.left === 'auto') {
      styles.left = 'auto';
    }
  }

  if (position.zIndex !== undefined) {
    styles.zIndex = position.zIndex;
  }

  return styles;
}

/**
 * Converts size config to CSS properties
 */
function sizeToCSS(size: SizeConfig): CSSProperties {
  const styles: CSSProperties = {
    width: sizeValueToCSS(size.width),
    height: sizeValueToCSS(size.height),
  };

  if (size.minWidth !== undefined) styles.minWidth = `${size.minWidth}px`;
  if (size.maxWidth !== undefined) styles.maxWidth = `${size.maxWidth}px`;
  if (size.minHeight !== undefined) styles.minHeight = `${size.minHeight}px`;
  if (size.maxHeight !== undefined) styles.maxHeight = `${size.maxHeight}px`;
  if (size.aspectRatio !== undefined) styles.aspectRatio = size.aspectRatio;

  return styles;
}

/**
 * Converts style config to CSS properties
 */
function styleToCSS(style: StyleConfig): CSSProperties {
  const css: CSSProperties = {};

  // Background
  if (style.background) {
    if (style.background.type === 'solid' && style.background.color) {
      css.backgroundColor = style.background.color;
    } else if (style.background.type === 'gradient' && style.background.gradient) {
      const { gradient } = style.background;
      const stops = gradient.stops
        .map((s) => `${s.color} ${s.position * 100}%`)
        .join(', ');
      if (gradient.type === 'linear') {
        css.background = `linear-gradient(${gradient.angle || 0}deg, ${stops})`;
      } else {
        css.background = `radial-gradient(circle, ${stops})`;
      }
    } else if (style.background.type === 'image' && style.background.image) {
      const { image } = style.background;
      css.backgroundImage = `url(${image.url})`;
      css.backgroundSize = image.size;
      css.backgroundPosition = image.position;
      css.backgroundRepeat = image.repeat;
    }
  }

  // Border
  if (style.border) {
    css.borderWidth = `${style.border.width}px`;
    css.borderStyle = style.border.style;
    css.borderColor = style.border.color;
  }

  // Individual borders
  if (style.borderTop) {
    css.borderTopWidth = `${style.borderTop.width}px`;
    css.borderTopStyle = style.borderTop.style;
    css.borderTopColor = style.borderTop.color;
  }
  if (style.borderRight) {
    css.borderRightWidth = `${style.borderRight.width}px`;
    css.borderRightStyle = style.borderRight.style;
    css.borderRightColor = style.borderRight.color;
  }
  if (style.borderBottom) {
    css.borderBottomWidth = `${style.borderBottom.width}px`;
    css.borderBottomStyle = style.borderBottom.style;
    css.borderBottomColor = style.borderBottom.color;
  }
  if (style.borderLeft) {
    css.borderLeftWidth = `${style.borderLeft.width}px`;
    css.borderLeftStyle = style.borderLeft.style;
    css.borderLeftColor = style.borderLeft.color;
  }

  // Border radius
  css.borderRadius = borderRadiusToCSS(style.borderRadius);

  // Box shadow
  if (style.boxShadow && style.boxShadow.length > 0) {
    css.boxShadow = style.boxShadow
      .map((shadow) => {
        const inset = shadow.type === 'inner' ? 'inset ' : '';
        return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
      })
      .join(', ');
  }

  // Typography
  if (style.typography) {
    const { typography } = style;
    if (typography.fontFamily) css.fontFamily = typography.fontFamily;
    if (typography.fontSize) css.fontSize = `${typography.fontSize}px`;
    if (typography.fontWeight) css.fontWeight = typography.fontWeight;
    if (typography.lineHeight) css.lineHeight = typography.lineHeight;
    if (typography.letterSpacing) css.letterSpacing = `${typography.letterSpacing}px`;
    if (typography.textAlign) css.textAlign = typography.textAlign;
    if (typography.textDecoration) css.textDecoration = typography.textDecoration;
    if (typography.textTransform) css.textTransform = typography.textTransform;
    if (typography.color) css.color = typography.color;
  }

  // Effects
  if (style.opacity !== undefined) css.opacity = style.opacity;
  if (style.blur !== undefined) css.filter = `blur(${style.blur}px)`;

  // Spacing
  css.padding = spacingToCSS(style.padding);
  css.margin = spacingToCSS(style.margin);

  // Overflow
  if (style.overflow) css.overflow = style.overflow;
  if (style.overflowX) css.overflowX = style.overflowX;
  if (style.overflowY) css.overflowY = style.overflowY;

  // Cursor
  if (style.cursor) css.cursor = style.cursor;

  // Transitions
  if (style.transitions && style.transitions.length > 0) {
    css.transition = style.transitions
      .map(
        (t) =>
          `${t.property} ${t.duration}ms ${t.easing}${t.delay ? ` ${t.delay}ms` : ''}`
      )
      .join(', ');
  }

  return css;
}

// ============================================================================
// DRAGGABLE WRAPPER
// ============================================================================

interface DraggableElementProps {
  elementId: string;
  isLocked: boolean;
  isSelected: boolean;
  isHovered: boolean;
  children: React.ReactNode;
  style: CSSProperties;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function DraggableElement({
  elementId,
  isLocked,
  isSelected,
  isHovered,
  children,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: DraggableElementProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: elementId,
    disabled: isLocked,
  });

  const dragStyle: CSSProperties = {
    ...style,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : style.opacity,
    outline: isSelected
      ? '2px solid var(--ds-blue-500)'
      : isHovered
        ? '1px solid var(--ds-blue-300)'
        : 'none',
    outlineOffset: '0px',
    cursor: isLocked ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={dragStyle}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-element-id={elementId}
      data-selected={isSelected}
      data-hovered={isHovered}
      data-dragging={isDragging}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ELEMENT TYPE RENDERERS
// ============================================================================

interface ElementContentProps {
  element: VisualElement;
  computedStyles: ComputedStyles;
  elements: Record<string, VisualElement>;
}

/**
 * Renders frame element (container)
 */
function FrameContent({ element, elements }: ElementContentProps) {
  return (
    <>
      {element.children.map((childId) => (
        <ElementRenderer key={childId} elementId={childId} elements={elements} />
      ))}
    </>
  );
}

/**
 * Renders text element
 */
function TextContent({ element }: ElementContentProps) {
  const content = element.content as TextContent | undefined;
  if (!content || content.type !== 'text') return null;

  if (content.richText) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: content.text }}
        className="visual-editor-text"
      />
    );
  }

  return <span className="visual-editor-text">{content.text}</span>;
}

/**
 * Renders image element
 */
function ImageContent({ element }: ElementContentProps) {
  const content = element.content as ImageContent | undefined;
  if (!content || content.type !== 'image') return null;

  return (
    <img
      src={content.src}
      alt={content.alt}
      loading={content.loading || 'lazy'}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
      }}
      draggable={false}
    />
  );
}

/**
 * Renders button element
 */
function ButtonContent({ element }: ElementContentProps) {
  const content = element.content as TextContent | undefined;
  const text = content?.type === 'text' ? content.text : 'Button';

  return (
    <button
      type="button"
      style={{
        all: 'unset',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        cursor: 'pointer',
      }}
      onClick={(e) => e.preventDefault()}
    >
      {text}
    </button>
  );
}

/**
 * Renders link element
 */
function LinkContent({ element, elements }: ElementContentProps) {
  const content = element.content as LinkContent | undefined;
  const href = content?.type === 'link' ? content.href : '#';
  const target = content?.type === 'link' ? content.target : '_self';

  return (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        textDecoration: 'inherit',
        color: 'inherit',
      }}
      onClick={(e) => e.preventDefault()}
    >
      {element.children.length > 0 ? (
        element.children.map((childId) => (
          <ElementRenderer key={childId} elementId={childId} elements={elements} />
        ))
      ) : (
        <span>{href}</span>
      )}
    </a>
  );
}

/**
 * Renders icon element
 */
function IconContentRenderer({ element }: ElementContentProps) {
  const content = element.content as IconContent | undefined;
  if (!content || content.type !== 'icon') return null;

  // Get icon from Lucide - convert kebab-case to PascalCase
  const iconName = content.name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  // Access the icon component from Lucide using dynamic lookup
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const IconComponent = (LucideIcons as any)[iconName];

  if (!IconComponent || typeof IconComponent !== 'function') {
    // Fallback to a placeholder
    return (
      <div
        style={{
          width: content.size || 24,
          height: content.size || 24,
          backgroundColor: 'var(--ds-gray-200)',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          color: 'var(--ds-gray-500)',
        }}
      >
        ?
      </div>
    );
  }

  return (
    <IconComponent
      size={content.size || 24}
      strokeWidth={content.strokeWidth || 2}
    />
  );
}

/**
 * Renders divider element
 */
function DividerContent({ computedStyles }: ElementContentProps) {
  const isVertical =
    computedStyles.layout.flexDirection === 'row' ||
    computedStyles.layout.flexDirection === 'row-reverse';

  return (
    <hr
      style={{
        border: 'none',
        backgroundColor: 'var(--ds-gray-200)',
        width: isVertical ? '1px' : '100%',
        height: isVertical ? '100%' : '1px',
        margin: 0,
      }}
    />
  );
}

/**
 * Renders component instance
 */
function ComponentContent({ element }: ElementContentProps) {
  // Component instances would be resolved from the component library
  // For now, render a placeholder
  return (
    <div
      style={{
        padding: 16,
        backgroundColor: 'var(--ds-blue-50)',
        border: '1px dashed var(--ds-blue-300)',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--ds-blue-600)',
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      Component: {element.componentId || 'Unknown'}
    </div>
  );
}

// ============================================================================
// MAIN ELEMENT RENDERER
// ============================================================================

export function ElementRenderer({
  elementId,
  elements,
  isRoot = false,
}: ElementRendererProps) {
  // Get editor state
  const activeBreakpoint = useEditorStoreV2((state) => state.activeBreakpoint);
  const selectedElementIds = useEditorStoreV2((state) => state.selectedElementIds);
  const hoveredElementId = useEditorStoreV2((state) => state.hoveredElementId);
  const selectElement = useEditorStoreV2((state) => state.selectElement);
  const setHoveredElement = useEditorStoreV2((state) => state.setHoveredElement);
  const mode = useEditorStoreV2((state) => state.mode);

  // Get element
  const element = elements[elementId];

  // Compute styles based on breakpoint
  const computedStyles = useMemo(() => {
    if (!element) return null;
    return getComputedStyles(element, activeBreakpoint);
  }, [element, activeBreakpoint]);

  // Check selection/hover state
  const isSelected = selectedElementIds.includes(elementId);
  const isHovered = hoveredElementId === elementId;

  // Event handlers
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (mode !== 'edit') return;
      e.stopPropagation();

      if (e.shiftKey) {
        selectElement(elementId, 'toggle');
      } else if (e.metaKey || e.ctrlKey) {
        selectElement(elementId, 'add');
      } else {
        selectElement(elementId, 'replace');
      }
    },
    [elementId, selectElement, mode]
  );

  const handleMouseEnter = useCallback(() => {
    if (mode !== 'edit') return;
    setHoveredElement(elementId);
  }, [elementId, setHoveredElement, mode]);

  const handleMouseLeave = useCallback(() => {
    if (mode !== 'edit') return;
    setHoveredElement(null);
  }, [setHoveredElement, mode]);

  // Don't render if element doesn't exist or is hidden
  if (!element || !computedStyles || computedStyles.hidden) {
    return null;
  }

  // Combine all CSS properties
  const combinedStyle: CSSProperties = {
    ...layoutToCSS(computedStyles.layout),
    ...positionToCSS(computedStyles.position),
    ...sizeToCSS(computedStyles.size),
    ...styleToCSS(computedStyles.styles),
    boxSizing: 'border-box',
  };

  // Render content based on element type
  const renderContent = () => {
    const contentProps: ElementContentProps = {
      element,
      computedStyles,
      elements,
    };

    switch (element.type) {
      case 'frame':
        return <FrameContent {...contentProps} />;
      case 'text':
        return <TextContent {...contentProps} />;
      case 'image':
        return <ImageContent {...contentProps} />;
      case 'button':
        return <ButtonContent {...contentProps} />;
      case 'link':
        return <LinkContent {...contentProps} />;
      case 'icon':
        return <IconContentRenderer {...contentProps} />;
      case 'divider':
        return <DividerContent {...contentProps} />;
      case 'component':
        return <ComponentContent {...contentProps} />;
      default:
        // For unsupported types, render children if any
        return element.children.map((childId) => (
          <ElementRenderer key={childId} elementId={childId} elements={elements} />
        ));
    }
  };

  // In preview mode, render without draggable wrapper
  if (mode === 'preview') {
    return (
      <div style={combinedStyle} data-element-id={elementId}>
        {renderContent()}
      </div>
    );
  }

  // In edit mode, wrap with draggable
  return (
    <DraggableElement
      elementId={elementId}
      isLocked={element.locked}
      isSelected={isSelected}
      isHovered={isHovered}
      style={combinedStyle}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {renderContent()}
    </DraggableElement>
  );
}

export default ElementRenderer;
