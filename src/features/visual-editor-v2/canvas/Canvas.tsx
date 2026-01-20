'use client';

/**
 * Visual Editor V2 - Infinite Canvas Component
 * 
 * A Figma-like infinite canvas with pan/zoom functionality.
 * Uses D3-zoom for smooth pan/zoom and DndKit for drag-and-drop.
 */

import * as React from 'react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { zoom, zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { select } from 'd3-selection';
import 'd3-transition'; // Extends Selection with transition methods
import { useHotkeys } from 'react-hotkeys-hook';
import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
} from '@dnd-kit/core';
import { cn } from '@/shared/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Kbd } from '@/components/ui/kbd';
import {
  Minus,
  Plus,
  Maximize2,
  Grid3X3,
  MousePointer2,
  Hand,
} from 'lucide-react';
import { useEditorStoreV2, type CanvasTransform } from '../store/editor-store';
import type { Page } from '../types/page';
import type { VisualElement } from '../types/element';

// ============================================================================
// CONSTANTS
// ============================================================================

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.25;
const GRID_SIZE = 8;

// ============================================================================
// TYPES
// ============================================================================

export interface CanvasProps {
  /** The page to render */
  page: Page;
  /** Callback when page is updated */
  onPageUpdate?: (page: Page) => void;
  /** Additional class names */
  className?: string;
  /** Whether the canvas is read-only */
  readOnly?: boolean;
}

interface SelectionBoxState {
  active: boolean;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

// ============================================================================
// ZOOM INDICATOR COMPONENT
// ============================================================================

interface ZoomIndicatorProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onZoomToFit: () => void;
  showGrid: boolean;
  onToggleGrid: () => void;
}

function ZoomIndicator({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomToFit,
  showGrid,
  onToggleGrid,
}: ZoomIndicatorProps) {
  const zoomPercent = Math.round(zoom * 100);

  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 z-50',
        'flex items-center gap-1',
        'bg-[var(--ds-background-100)] border border-[var(--ds-gray-200)]',
        'rounded-lg shadow-sm p-1'
      )}
      role="toolbar"
      aria-label="Canvas zoom controls"
    >
      {/* Zoom Out */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onZoomOut}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent variant="geist" side="top">
          <span>Zoom out</span>
          <Kbd className="ml-2">−</Kbd>
        </TooltipContent>
      </Tooltip>

      {/* Zoom Level Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onZoomReset}
            className="min-w-[60px] tabular-nums font-medium"
            aria-label={`Current zoom: ${zoomPercent}%. Click to reset to 100%`}
          >
            {zoomPercent}%
          </Button>
        </TooltipTrigger>
        <TooltipContent variant="geist" side="top">
          <span>Reset zoom</span>
          <Kbd className="ml-2">⌘ 0</Kbd>
        </TooltipContent>
      </Tooltip>

      {/* Zoom In */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onZoomIn}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent variant="geist" side="top">
          <span>Zoom in</span>
          <Kbd className="ml-2">+</Kbd>
        </TooltipContent>
      </Tooltip>

      {/* Divider */}
      <div className="w-px h-5 bg-[var(--ds-gray-200)] mx-1" />

      {/* Zoom to Fit */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onZoomToFit}
            aria-label="Zoom to fit"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent variant="geist" side="top">
          <span>Zoom to fit</span>
          <Kbd className="ml-2">⌘ 1</Kbd>
        </TooltipContent>
      </Tooltip>

      {/* Toggle Grid */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showGrid ? 'secondary' : 'ghost'}
            size="icon-sm"
            onClick={onToggleGrid}
            aria-label={showGrid ? 'Hide grid' : 'Show grid'}
            aria-pressed={showGrid}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent variant="geist" side="top">
          <span>{showGrid ? 'Hide grid' : 'Show grid'}</span>
          <Kbd className="ml-2">⌘ '</Kbd>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

