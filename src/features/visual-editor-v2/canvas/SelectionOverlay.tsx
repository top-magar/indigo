'use client';

/**
 * Visual Editor V2 - Selection Overlay
 *
 * Shows selection box around selected elements with:
 * - Blue border around selected elements
 * - Multi-selection support (bounding box around all selected)
 * - Element dimensions on hover
 * - Smooth animations for selection changes
 */

import * as React from 'react';
import { useEditorStoreV2 } from '../store/editor-store';
import type { VisualElement } from '../types/element';
import { cn } from '@/shared/utils';

// ============================================================================
// TYPES
// ============================================================================

interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectionOverlayProps {
  /** Container element ref for calculating positions */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Map of element IDs to their DOM refs */
  elementRefs: Map<string, HTMLElement>;
  /** Current canvas transform */
  transform: { x: number; y: number; k: number };
  /** Optional class name */
  className?: string;
}

interface DimensionLabelProps {
  bounds: ElementBounds;
  transform: { x: number; y: number; k: number };
  visible: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SELECTION_COLOR = 'var(--ds-blue-600)';
const SELECTION_COLOR_LIGHT = 'var(--ds-blue-100)';
const HOVER_COLOR = 'var(--ds-blue-400)';
const MULTI_SELECTION_COLOR = 'var(--ds-blue-500)';

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

  // Calculate position relative to container, accounting for transform
  const x = (elementRect.left - containerRect.left - transform.x) / transform.k;
  const y = (elementRect.top - containerRect.top - transform.y) / transform.k;
  const width = elementRect.width / transform.k;
  const height = elementRect.height / transform.k;

  return { x, y, width, height };
}

/**
 * Calculate the bounding box that contains all given bounds
 */
