'use client';

/**
 * Visual Editor V2 - Resize Handles
 *
 * Shows 8 resize handles on selected elements with:
 * - Corner handles (nw, ne, sw, se)
 * - Edge handles (n, e, s, w)
 * - Drag events for resizing
 * - Aspect ratio lock when Shift is held
 * - Size tooltip while resizing
 * - Min/max constraints support
 */

import * as React from 'react';
import { useEditorStoreV2 } from '../store/editor-store';
import type { VisualElement, SizeConfig } from '../types/element';
import { cn } from '@/shared/utils';

// ============================================================================
// TYPES
// ============================================================================

export type ResizeHandlePosition =
  | 'nw' // top-left
  | 'n' // top
  | 'ne' // top-right
  | 'e' // right
  | 'se' // bottom-right
  | 's' // bottom
  | 'sw' // bottom-left
  | 'w'; // left

interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ResizeConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number;
}

interface ResizeHandlesProps {
  /** Container element ref for calculating positions */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Map of element IDs to their DOM refs */
  elementRefs: Map<string, HTMLElement>;
  /** Current canvas transform */
  transform: { x: number; y: number; k: number };
  /** Callback when resize starts */
  onResizeStart?: (elementId: string, handle: ResizeHandlePosition) => void;
  /** Callback during resize */
  onResize?: (
    elementId: string,
    newSize: { width: number; height: number },
    newPosition?: { x: number; y: number }
  ) => void;
  /** Callback when resize ends */
  onResizeEnd?: (elementId: string) => void;
  /** Optional class name */
  className?: string;
}

interface HandleProps {
  position: ResizeHandlePosition;
  bounds: ElementBounds;
  transform: { x: number; y: number; k: number };
  onMouseDown: (e: React.MouseEvent, position: ResizeHandlePosition) => void;
  isResizing: boolean;
  activeHandle: ResizeHandlePosition | null;
}

