/**
 * Smart Guides System
 * 
 * Provides alignment guides and snapping functionality for the visual editor.
 * Shows guides when dragging blocks to help align with other blocks.
 */

// Guide types
export type GuideType = 'edge' | 'center' | 'spacing'
export type GuideAxis = 'horizontal' | 'vertical'

export interface Guide {
  id: string
  type: GuideType
  axis: GuideAxis
  position: number // px from top (horizontal) or left (vertical)
  start: number // start of the guide line
  end: number // end of the guide line
  sourceBlockId: string
  label?: string // e.g., "12px" for spacing guides
}

export interface BlockBounds {
  id: string
  top: number
  left: number
  right: number
  bottom: number
  width: number
  height: number
  centerX: number
  centerY: number
}

export interface SnapResult {
  guides: Guide[]
  snapX: number | null
  snapY: number | null
  deltaX: number
  deltaY: number
}

// Configuration
const SNAP_THRESHOLD = 8 // px - distance to trigger snapping
const GUIDE_EXTENSION = 20 // px - how far guides extend beyond blocks

/**
 * Calculate bounds for a block element
 */
export function getBlockBounds(element: HTMLElement, blockId: string): BlockBounds {
  const rect = element.getBoundingClientRect()
  return {
    id: blockId,
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  }
}

/**
 * Get bounds for all blocks in the editor
 */
export function getAllBlockBounds(
  container: HTMLElement,
  excludeBlockId?: string
): BlockBounds[] {
  const blockElements = container.querySelectorAll('[data-block-id]')
  const bounds: BlockBounds[] = []

  blockElements.forEach((el) => {
    const blockId = el.getAttribute('data-block-id')
    if (blockId && blockId !== excludeBlockId) {
      bounds.push(getBlockBounds(el as HTMLElement, blockId))
    }
  })

  return bounds
}

/**
 * Calculate guides and snap positions for a dragging block
 */