function getMultiSelectionBounds(boundsList: ElementBounds[]): ElementBounds | null {
  if (boundsList.length === 0) return null;
  if (boundsList.length === 1) return boundsList[0];

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const bounds of boundsList) {
    minX = Math.min(minX, bounds.x);
    minY = Math.min(minY, bounds.y);
    maxX = Math.max(maxX, bounds.x + bounds.width);
    maxY = Math.max(maxY, bounds.y + bounds.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Format dimension value for display
 */
function formatDimension(value: number): string {
  return Math.round(value).toString();
}

// ============================================================================
// DIMENSION LABEL COMPONENT
// ============================================================================

const DimensionLabel: React.FC<DimensionLabelProps> = ({
  bounds,
  transform,
  visible,
}) => {
  if (!visible) return null;

  const labelText = `${formatDimension(bounds.width)} × ${formatDimension(bounds.height)}`;

  return (
    <div
      className={cn(
        'absolute pointer-events-none z-50',
        'px-2 py-1 rounded-md text-xs font-medium tabular-nums',
        'bg-[var(--ds-blue-600)] text-white',
        'shadow-sm',
        'transition-opacity duration-150',
        visible ? 'opacity-100' : 'opacity-0',
        'motion-reduce:transition-none'
      )}
      style={{
        left: bounds.x * transform.k + transform.x,
        top: (bounds.y + bounds.height) * transform.k + transform.y + 8,
        transform: 'translateX(-50%)',
        marginLeft: (bounds.width * transform.k) / 2,
      }}
    >
      {labelText}
    </div>
  );
};

// ============================================================================
// SINGLE SELECTION BOX COMPONENT
// ============================================================================

interface SelectionBoxProps {
  bounds: ElementBounds;
  transform: { x: number; y: number; k: number };
  isMultiSelection?: boolean;
  showDimensions?: boolean;
  element?: VisualElement;
}

const SelectionBox: React.FC<SelectionBoxProps> = ({
  bounds,
  transform,
  isMultiSelection = false,
  showDimensions = false,
  element,
}) => {
  const borderColor = isMultiSelection ? MULTI_SELECTION_COLOR : SELECTION_COLOR;

  return (
    <>
      {/* Selection border */}
      <div
        className={cn(
          'absolute pointer-events-none',
          'border-2 rounded-sm',
          'transition-all duration-150 ease-out',
          'motion-reduce:transition-none'
        )}
        style={{
          left: bounds.x * transform.k + transform.x,
          top: bounds.y * transform.k + transform.y,
          width: bounds.width * transform.k,
          height: bounds.height * transform.k,
          borderColor,
        }}
        aria-hidden="true"
      />

      {/* Element name label (top-left) */}
      {element && !isMultiSelection && (
        <div
          className={cn(
            'absolute pointer-events-none z-50',
            'px-1.5 py-0.5 rounded-sm text-[10px] font-medium',
            'bg-[var(--ds-blue-600)] text-white',
            'whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]',
            'transition-opacity duration-150',
            'motion-reduce:transition-none'
          )}
          style={{
            left: bounds.x * transform.k + transform.x,
            top: bounds.y * transform.k + transform.y - 20,
          }}
        >
          {element.name}
        </div>
      )}

      {/* Dimension label */}
      <DimensionLabel bounds={bounds} transform={transform} visible={showDimensions} />
    </>
  );
};

// ============================================================================
// HOVER OVERLAY COMPONENT
// ============================================================================

interface HoverOverlayProps {
  bounds: ElementBounds;
  transform: { x: number; y: number; k: number };
  element?: VisualElement;
}

const HoverOverlay: React.FC<HoverOverlayProps> = ({ bounds, transform, element }) => {
  return (
    <>
      {/* Hover border */}
      <div
        className={cn(
          'absolute pointer-events-none',
          'border border-dashed rounded-sm',
          'transition-all duration-100 ease-out',
          'motion-reduce:transition-none'
        )}
        style={{
          left: bounds.x * transform.k + transform.x,
          top: bounds.y * transform.k + transform.y,
          width: bounds.width * transform.k,
          height: bounds.height * transform.k,
          borderColor: HOVER_COLOR,
        }}
        aria-hidden="true"
      />

      {/* Hover element name */}
      {element && (
        <div
          className={cn(
            'absolute pointer-events-none z-40',
            'px-1.5 py-0.5 rounded-sm text-[10px] font-medium',
            'bg-[var(--ds-blue-400)] text-white',
            'whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]',
            'transition-opacity duration-100',
            'motion-reduce:transition-none'
          )}
          style={{
            left: bounds.x * transform.k + transform.x,
            top: bounds.y * transform.k + transform.y - 18,
          }}
        >
          {element.name}
        </div>
      )}
    </>
  );
};

// ============================================================================
// MULTI-SELECTION BOX COMPONENT
// ============================================================================

interface MultiSelectionBoxProps {
  bounds: ElementBounds;
  transform: { x: number; y: number; k: number };
  count: number;
}

const MultiSelectionBox: React.FC<MultiSelectionBoxProps> = ({
  bounds,
  transform,
  count,
}) => {
  return (
    <>
      {/* Outer bounding box */}
      <div
        className={cn(
          'absolute pointer-events-none',
          'border-2 border-dashed rounded-sm',
          'transition-all duration-150 ease-out',
          'motion-reduce:transition-none'
        )}
        style={{
          left: bounds.x * transform.k + transform.x - 4,
          top: bounds.y * transform.k + transform.y - 4,
          width: bounds.width * transform.k + 8,
          height: bounds.height * transform.k + 8,
          borderColor: MULTI_SELECTION_COLOR,
        }}
        aria-hidden="true"
      />

      {/* Selection count badge */}
      <div
        className={cn(
          'absolute pointer-events-none z-50',
          'px-2 py-0.5 rounded-full text-[10px] font-semibold',
          'bg-[var(--ds-blue-600)] text-white',
          'transition-all duration-150',
          'motion-reduce:transition-none'
        )}
        style={{
          left: bounds.x * transform.k + transform.x - 4,
          top: bounds.y * transform.k + transform.y - 24,
        }}
      >
        {count} selected
      </div>
    </>
  );
};

// ============================================================================
// SELECTION BOX DRAG COMPONENT (for marquee selection)
// ============================================================================

interface SelectionBoxDragProps {
  transform: { x: number; y: number; k: number };
}

const SelectionBoxDrag: React.FC<SelectionBoxDragProps> = ({ transform }) => {
  const selectionBox = useEditorStoreV2((state) => state.canvas.selectionBox);

  if (!selectionBox.active) return null;

  const x = Math.min(selectionBox.start.x, selectionBox.end.x);
  const y = Math.min(selectionBox.start.y, selectionBox.end.y);
  const width = Math.abs(selectionBox.end.x - selectionBox.start.x);
  const height = Math.abs(selectionBox.end.y - selectionBox.start.y);

  return (
    <div
      className={cn(
        'absolute pointer-events-none',
        'border border-[var(--ds-blue-500)]',
        'bg-[var(--ds-blue-100)]/30',
        'rounded-sm'
      )}
      style={{
        left: x * transform.k + transform.x,
        top: y * transform.k + transform.y,
        width: width * transform.k,
        height: height * transform.k,
      }}
      aria-hidden="true"
    />
  );
};

// ============================================================================
// MAIN SELECTION OVERLAY COMPONENT
// ============================================================================

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  containerRef,
  elementRefs,
  transform,
  className,
}) => {
  const selectedElementIds = useEditorStoreV2((state) => state.selectedElementIds);
  const hoveredElementId = useEditorStoreV2((state) => state.hoveredElementId);
  const page = useEditorStoreV2((state) => state.page);
  const isResizing = useEditorStoreV2((state) => state.isResizing);
  const isDragging = useEditorStoreV2((state) => state.isDragging);

  // Calculate bounds for selected elements
  const selectedBounds = React.useMemo(() => {
    if (!containerRef.current || !page) return [];

    return selectedElementIds
      .map((id) => {
        const element = elementRefs.get(id);
        if (!element) return null;

        return {
          id,
          bounds: getElementBounds(element, containerRef.current!, transform),
          element: page.elements[id],
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [selectedElementIds, elementRefs, containerRef, transform, page]);

  // Calculate hover bounds
  const hoverBounds = React.useMemo(() => {
    if (
      !containerRef.current ||
      !hoveredElementId ||
      !page ||
      selectedElementIds.includes(hoveredElementId)
    ) {
      return null;
    }

    const element = elementRefs.get(hoveredElementId);
    if (!element) return null;

    return {
      bounds: getElementBounds(element, containerRef.current, transform),
      element: page.elements[hoveredElementId],
    };
  }, [hoveredElementId, elementRefs, containerRef, transform, page, selectedElementIds]);

  // Calculate multi-selection bounding box
  const multiSelectionBounds = React.useMemo(() => {
    if (selectedBounds.length <= 1) return null;
    return getMultiSelectionBounds(selectedBounds.map((s) => s.bounds));
  }, [selectedBounds]);

  // Show dimensions when resizing or dragging
  const showDimensions = isResizing || isDragging;

  return (
    <div
      className={cn('absolute inset-0 pointer-events-none overflow-hidden', className)}
      aria-label="Selection overlay"
      role="presentation"
    >
      {/* Hover overlay (shown when not selected) */}
      {hoverBounds && (
        <HoverOverlay
          bounds={hoverBounds.bounds}
          transform={transform}
          element={hoverBounds.element}
        />
      )}

      {/* Individual selection boxes */}
      {selectedBounds.map(({ id, bounds, element }) => (
        <SelectionBox
          key={id}
          bounds={bounds}
          transform={transform}
          isMultiSelection={selectedBounds.length > 1}
          showDimensions={showDimensions && selectedBounds.length === 1}
          element={element}
        />
      ))}

      {/* Multi-selection bounding box */}
      {multiSelectionBounds && (
        <MultiSelectionBox
          bounds={multiSelectionBounds}
          transform={transform}
          count={selectedBounds.length}
        />
      )}

      {/* Marquee selection box */}
      <SelectionBoxDrag transform={transform} />
    </div>
  );
};

export default SelectionOverlay;
