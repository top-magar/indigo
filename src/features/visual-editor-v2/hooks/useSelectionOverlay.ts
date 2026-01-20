'use client';

/**
 * Visual Editor V2 - useSelectionOverlay Hook
 *
 * Hook for managing selection overlay state and element bounds calculation.
 * Provides utilities for tracking element positions and selection state.
 */

import * as React from 'react';
import { useEditorStoreV2 } from '../store/editor-store';
import type { VisualElement } from '../types/element';

// ============================================================================
// TYPES
// ============================================================================

interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface SelectionInfo {
  id: string;
  bounds: ElementBounds;
  element: VisualElement;
}

interface UseSelectionOverlayOptions {
  /** Container element ref for calculating positions */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Map of element IDs to their DOM refs */
  elementRefs: Map<string, HTMLElement>;
  /** Current canvas transform */
  transform: { x: number; y: number; k: number };
}

interface UseSelectionOverlayReturn {
  /** Currently selected elements with their bounds */
  selectedElements: SelectionInfo[];
  /** Currently hovered element with bounds (if not selected) */
  hoveredElement: SelectionInfo | null;
  /** Bounding box containing all selected elements */
  multiSelectionBounds: ElementBounds | null;
  /** Whether any element is selected */
  hasSelection: boolean;
  /** Whether multiple elements are selected */
  isMultiSelection: boolean;
  /** Get bounds for a specific element */
  getElementBounds: (elementId: string) => ElementBounds | null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the bounding box of an element relative to the container
 */
function calculateElementBounds(
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
 * Calculate the bounding box that contains all given bounds
 */
function calculateMultiSelectionBounds(boundsList: ElementBounds[]): ElementBounds | null {
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

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useSelectionOverlay({
  containerRef,
  elementRefs,
  transform,
}: UseSelectionOverlayOptions): UseSelectionOverlayReturn {
  const selectedElementIds = useEditorStoreV2((state) => state.selectedElementIds);
  const hoveredElementId = useEditorStoreV2((state) => state.hoveredElementId);
  const page = useEditorStoreV2((state) => state.page);

  // Get bounds for a specific element
  const getElementBounds = React.useCallback(
    (elementId: string): ElementBounds | null => {
      if (!containerRef.current) return null;

      const element = elementRefs.get(elementId);
      if (!element) return null;

      return calculateElementBounds(element, containerRef.current, transform);
    },
    [containerRef, elementRefs, transform]
  );

  // Calculate bounds for selected elements
  const selectedElements = React.useMemo((): SelectionInfo[] => {
    if (!containerRef.current || !page) return [];

    return selectedElementIds
      .map((id) => {
        const domElement = elementRefs.get(id);
        const visualElement = page.elements[id];

        if (!domElement || !visualElement) return null;

        return {
          id,
          bounds: calculateElementBounds(domElement, containerRef.current!, transform),
          element: visualElement,
        };
      })
      .filter((item): item is SelectionInfo => item !== null);
  }, [selectedElementIds, elementRefs, containerRef, transform, page]);

  // Calculate hover element info
  const hoveredElement = React.useMemo((): SelectionInfo | null => {
    if (
      !containerRef.current ||
      !hoveredElementId ||
      !page ||
      selectedElementIds.includes(hoveredElementId)
    ) {
      return null;
    }

    const domElement = elementRefs.get(hoveredElementId);
    const visualElement = page.elements[hoveredElementId];

    if (!domElement || !visualElement) return null;

    return {
      id: hoveredElementId,
      bounds: calculateElementBounds(domElement, containerRef.current, transform),
      element: visualElement,
    };
  }, [hoveredElementId, elementRefs, containerRef, transform, page, selectedElementIds]);

  // Calculate multi-selection bounding box
  const multiSelectionBounds = React.useMemo((): ElementBounds | null => {
    if (selectedElements.length <= 1) return null;
    return calculateMultiSelectionBounds(selectedElements.map((s) => s.bounds));
  }, [selectedElements]);

  return {
    selectedElements,
    hoveredElement,
    multiSelectionBounds,
    hasSelection: selectedElements.length > 0,
    isMultiSelection: selectedElements.length > 1,
    getElementBounds,
  };
}

export default useSelectionOverlay;