export function calculateGuides(
  dragBounds: BlockBounds,
  otherBounds: BlockBounds[],
  containerBounds: DOMRect
): SnapResult {
  const guides: Guide[] = []
  let snapX: number | null = null
  let snapY: number | null = null
  let deltaX = 0
  let deltaY = 0

  // Container edges (relative to container)
  const containerLeft = containerBounds.left
  const containerRight = containerBounds.right
  const containerCenterX = containerBounds.left + containerBounds.width / 2

  // Check container center alignment (vertical guide)
  const distToContainerCenter = Math.abs(dragBounds.centerX - containerCenterX)
  if (distToContainerCenter < SNAP_THRESHOLD) {
    guides.push({
      id: 'container-center',
      type: 'center',
      axis: 'vertical',
      position: containerCenterX - containerBounds.left,
      start: 0,
      end: containerBounds.height,
      sourceBlockId: 'container',
    })
    snapX = containerCenterX
    deltaX = containerCenterX - dragBounds.centerX
  }

  // Check alignment with other blocks
  for (const other of otherBounds) {
    // Skip if blocks are too far apart vertically (not relevant for horizontal alignment)
    const verticalOverlap = !(dragBounds.bottom < other.top - 100 || dragBounds.top > other.bottom + 100)
    
    if (verticalOverlap) {
      // Left edge alignment
      const distLeftToLeft = Math.abs(dragBounds.left - other.left)
      if (distLeftToLeft < SNAP_THRESHOLD && (snapX === null || distLeftToLeft < Math.abs(deltaX))) {
        guides.push({
          id: `left-${other.id}`,
          type: 'edge',
          axis: 'vertical',
          position: other.left - containerBounds.left,
          start: Math.min(dragBounds.top, other.top) - containerBounds.top - GUIDE_EXTENSION,
          end: Math.max(dragBounds.bottom, other.bottom) - containerBounds.top + GUIDE_EXTENSION,
          sourceBlockId: other.id,
        })
        snapX = other.left
        deltaX = other.left - dragBounds.left
      }

      // Right edge alignment
      const distRightToRight = Math.abs(dragBounds.right - other.right)
      if (distRightToRight < SNAP_THRESHOLD && (snapX === null || distRightToRight < Math.abs(deltaX))) {
        guides.push({
          id: `right-${other.id}`,
          type: 'edge',
          axis: 'vertical',
          position: other.right - containerBounds.left,
          start: Math.min(dragBounds.top, other.top) - containerBounds.top - GUIDE_EXTENSION,
          end: Math.max(dragBounds.bottom, other.bottom) - containerBounds.top + GUIDE_EXTENSION,
          sourceBlockId: other.id,
        })
        snapX = other.right - dragBounds.width
        deltaX = (other.right - dragBounds.width) - dragBounds.left
      }

      // Center alignment (vertical guide)
      const distCenterX = Math.abs(dragBounds.centerX - other.centerX)
      if (distCenterX < SNAP_THRESHOLD && (snapX === null || distCenterX < Math.abs(deltaX))) {
        guides.push({
          id: `center-x-${other.id}`,
          type: 'center',
          axis: 'vertical',
          position: other.centerX - containerBounds.left,
          start: Math.min(dragBounds.top, other.top) - containerBounds.top - GUIDE_EXTENSION,
          end: Math.max(dragBounds.bottom, other.bottom) - containerBounds.top + GUIDE_EXTENSION,
          sourceBlockId: other.id,
        })
        snapX = other.centerX - dragBounds.width / 2
        deltaX = (other.centerX - dragBounds.width / 2) - dragBounds.left
      }
    }

    // Horizontal guides (top/bottom/center alignment)
    const horizontalOverlap = !(dragBounds.right < other.left - 100 || dragBounds.left > other.right + 100)
    
    if (horizontalOverlap) {
      // Top edge alignment
      const distTopToTop = Math.abs(dragBounds.top - other.top)
      if (distTopToTop < SNAP_THRESHOLD && (snapY === null || distTopToTop < Math.abs(deltaY))) {
        guides.push({
          id: `top-${other.id}`,
          type: 'edge',
          axis: 'horizontal',
          position: other.top - containerBounds.top,
          start: Math.min(dragBounds.left, other.left) - containerBounds.left - GUIDE_EXTENSION,
          end: Math.max(dragBounds.right, other.right) - containerBounds.left + GUIDE_EXTENSION,
          sourceBlockId: other.id,
        })
        snapY = other.top
        deltaY = other.top - dragBounds.top
      }

      // Bottom edge alignment
      const distBottomToBottom = Math.abs(dragBounds.bottom - other.bottom)
      if (distBottomToBottom < SNAP_THRESHOLD && (snapY === null || distBottomToBottom < Math.abs(deltaY))) {
        guides.push({
          id: `bottom-${other.id}`,
          type: 'edge',
          axis: 'horizontal',
          position: other.bottom - containerBounds.top,
          start: Math.min(dragBounds.left, other.left) - containerBounds.left - GUIDE_EXTENSION,
          end: Math.max(dragBounds.right, other.right) - containerBounds.left + GUIDE_EXTENSION,
          sourceBlockId: other.id,
        })
        snapY = other.bottom - dragBounds.height
        deltaY = (other.bottom - dragBounds.height) - dragBounds.top
      }

      // Center alignment (horizontal guide)
      const distCenterY = Math.abs(dragBounds.centerY - other.centerY)
      if (distCenterY < SNAP_THRESHOLD && (snapY === null || distCenterY < Math.abs(deltaY))) {
        guides.push({
          id: `center-y-${other.id}`,
          type: 'center',
          axis: 'horizontal',
          position: other.centerY - containerBounds.top,
          start: Math.min(dragBounds.left, other.left) - containerBounds.left - GUIDE_EXTENSION,
          end: Math.max(dragBounds.right, other.right) - containerBounds.left + GUIDE_EXTENSION,
          sourceBlockId: other.id,
        })
        snapY = other.centerY - dragBounds.height / 2
        deltaY = (other.centerY - dragBounds.height / 2) - dragBounds.top
      }
    }

    // Spacing guides - show distance between blocks
    // Top of dragging block to bottom of other block (block above)
    if (dragBounds.top > other.bottom && dragBounds.top - other.bottom < 100) {
      const spacing = dragBounds.top - other.bottom
      guides.push({
        id: `spacing-above-${other.id}`,
        type: 'spacing',
        axis: 'horizontal',
        position: other.bottom - containerBounds.top + spacing / 2,
        start: Math.max(dragBounds.left, other.left) - containerBounds.left,
        end: Math.min(dragBounds.right, other.right) - containerBounds.left,
        sourceBlockId: other.id,
        label: `${Math.round(spacing)}px`,
      })
    }

    // Bottom of dragging block to top of other block (block below)
    if (other.top > dragBounds.bottom && other.top - dragBounds.bottom < 100) {
      const spacing = other.top - dragBounds.bottom
      guides.push({
        id: `spacing-below-${other.id}`,
        type: 'spacing',
        axis: 'horizontal',
        position: dragBounds.bottom - containerBounds.top + spacing / 2,
        start: Math.max(dragBounds.left, other.left) - containerBounds.left,
        end: Math.min(dragBounds.right, other.right) - containerBounds.left,
        sourceBlockId: other.id,
        label: `${Math.round(spacing)}px`,
      })
    }
  }

  // Deduplicate guides by position (keep unique positions)
  const uniqueGuides = guides.reduce((acc, guide) => {
    const key = `${guide.axis}-${Math.round(guide.position)}`
    if (!acc.has(key) || guide.type === 'center') {
      acc.set(key, guide)
    }
    return acc
  }, new Map<string, Guide>())

  return {
    guides: Array.from(uniqueGuides.values()),
    snapX,
    snapY,
    deltaX,
    deltaY,
  }
}

/**
 * Check if snapping is enabled (can be toggled with Alt key)
 */
export function isSnappingEnabled(event?: { altKey?: boolean }): boolean {
  // Alt key disables snapping temporarily
  return !event?.altKey
}