// ============================================================================
// GRID OVERLAY COMPONENT
// ============================================================================

interface GridOverlayProps {
  gridSize: number;
  transform: CanvasTransform;
}

function GridOverlay({ gridSize, transform }: GridOverlayProps) {
  const scaledGridSize = gridSize * transform.k;
  
  // Only show grid when zoomed in enough
  if (scaledGridSize < 8) return null;

  const offsetX = transform.x % scaledGridSize;
  const offsetY = transform.y % scaledGridSize;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(to right, var(--ds-gray-200) 1px, transparent 1px),
          linear-gradient(to bottom, var(--ds-gray-200) 1px, transparent 1px)
        `,
        backgroundSize: `${scaledGridSize}px ${scaledGridSize}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        opacity: Math.min(1, (scaledGridSize - 8) / 16),
      }}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// SELECTION BOX COMPONENT
// ============================================================================

interface SelectionBoxOverlayProps {
  box: SelectionBoxState;
  transform: CanvasTransform;
}

function SelectionBoxOverlay({ box, transform }: SelectionBoxOverlayProps) {
  if (!box.active) return null;

  const left = Math.min(box.startX, box.endX);
  const top = Math.min(box.startY, box.endY);
  const width = Math.abs(box.endX - box.startX);
  const height = Math.abs(box.endY - box.startY);

  return (
    <div
      className={cn(
        'absolute pointer-events-none',
        'border-2 border-[var(--ds-blue-500)]',
        'bg-[var(--ds-blue-100)]/30'
      )}
      style={{
        left,
        top,
        width,
        height,
      }}
      aria-hidden="true"
    />
  );
}

// ============================================================================
// PAGE FRAME COMPONENT
// ============================================================================

interface PageFrameProps {
  page: Page;
  children: React.ReactNode;
  transform: CanvasTransform;
}