interface SizeTooltipProps {
  width: number;
  height: number;
  bounds: ElementBounds;
  transform: { x: number; y: number; k: number };
  visible: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HANDLE_SIZE = 8;
const HANDLE_SIZE_CORNER = 10;
const EDGE_HANDLE_LENGTH = 24;

const HANDLE_POSITIONS: ResizeHandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

const CURSOR_MAP: Record<ResizeHandlePosition, string> = {
  nw: 'nwse-resize',
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
};

// Default constraints
const DEFAULT_CONSTRAINTS: ResizeConstraints = {
  minWidth: 20,
  minHeight: 20,
  maxWidth: 10000,
  maxHeight: 10000,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the bounding box of an element relative to the container
 */
function getElementBounds(
  element: HTMLElement,
  container: HTMLElement,
  transform: { x: number; y: number; k: number }
): ElementBounds {
  const elementRect = element.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();

  const x = (elementRect.left - containerRect.left - transform.x) / transform.k;
  const y = (elementRect.top - containerRect.top - transform.y) / transform.k;
  const width = elementRect.width / transform.k;
  const height = elementRect.height / transform.k;

  return { x, y, width, height };
}

/**
 * Get handle position coordinates
 */
function getHandlePosition(
  position: ResizeHandlePosition,
  bounds: ElementBounds,
  transform: { x: number; y: number; k: number }
): { x: number; y: number } {
  const { x, y, width, height } = bounds;
  const { k } = transform;

  const positions: Record<ResizeHandlePosition, { x: number; y: number }> = {
    nw: { x: x * k + transform.x, y: y * k + transform.y },
    n: { x: (x + width / 2) * k + transform.x, y: y * k + transform.y },
    ne: { x: (x + width) * k + transform.x, y: y * k + transform.y },
    e: { x: (x + width) * k + transform.x, y: (y + height / 2) * k + transform.y },
    se: { x: (x + width) * k + transform.x, y: (y + height) * k + transform.y },
    s: { x: (x + width / 2) * k + transform.x, y: (y + height) * k + transform.y },
    sw: { x: x * k + transform.x, y: (y + height) * k + transform.y },
    w: { x: x * k + transform.x, y: (y + height / 2) * k + transform.y },
  };

  return positions[position];
}

/**
 * Check if handle is a corner handle
 */
function isCornerHandle(position: ResizeHandlePosition): boolean {
  return ['nw', 'ne', 'se', 'sw'].includes(position);
}

/**
 * Apply constraints to new dimensions
 */
function applyConstraints(
  width: number,
  height: number,
  constraints: ResizeConstraints,
  maintainAspectRatio: boolean,
  originalAspectRatio: number
): { width: number; height: number } {
  let newWidth = width;
  let newHeight = height;

  // Apply min/max constraints
  newWidth = Math.max(constraints.minWidth ?? 0, Math.min(constraints.maxWidth ?? Infinity, newWidth));
  newHeight = Math.max(constraints.minHeight ?? 0, Math.min(constraints.maxHeight ?? Infinity, newHeight));

  // Maintain aspect ratio if required
  if (maintainAspectRatio && originalAspectRatio > 0) {
    const currentRatio = newWidth / newHeight;
    if (currentRatio > originalAspectRatio) {
      newWidth = newHeight * originalAspectRatio;
    } else {
      newHeight = newWidth / originalAspectRatio;
    }
  }

  return { width: newWidth, height: newHeight };
}

/**
 * Get constraints from element size config
 */
function getConstraintsFromElement(element: VisualElement): ResizeConstraints {
  const size = element.size;
  return {
    minWidth: size.minWidth ?? DEFAULT_CONSTRAINTS.minWidth,
    maxWidth: size.maxWidth ?? DEFAULT_CONSTRAINTS.maxWidth,
    minHeight: size.minHeight ?? DEFAULT_CONSTRAINTS.minHeight,
    maxHeight: size.maxHeight ?? DEFAULT_CONSTRAINTS.maxHeight,
    aspectRatio: size.aspectRatio,
  };
}

// ============================================================================
// SIZE TOOLTIP COMPONENT
// ============================================================================

const SizeTooltip: React.FC<SizeTooltipProps> = ({
  width,
  height,
  bounds,
  transform,
  visible,
}) => {
  if (!visible) return null;

  const labelText = `${Math.round(width)} × ${Math.round(height)}`;

  return (
    <div
      className={cn(
        'absolute pointer-events-none z-[100]',
        'px-2 py-1 rounded-md text-xs font-medium tabular-nums',
        'bg-[var(--ds-gray-1000)] text-white',
        'shadow-lg',
        'transition-opacity duration-100',
        visible ? 'opacity-100' : 'opacity-0',
        'motion-reduce:transition-none'
      )}
      style={{
        left: (bounds.x + bounds.width / 2) * transform.k + transform.x,
        top: (bounds.y + bounds.height) * transform.k + transform.y + 12,
        transform: 'translateX(-50%)',
      }}
    >
      {labelText}
    </div>
  );
};

// ============================================================================
// SINGLE HANDLE COMPONENT
// ============================================================================

const Handle: React.FC<HandleProps> = ({
  position,
  bounds,
  transform,
  onMouseDown,
  isResizing,
  activeHandle,
}) => {
  const isCorner = isCornerHandle(position);
  const isActive = activeHandle === position;
  const handlePos = getHandlePosition(position, bounds, transform);

  // Determine handle size
  const size = isCorner ? HANDLE_SIZE_CORNER : HANDLE_SIZE;
  const isEdge = !isCorner;

  // Calculate handle dimensions for edge handles
  const handleWidth = isEdge && (position === 'n' || position === 's') ? EDGE_HANDLE_LENGTH : size;
  const handleHeight = isEdge && (position === 'e' || position === 'w') ? EDGE_HANDLE_LENGTH : size;

  return (
    <div
      className={cn(
        'absolute',
        'bg-white border-2 border-[var(--ds-blue-600)]',
        'transition-all duration-100 ease-out',
        'hover:bg-[var(--ds-blue-100)] hover:scale-110',
        'active:bg-[var(--ds-blue-200)]',
        isCorner ? 'rounded-sm' : 'rounded-full',
        isActive && 'bg-[var(--ds-blue-200)] scale-110',
        'motion-reduce:transition-none'
      )}
      style={{
        left: handlePos.x - handleWidth / 2,
        top: handlePos.y - handleHeight / 2,
        width: handleWidth,
        height: handleHeight,
        cursor: CURSOR_MAP[position],
        // Ensure handles are always visible
        zIndex: 60,
      }}
      onMouseDown={(e) => onMouseDown(e, position)}
      role="slider"
      aria-label={`Resize ${position}`}
      aria-valuenow={position === 'e' || position === 'w' ? bounds.width : bounds.height}
      tabIndex={0}
      onKeyDown={(e) => {
        // Allow keyboard resizing
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
          e.preventDefault();
          // Keyboard resize would be handled by parent
        }
      }}
    />
  );
};

// ============================================================================
// MAIN RESIZE HANDLES COMPONENT
// ============================================================================

export const ResizeHandles: React.FC<ResizeHandlesProps> = ({
  containerRef,
  elementRefs,
  transform,
  onResizeStart,
  onResize,
  onResizeEnd,
  className,
}) => {
  const selectedElementIds = useEditorStoreV2((state) => state.selectedElementIds);
  const page = useEditorStoreV2((state) => state.page);
  const isResizing = useEditorStoreV2((state) => state.isResizing);
  const resizeHandle = useEditorStoreV2((state) => state.resizeHandle);

  // Local state for resize operation
  const [resizeState, setResizeState] = React.useState<{
    elementId: string;
    handle: ResizeHandlePosition;
    startBounds: ElementBounds;
    startMousePos: { x: number; y: number };
    currentSize: { width: number; height: number };
    constraints: ResizeConstraints;
    originalAspectRatio: number;
  } | null>(null);

  const [shiftHeld, setShiftHeld] = React.useState(false);

  // Track shift key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Handle mouse down on resize handle
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent, position: ResizeHandlePosition, elementId: string, bounds: ElementBounds) => {
      e.preventDefault();
      e.stopPropagation();

      const element = page?.elements[elementId];
      if (!element) return;

      const constraints = getConstraintsFromElement(element);
      const originalAspectRatio = bounds.width / bounds.height;

      setResizeState({
        elementId,
        handle: position,
        startBounds: bounds,
        startMousePos: { x: e.clientX, y: e.clientY },
        currentSize: { width: bounds.width, height: bounds.height },
        constraints,
        originalAspectRatio,
      });

      onResizeStart?.(elementId, position);
    },
    [page, onResizeStart]
  );

  // Handle mouse move during resize
  React.useEffect(() => {
    if (!resizeState) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { handle, startBounds, startMousePos, constraints, originalAspectRatio } = resizeState;

      // Calculate delta in canvas coordinates
      const deltaX = (e.clientX - startMousePos.x) / transform.k;
      const deltaY = (e.clientY - startMousePos.y) / transform.k;

      let newWidth = startBounds.width;
      let newHeight = startBounds.height;
      let newX = startBounds.x;
      let newY = startBounds.y;

      // Apply delta based on handle position
      switch (handle) {
        case 'e':
          newWidth = startBounds.width + deltaX;
          break;
        case 'w':
          newWidth = startBounds.width - deltaX;
          newX = startBounds.x + deltaX;
          break;
        case 's':
          newHeight = startBounds.height + deltaY;
          break;
        case 'n':
          newHeight = startBounds.height - deltaY;
          newY = startBounds.y + deltaY;
          break;
        case 'se':
          newWidth = startBounds.width + deltaX;
          newHeight = startBounds.height + deltaY;
          break;
        case 'sw':
          newWidth = startBounds.width - deltaX;
          newHeight = startBounds.height + deltaY;
          newX = startBounds.x + deltaX;
          break;
        case 'ne':
          newWidth = startBounds.width + deltaX;
          newHeight = startBounds.height - deltaY;
          newY = startBounds.y + deltaY;
          break;
        case 'nw':
          newWidth = startBounds.width - deltaX;
          newHeight = startBounds.height - deltaY;
          newX = startBounds.x + deltaX;
          newY = startBounds.y + deltaY;
          break;
      }

      // Apply constraints (including aspect ratio if shift is held or element has fixed ratio)
      const maintainAspectRatio = shiftHeld || constraints.aspectRatio !== undefined;
      const { width: constrainedWidth, height: constrainedHeight } = applyConstraints(
        newWidth,
        newHeight,
        constraints,
        maintainAspectRatio,
        constraints.aspectRatio ?? originalAspectRatio
      );

      // Adjust position if width/height changed due to constraints
      if (handle.includes('w')) {
        newX = startBounds.x + startBounds.width - constrainedWidth;
      }
      if (handle.includes('n')) {
        newY = startBounds.y + startBounds.height - constrainedHeight;
      }

      setResizeState((prev) =>
        prev
          ? {
              ...prev,
              currentSize: { width: constrainedWidth, height: constrainedHeight },
            }
          : null
      );

      onResize?.(
        resizeState.elementId,
        { width: constrainedWidth, height: constrainedHeight },
        { x: newX, y: newY }
      );
    };

    const handleMouseUp = () => {
      if (resizeState) {
        onResizeEnd?.(resizeState.elementId);
      }
      setResizeState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeState, transform, shiftHeld, onResize, onResizeEnd]);

  // Only show handles for single selection
  if (selectedElementIds.length !== 1) return null;

  const selectedId = selectedElementIds[0];
  const elementRef = elementRefs.get(selectedId);

  if (!containerRef.current || !elementRef || !page) return null;

  const bounds = getElementBounds(elementRef, containerRef.current, transform);
  const element = page.elements[selectedId];

  // Don't show handles for locked elements
  if (element?.locked) return null;

  // Current size (either from resize state or bounds)
  const currentSize = resizeState?.currentSize ?? { width: bounds.width, height: bounds.height };

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none overflow-visible', className)}
      aria-label="Resize handles"
      role="group"
    >
      {/* Render all 8 handles */}
      {HANDLE_POSITIONS.map((position) => (
        <Handle
          key={position}
          position={position}
          bounds={bounds}
          transform={transform}
          onMouseDown={(e, pos) => handleMouseDown(e, pos, selectedId, bounds)}
          isResizing={!!resizeState}
          activeHandle={resizeState?.handle ?? null}
        />
      ))}

      {/* Size tooltip during resize */}
      <SizeTooltip
        width={currentSize.width}
        height={currentSize.height}
        bounds={bounds}
        transform={transform}
        visible={!!resizeState}
      />
    </div>
  );
};

export default ResizeHandles;
