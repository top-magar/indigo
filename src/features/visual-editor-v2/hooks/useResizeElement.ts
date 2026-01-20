'use client';

/**
 * Visual Editor V2 - useResizeElement Hook
 *
 * Hook for managing element resize operations with store integration.
 * Handles resize state, constraints, and element updates.
 */

import * as React from 'react';
import { useEditorStoreV2 } from '../store/editor-store';
import type { ResizeHandlePosition } from '../canvas/ResizeHandles';
import type { VisualElement, SizeValue } from '../types/element';

// ============================================================================
// TYPES
// ============================================================================

interface UseResizeElementOptions {
  /** Callback when resize starts */
  onResizeStart?: (elementId: string, handle: ResizeHandlePosition) => void;
  /** Callback when resize ends */
  onResizeEnd?: (elementId: string) => void;
}

interface UseResizeElementReturn {
  /** Whether an element is currently being resized */
  isResizing: boolean;
  /** The currently active resize handle */
  activeHandle: ResizeHandlePosition | null;
  /** Start a resize operation */
  startResize: (elementId: string, handle: ResizeHandlePosition) => void;
  /** Update element size during resize */
  updateSize: (
    elementId: string,
    newSize: { width: number; height: number },
    newPosition?: { x: number; y: number }
  ) => void;
  /** End the resize operation */
  endResize: (elementId: string) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert a numeric size to a SizeValue
 */
function toSizeValue(value: number): SizeValue {
  return value;
}

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useResizeElement(options: UseResizeElementOptions = {}): UseResizeElementReturn {
  const { onResizeStart, onResizeEnd } = options;

  const updateElement = useEditorStoreV2((state) => state.updateElement);
  const pushHistory = useEditorStoreV2((state) => state.pushHistory);

  const [isResizing, setIsResizing] = React.useState(false);
  const [activeHandle, setActiveHandle] = React.useState<ResizeHandlePosition | null>(null);

  // Track if we've pushed history for this resize operation
  const historyPushedRef = React.useRef(false);

  const startResize = React.useCallback(
    (elementId: string, handle: ResizeHandlePosition) => {
      // Push history before starting resize (only once per operation)
      if (!historyPushedRef.current) {
        pushHistory();
        historyPushedRef.current = true;
      }

      setIsResizing(true);
      setActiveHandle(handle);
      onResizeStart?.(elementId, handle);
    },
    [pushHistory, onResizeStart]
  );

  const updateSize = React.useCallback(
    (
      elementId: string,
      newSize: { width: number; height: number },
      newPosition?: { x: number; y: number }
    ) => {
      const updates: Partial<VisualElement> = {
        size: {
          width: toSizeValue(newSize.width),
          height: toSizeValue(newSize.height),
        },
      };

      // Update position if provided (for handles that move the element)
      if (newPosition) {
        updates.position = {
          type: 'absolute',
          left: newPosition.x,
          top: newPosition.y,
          constraints: {
            horizontal: 'left',
            vertical: 'top',
          },
        };
      }

      updateElement(elementId, updates);
    },
    [updateElement]
  );

  const endResize = React.useCallback(
    (elementId: string) => {
      setIsResizing(false);
      setActiveHandle(null);
      historyPushedRef.current = false;
      onResizeEnd?.(elementId);
    },
    [onResizeEnd]
  );

  return {
    isResizing,
    activeHandle,
    startResize,
    updateSize,
    endResize,
  };
}

export default useResizeElement;