function PageFrame({ page, children, transform }: PageFrameProps) {
  const { settings } = page;
  const pageWidth = settings.width || 1440;

  return (
    <div
      className={cn(
        'relative',
        'bg-[var(--ds-background-100)]',
        'shadow-[0_0_0_1px_var(--ds-gray-200),0_4px_24px_rgba(0,0,0,0.08)]',
        'rounded-lg overflow-hidden'
      )}
      style={{
        width: pageWidth,
        minHeight: 800,
        backgroundColor: settings.backgroundColor || 'var(--ds-background)',
      }}
      role="region"
      aria-label={`Page: ${page.name}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// ELEMENT WRAPPER COMPONENT (for selection/hover states)
// ============================================================================

interface ElementWrapperProps {
  element: VisualElement;
  isSelected: boolean;
  isHovered: boolean;
  children: React.ReactNode;
  onSelect: (elementId: string, mode: 'replace' | 'add' | 'toggle') => void;
  onHover: (elementId: string | null) => void;
}

function ElementWrapper({
  element,
  isSelected,
  isHovered,
  children,
  onSelect,
  onHover,
}: ElementWrapperProps) {
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const mode = e.shiftKey ? 'add' : e.metaKey || e.ctrlKey ? 'toggle' : 'replace';
      onSelect(element.id, mode);
    },
    [element.id, onSelect]
  );

  const handleMouseEnter = useCallback(() => {
    onHover(element.id);
  }, [element.id, onHover]);

  const handleMouseLeave = useCallback(() => {
    onHover(null);
  }, [onHover]);

  return (
    <div
      className={cn(
        'relative',
        element.locked && 'pointer-events-none'
      )}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-element-id={element.id}
      data-element-type={element.type}
      data-selected={isSelected}
      data-hovered={isHovered}
    >
      {children}
      
      {/* Selection outline */}
      {isSelected && (
        <div
          className={cn(
            'absolute inset-0 pointer-events-none',
            'border-2 border-[var(--ds-blue-500)]',
            'rounded-[inherit]'
          )}
          aria-hidden="true"
        />
      )}
      
      {/* Hover outline */}
      {isHovered && !isSelected && (
        <div
          className={cn(
            'absolute inset-0 pointer-events-none',
            'border border-[var(--ds-blue-400)]',
            'rounded-[inherit]'
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

// ============================================================================
// SIMPLE ELEMENT RENDERER (placeholder - will be expanded)
// ============================================================================

interface SimpleElementRendererProps {
  elementId: string;
  elements: Record<string, VisualElement>;
  selectedIds: string[];
  hoveredId: string | null;
  onSelect: (elementId: string, mode: 'replace' | 'add' | 'toggle') => void;
  onHover: (elementId: string | null) => void;
}

function SimpleElementRenderer({
  elementId,
  elements,
  selectedIds,
  hoveredId,
  onSelect,
  onHover,
}: SimpleElementRendererProps) {
  const element = elements[elementId];
  if (!element || element.hidden) return null;

  const isSelected = selectedIds.includes(elementId);
  const isHovered = hoveredId === elementId;
  const isRoot = element.parentId === null;

  // Build inline styles from element config
  const styles: React.CSSProperties = {
    display: element.layout.display,
    flexDirection: element.layout.flexDirection,
    flexWrap: element.layout.flexWrap,
    justifyContent: element.layout.justifyContent === 'between' ? 'space-between' :
                    element.layout.justifyContent === 'around' ? 'space-around' :
                    element.layout.justifyContent === 'evenly' ? 'space-evenly' :
                    element.layout.justifyContent,
    alignItems: element.layout.alignItems,
    gap: element.layout.gap,
    width: element.size.width === 'fill' ? '100%' :
           element.size.width === 'hug' ? 'fit-content' :
           element.size.width === 'auto' ? 'auto' :
           typeof element.size.width === 'number' ? `${element.size.width}px` :
           element.size.width,
    height: element.size.height === 'fill' ? '100%' :
            element.size.height === 'hug' ? 'fit-content' :
            element.size.height === 'auto' ? 'auto' :
            typeof element.size.height === 'number' ? `${element.size.height}px` :
            element.size.height,
    minWidth: element.size.minWidth,
    maxWidth: element.size.maxWidth,
    minHeight: element.size.minHeight,
    maxHeight: element.size.maxHeight,
    padding: Array.isArray(element.styles.padding)
      ? element.styles.padding.map(p => `${p}px`).join(' ')
      : typeof element.styles.padding === 'number' 
        ? `${element.styles.padding}px`
        : element.styles.padding,
    borderRadius: Array.isArray(element.styles.borderRadius)
      ? element.styles.borderRadius.map(r => `${r}px`).join(' ')
      : typeof element.styles.borderRadius === 'number'
        ? `${element.styles.borderRadius}px`
        : element.styles.borderRadius,
    opacity: element.styles.opacity,
    overflow: element.styles.overflow,
    position: element.position.type === 'relative' ? 'relative' : element.position.type,
    top: element.position.top,
    right: element.position.right,
    bottom: element.position.bottom,
    left: element.position.left,
    zIndex: element.position.zIndex,
    boxSizing: 'border-box',
  };

  // Add background
  if (element.styles.background) {
    if (element.styles.background.type === 'solid' && element.styles.background.color) {
      styles.backgroundColor = element.styles.background.color;
    } else if (element.styles.background.type === 'gradient') {
      // Handle gradient backgrounds
      const bg = element.styles.background as { type: 'gradient'; gradient?: string };
      if (bg.gradient) {
        styles.background = bg.gradient;
      }
    }
  }

  // Add border
  if (element.styles.border) {
    styles.borderWidth = element.styles.border.width || 1;
    styles.borderStyle = element.styles.border.style || 'solid';
    styles.borderColor = element.styles.border.color || 'var(--ds-gray-300)';
  }

  // Add typography for text elements
  if (element.styles.typography) {
    styles.fontFamily = element.styles.typography.fontFamily;
    styles.fontSize = typeof element.styles.typography.fontSize === 'number' 
      ? `${element.styles.typography.fontSize}px` 
      : element.styles.typography.fontSize;
    styles.fontWeight = element.styles.typography.fontWeight;
    styles.lineHeight = element.styles.typography.lineHeight;
    styles.letterSpacing = element.styles.typography.letterSpacing;
    styles.textAlign = element.styles.typography.textAlign;
    styles.color = element.styles.typography.color;
  }

  // Handle direct color property (some AI responses use this)
  if ((element.styles as Record<string, unknown>).color && !styles.color) {
    styles.color = (element.styles as Record<string, unknown>).color as string;
  }
  if ((element.styles as Record<string, unknown>).backgroundColor && !styles.backgroundColor) {
    styles.backgroundColor = (element.styles as Record<string, unknown>).backgroundColor as string;
  }

  // Type-specific default styles
  if (element.type === 'button') {
    if (!styles.backgroundColor) styles.backgroundColor = 'var(--ds-gray-900)';
    if (!styles.color) styles.color = 'white';
    if (!styles.padding) styles.padding = '12px 24px';
    if (!styles.borderRadius) styles.borderRadius = '6px';
    styles.cursor = 'pointer';
    styles.display = 'inline-flex';
    styles.alignItems = 'center';
    styles.justifyContent = 'center';
    styles.fontWeight = 500;
  }

  if (element.type === 'text' && !styles.color) {
    styles.color = 'var(--ds-gray-900)';
  }

  // Render content based on type
  const renderContent = () => {
    if (element.content?.type === 'text') {
      return element.content.text;
    }
    if (element.content?.type === 'image') {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={element.content.src}
          alt={element.content.alt}
          className="w-full h-full object-cover"
          loading={element.content.loading || 'lazy'}
        />
      );
    }
    return null;
  };

  // For root element, don't wrap in ElementWrapper
  if (isRoot) {
    return (
      <div style={styles}>
        {renderContent()}
        {element.children.map(childId => (
          <SimpleElementRenderer
            key={childId}
            elementId={childId}
            elements={elements}
            selectedIds={selectedIds}
            hoveredId={hoveredId}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
    );
  }

  return (
    <ElementWrapper
      element={element}
      isSelected={isSelected}
      isHovered={isHovered}
      onSelect={onSelect}
      onHover={onHover}
    >
      <div style={styles}>
        {renderContent()}
        {element.children.map(childId => (
          <SimpleElementRenderer
            key={childId}
            elementId={childId}
            elements={elements}
            selectedIds={selectedIds}
            hoveredId={hoveredId}
            onSelect={onSelect}
            onHover={onHover}
          />
        ))}
      </div>
    </ElementWrapper>
  );
}

// ============================================================================
// MAIN CANVAS COMPONENT
// ============================================================================

export function Canvas({ page, onPageUpdate, className, readOnly = false }: CanvasProps) {
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<HTMLDivElement, unknown> | null>(null);

  // Store
  const {
    canvas,
    selectedElementIds,
    hoveredElementId,
    setTransform,
    zoomIn,
    zoomOut,
    zoomToFit,
    resetZoom,
    setShowGrid,
    selectElement,
    selectElements,
    clearSelection,
    setHoveredElement,
  } = useEditorStoreV2();

  // Local state
  const [selectionBox, setSelectionBox] = useState<SelectionBoxState>({
    active: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [tool, setTool] = useState<'select' | 'pan'>('select');

  // DndKit sensors
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  // ============================================================================
  // D3 ZOOM SETUP
  // ============================================================================

  useLayoutEffect(() => {
    if (!canvasRef.current) return;

    const zoomBehavior = zoom<HTMLDivElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .filter((event) => {
        // Allow wheel zoom
        if (event.type === 'wheel') return true;
        // Allow middle mouse button for panning
        if (event.type === 'mousedown' && event.button === 1) return true;
        // Allow touch for pinch zoom
        if (event.type === 'touchstart') return true;
        // Allow pan tool
        if (tool === 'pan') return true;
        // Block other interactions (let DndKit handle them)
        return false;
      })
      .on('start', () => {
        setIsPanning(true);
      })
      .on('zoom', (event) => {
        const { x, y, k } = event.transform;
        setTransform({ x, y, k });
      })
      .on('end', () => {
        setIsPanning(false);
      });

    zoomBehaviorRef.current = zoomBehavior;

    const selection = select(canvasRef.current);
    selection.call(zoomBehavior);

    // Set initial transform from store
    selection.call(
      zoomBehavior.transform,
      zoomIdentity
        .translate(canvas.transform.x, canvas.transform.y)
        .scale(canvas.transform.k)
    );

    // Prevent default context menu on canvas
    canvasRef.current.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });

    return () => {
      selection.on('.zoom', null);
    };
  }, [tool, setTransform, canvas.transform.x, canvas.transform.y, canvas.transform.k]);

  // ============================================================================
  // ZOOM HANDLERS
  // ============================================================================

  const handleZoomIn = useCallback(() => {
    if (!canvasRef.current || !zoomBehaviorRef.current) return;
    
    const selection = select(canvasRef.current);
    selection.transition().duration(200).call(
      zoomBehaviorRef.current.scaleBy,
      ZOOM_STEP
    );
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!canvasRef.current || !zoomBehaviorRef.current) return;
    
    const selection = select(canvasRef.current);
    selection.transition().duration(200).call(
      zoomBehaviorRef.current.scaleBy,
      1 / ZOOM_STEP
    );
  }, []);

  const handleZoomReset = useCallback(() => {
    if (!canvasRef.current || !zoomBehaviorRef.current) return;
    
    const selection = select(canvasRef.current);
    selection.transition().duration(300).call(
      zoomBehaviorRef.current.transform,
      zoomIdentity
    );
    resetZoom();
  }, [resetZoom]);

  const handleZoomToFit = useCallback(() => {
    if (!canvasRef.current || !zoomBehaviorRef.current || !contentRef.current) return;
    
    const canvasRect = canvasRef.current.getBoundingClientRect();
    const pageWidth = page.settings.width || 1440;
    const pageHeight = 800; // Default min height
    
    // Calculate scale to fit
    const scaleX = (canvasRect.width - 100) / pageWidth;
    const scaleY = (canvasRect.height - 100) / pageHeight;
    const scale = Math.min(scaleX, scaleY, 1);
    
    // Center the page
    const x = (canvasRect.width - pageWidth * scale) / 2;
    const y = (canvasRect.height - pageHeight * scale) / 2;
    
    const selection = select(canvasRef.current);
    selection.transition().duration(300).call(
      zoomBehaviorRef.current.transform,
      zoomIdentity.translate(x, y).scale(scale)
    );
    
    zoomToFit();
  }, [page.settings.width, zoomToFit]);

  const handleToggleGrid = useCallback(() => {
    setShowGrid(!canvas.showGrid);
  }, [canvas.showGrid, setShowGrid]);

  // ============================================================================
  // KEYBOARD SHORTCUTS
  // ============================================================================

  // Zoom reset (Cmd/Ctrl + 0)
  useHotkeys('mod+0', (e) => {
    e.preventDefault();
    handleZoomReset();
  }, { enableOnFormTags: false });

  // Zoom to fit (Cmd/Ctrl + 1)
  useHotkeys('mod+1', (e) => {
    e.preventDefault();
    handleZoomToFit();
  }, { enableOnFormTags: false });

  // Zoom in (Cmd/Ctrl + Plus or Plus)
  useHotkeys(['mod+=', 'mod+plus', '=', 'plus'], (e) => {
    e.preventDefault();
    handleZoomIn();
  }, { enableOnFormTags: false });

  // Zoom out (Cmd/Ctrl + Minus or Minus)
  useHotkeys(['mod+-', 'mod+minus', '-', 'minus'], (e) => {
    e.preventDefault();
    handleZoomOut();
  }, { enableOnFormTags: false });

  // Toggle grid (Cmd/Ctrl + ')
  useHotkeys("mod+'", (e) => {
    e.preventDefault();
    handleToggleGrid();
  }, { enableOnFormTags: false });

  // Select all (Cmd/Ctrl + A)
  useHotkeys('mod+a', (e) => {
    e.preventDefault();
    const allIds = Object.keys(page.elements).filter(id => id !== page.rootElementId);
    selectElements(allIds);
  }, { enableOnFormTags: false });

  // Deselect (Escape)
  useHotkeys('escape', () => {
    clearSelection();
  }, { enableOnFormTags: false });

  // Pan tool (Space held)
  useHotkeys('space', (e) => {
    e.preventDefault();
    setTool('pan');
  }, { keydown: true, keyup: false, enableOnFormTags: false });

  useHotkeys('space', () => {
    setTool('select');
  }, { keydown: false, keyup: true, enableOnFormTags: false });

  // Select tool (V)
  useHotkeys('v', () => {
    setTool('select');
  }, { enableOnFormTags: false });

  // Pan tool (H)
  useHotkeys('h', () => {
    setTool('pan');
  }, { enableOnFormTags: false });

  // ============================================================================
  // SELECTION BOX HANDLERS
  // ============================================================================

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    // Only start selection box on left click in select mode
    if (e.button !== 0 || tool !== 'select') return;
    
    // Don't start selection if clicking on an element
    const target = e.target as HTMLElement;
    if (target.closest('[data-element-id]')) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionBox({
      active: true,
      startX: x,
      startY: y,
      endX: x,
      endY: y,
    });

    // Clear selection when clicking on empty canvas
    clearSelection();
  }, [tool, clearSelection]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!selectionBox.active) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setSelectionBox(prev => ({
      ...prev,
      endX: x,
      endY: y,
    }));
  }, [selectionBox.active]);

  const handleCanvasMouseUp = useCallback(() => {
    if (!selectionBox.active) return;

    // Calculate selection box bounds in canvas coordinates
    const left = Math.min(selectionBox.startX, selectionBox.endX);
    const top = Math.min(selectionBox.startY, selectionBox.endY);
    const right = Math.max(selectionBox.startX, selectionBox.endX);
    const bottom = Math.max(selectionBox.startY, selectionBox.endY);

    // Find elements within selection box
    const selectedIds: string[] = [];
    const elements = canvasRef.current?.querySelectorAll('[data-element-id]');
    
    elements?.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const elLeft = rect.left - canvasRect.left;
      const elTop = rect.top - canvasRect.top;
      const elRight = rect.right - canvasRect.left;
      const elBottom = rect.bottom - canvasRect.top;

      // Check if element intersects with selection box
      if (elLeft < right && elRight > left && elTop < bottom && elBottom > top) {
        const id = el.getAttribute('data-element-id');
        if (id && id !== page.rootElementId) {
          selectedIds.push(id);
        }
      }
    });

    if (selectedIds.length > 0) {
      selectElements(selectedIds);
    }

    setSelectionBox({
      active: false,
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
    });
  }, [selectionBox, page.rootElementId, selectElements]);

  // ============================================================================
  // DRAG AND DROP HANDLERS
  // ============================================================================

  const handleDragStart = useCallback((event: DragStartEvent) => {
    // Handle drag start
    console.log('Drag started:', event.active.id);
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    // Handle drag move
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    // Handle drag end
    console.log('Drag ended:', event.active.id);
  }, []);

  // ============================================================================
  // ELEMENT HANDLERS
  // ============================================================================

  const handleSelectElement = useCallback((elementId: string, mode: 'replace' | 'add' | 'toggle') => {
    if (readOnly) return;
    selectElement(elementId, mode);
  }, [readOnly, selectElement]);

  const handleHoverElement = useCallback((elementId: string | null) => {
    if (readOnly) return;
    setHoveredElement(elementId);
  }, [readOnly, setHoveredElement]);

  // ============================================================================
  // RENDER
  // ============================================================================

  const cursorStyle = useMemo(() => {
    if (isPanning) return 'grabbing';
    if (tool === 'pan') return 'grab';
    return 'default';
  }, [isPanning, tool]);

  return (
    <div
      className={cn(
        'relative w-full h-full overflow-hidden',
        'bg-[var(--ds-gray-100)]',
        className
      )}
      role="application"
      aria-label="Visual editor canvas"
    >
      {/* Canvas viewport */}
      <div
        ref={canvasRef}
        className="absolute inset-0 overflow-hidden"
        style={{ cursor: cursorStyle }}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        tabIndex={0}
        aria-label="Canvas viewport - use mouse wheel to zoom, middle mouse button to pan"
      >
        {/* Grid overlay */}
        {canvas.showGrid && (
          <GridOverlay gridSize={canvas.gridSize} transform={canvas.transform} />
        )}

        {/* Transformed content */}
        <div
          ref={contentRef}
          className="absolute origin-top-left"
          style={{
            transform: `translate(${canvas.transform.x}px, ${canvas.transform.y}px) scale(${canvas.transform.k})`,
            transformOrigin: 'top left',
          }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
          >
            {/* Page frame */}
            <PageFrame page={page} transform={canvas.transform}>
              {/* Render element tree */}
              <SimpleElementRenderer
                elementId={page.rootElementId}
                elements={page.elements}
                selectedIds={selectedElementIds}
                hoveredId={hoveredElementId}
                onSelect={handleSelectElement}
                onHover={handleHoverElement}
              />
            </PageFrame>

            {/* Drag overlay */}
            <DragOverlay>
              {/* Render dragged element preview */}
            </DragOverlay>
          </DndContext>
        </div>

        {/* Selection box overlay */}
        <SelectionBoxOverlay box={selectionBox} transform={canvas.transform} />
      </div>

      {/* Tool indicator */}
      <div
        className={cn(
          'absolute top-4 left-4 z-50',
          'flex items-center gap-1',
          'bg-[var(--ds-background-100)] border border-[var(--ds-gray-200)]',
          'rounded-lg shadow-sm p-1'
        )}
        role="toolbar"
        aria-label="Canvas tools"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={tool === 'select' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setTool('select')}
              aria-label="Select tool"
              aria-pressed={tool === 'select'}
            >
              <MousePointer2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent variant="geist" side="bottom">
            <span>Select</span>
            <Kbd className="ml-2">V</Kbd>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={tool === 'pan' ? 'secondary' : 'ghost'}
              size="icon-sm"
              onClick={() => setTool('pan')}
              aria-label="Pan tool"
              aria-pressed={tool === 'pan'}
            >
              <Hand className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent variant="geist" side="bottom">
            <span>Pan</span>
            <Kbd className="ml-2">H</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Zoom indicator */}
      <ZoomIndicator
        zoom={canvas.transform.k}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onZoomToFit={handleZoomToFit}
        showGrid={canvas.showGrid}
        onToggleGrid={handleToggleGrid}
      />

      {/* Keyboard shortcuts help (hidden, for screen readers) */}
      <div className="sr-only" role="note">
        Keyboard shortcuts: 
        Press V for select tool, H for pan tool, Space to temporarily pan.
        Use plus and minus keys to zoom, Command+0 to reset zoom, Command+1 to fit.
        Press Escape to deselect, Command+A to select all.
      </div>
    </div>
  );
}

export default Canvas;
