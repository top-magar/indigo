// Editor Types - Core type definitions for the visual editor system

import type { StoreBlock, BlockType } from "@/types/blocks"
import type { Guide } from "./guides"

// Message types for editor <-> preview communication
export type EditorMessageType =
  | "EDITOR_READY"
  | "PREVIEW_READY"
  | "BLOCKS_UPDATE"
  | "SELECT_BLOCK"
  | "HIGHLIGHT_BLOCK"
  | "SCROLL_TO_BLOCK"
  | "PREVIEW_CLICK"
  | "PREVIEW_HOVER"
  // Inline editing messages
  | "INLINE_EDIT_START"    // Preview -> Editor: User started inline editing
  | "INLINE_EDIT_CHANGE"   // Preview -> Editor: Text content changed
  | "INLINE_EDIT_END"      // Preview -> Editor: User finished editing
  | "INLINE_EDIT_CANCEL"   // Preview -> Editor: User cancelled (Escape)
  | "FIELD_VALUE_UPDATE"   // Editor -> Preview: Settings panel changed a field
  // Block action messages
  | "BLOCK_MOVE_UP"        // Preview -> Editor: Move block up
  | "BLOCK_MOVE_DOWN"      // Preview -> Editor: Move block down
  | "BLOCK_DUPLICATE"      // Preview -> Editor: Duplicate block
  | "BLOCK_DELETE"         // Preview -> Editor: Delete block
  | "BLOCK_ADD_BELOW"      // Preview -> Editor: Add block below

export interface EditorMessage<T = unknown> {
  type: EditorMessageType
  source: "editor" | "preview"
  payload: T
}

export interface BlocksUpdatePayload {
  blocks: StoreBlock[]
  selectedBlockId: string | null
}

export interface SelectBlockPayload {
  blockId: string | null
}

export interface HighlightBlockPayload {
  blockId: string | null
}

export interface ScrollToBlockPayload {
  blockId: string
}

export interface PreviewClickPayload {
  blockId: string
  blockType: BlockType
}

export interface PreviewHoverPayload {
  blockId: string | null
}

// Inline editing payloads
export interface InlineEditStartPayload {
  blockId: string
  fieldPath: string        // e.g., "headline", "settings.items[0].title"
  originalValue: string
}

export interface InlineEditChangePayload {
  blockId: string
  fieldPath: string
  value: string
}

export interface InlineEditEndPayload {
  blockId: string
  fieldPath: string
  value: string
  originalValue: string    // For undo history
}

export interface InlineEditCancelPayload {
  blockId: string
  fieldPath: string
  originalValue: string
}

export interface FieldValueUpdatePayload {
  blockId: string
  fieldPath: string
  value: string
}

// Block action payloads
export interface BlockActionPayload {
  blockId: string
}

// Inline edit state
export interface InlineEditState {
  blockId: string
  fieldPath: string
  originalValue: string
}

// Autosave status type
export type AutosaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

// Clipboard block type for in-memory clipboard state
// Requirements 3.2, 3.5, 3.7
export interface ClipboardBlockState {
  type: string
  variant: string
  settings: Record<string, unknown>
  visible: boolean
  copiedAt: number
}

// Editor mode and viewport types
export type EditorMode = 'edit' | 'preview'
export type Viewport = 'mobile' | 'tablet' | 'desktop'

// Focus mode - for editing a single block in isolation
export interface FocusModeState {
  blockId: string
  enteredAt: number
}

// Viewport configuration
export const VIEWPORT_CONFIG = {
  mobile: { width: 375, height: 812, label: 'Mobile' },
  tablet: { width: 768, height: 1024, label: 'Tablet' },
  desktop: { width: 1440, height: 900, label: 'Desktop' },
} as const

// Responsive visibility settings per viewport
export interface ResponsiveVisibility {
  mobile: boolean
  tablet: boolean
  desktop: boolean
}

// Copied styles for paste-style feature
export interface CopiedStyles {
  settings: Record<string, unknown>
  copiedAt: number
  sourceBlockType: string
}

// Editor state
export interface EditorState {
  blocks: StoreBlock[]
  selectedBlockId: string | null
  selectedBlockIds: string[] // Multi-select support
  hoveredBlockId: string | null
  isDirty: boolean
  /**
   * isPreviewReady is ONLY used for LivePreview (iframe) mode.
   * InlinePreview reads directly from store - no ready state needed.
   * Kept for backward compatibility with LivePreview.
   * Requirements 6.1, 6.2: InlinePreview should not use postMessage communication.
   */
  isPreviewReady: boolean
  history: {
    past: StoreBlock[][]
    future: StoreBlock[][]
  }
  inlineEdit: InlineEditState | null
  // New state for inline preview
  editorMode: EditorMode
  viewport: Viewport
  // Drag state for synchronization between layers panel and inline preview
  activeDragId: string | null
  overBlockId: string | null
  // Autosave state - Requirements 1.4, 1.5, 1.6
  autosaveStatus: AutosaveStatus
  lastAutosaveAt: Date | null
  autosaveError: string | null
  // Clipboard state - Requirements 3.2, 3.5, 3.7
  clipboardBlock: ClipboardBlockState | null
  // Focus mode - for editing a single block in isolation
  focusMode: FocusModeState | null
  // Smart guides - for alignment during drag
  activeGuides: Guide[]
  snappingEnabled: boolean
  // Copied styles for paste-style feature
  copiedStyles: CopiedStyles | null
}

// Selection mode for multi-select
export type SelectionMode = 'replace' | 'add' | 'toggle'

export interface EditorActions {
  setBlocks: (blocks: StoreBlock[]) => void
  selectBlock: (blockId: string | null, mode?: SelectionMode) => void
  selectBlocks: (blockIds: string[]) => void
  addToSelection: (blockId: string) => void
  removeFromSelection: (blockId: string) => void
  toggleSelection: (blockId: string) => void
  clearSelection: () => void
  selectAll: () => void
  hoverBlock: (blockId: string | null) => void
  updateBlock: (blockId: string, updates: Record<string, unknown>) => void
  updateBlockSettings: (blockId: string, settings: Record<string, unknown>) => void
  changeBlockVariant: (blockId: string, variant: string) => void
  toggleBlockVisibility: (blockId: string) => void
  moveBlock: (fromIndex: number, toIndex: number) => void
  addBlock: (block: StoreBlock) => void
  addBlockByType: (type: BlockType, variant: string) => void
  removeBlock: (blockId: string) => void
  duplicateBlock: (blockId: string) => void
  // Bulk operations for multi-select
  duplicateSelectedBlocks: () => void
  removeSelectedBlocks: () => void
  moveSelectedBlocks: (direction: 'up' | 'down') => void
  undo: () => void
  redo: () => void
  /**
   * setPreviewReady is ONLY used for LivePreview (iframe) mode.
   * InlinePreview reads directly from store - no ready state needed.
   * Kept for backward compatibility with LivePreview.
   * Requirements 6.1, 6.2: InlinePreview should not use postMessage communication.
   */
  setPreviewReady: (ready: boolean) => void
  markClean: () => void
  // Inline editing actions
  startInlineEdit: (blockId: string, fieldPath: string, originalValue: string) => void
  updateInlineEdit: (value: string) => void
  endInlineEdit: (save: boolean) => void
  // New actions for inline preview
  setEditorMode: (mode: EditorMode) => void
  setViewport: (viewport: Viewport) => void
  // Drag state actions for synchronization
  setActiveDragId: (blockId: string | null) => void
  setOverBlockId: (blockId: string | null) => void
  // Autosave actions - Requirements 1.4, 1.5, 1.6
  setAutosaveStatus: (status: AutosaveStatus, lastSavedAt?: Date | null, error?: string | null) => void
  // Clipboard actions - Requirements 3.2, 3.5, 3.7
  copyBlock: (blockId: string) => void
  pasteBlock: () => void
  setClipboardBlock: (block: ClipboardBlockState | null) => void
  // Focus mode actions
  enterFocusMode: (blockId: string) => void
  exitFocusMode: () => void
  // Smart guides actions
  setActiveGuides: (guides: Guide[]) => void
  clearGuides: () => void
  setSnappingEnabled: (enabled: boolean) => void
  toggleSnapping: () => void
  // Nested block actions (Hybrid Architecture)
  addBlockToContainer: (containerId: string, block: StoreBlock, index?: number) => void
  moveBlockToContainer: (blockId: string, targetContainerId: string, index?: number) => void
  moveBlockWithinContainer: (containerId: string, fromIndex: number, toIndex: number) => void
  removeBlockFromContainer: (containerId: string, blockId: string) => void
  // Block locking
  toggleBlockLock: (blockId: string) => void
  lockSelectedBlocks: () => void
  unlockSelectedBlocks: () => void
  // Block grouping
  groupSelectedBlocks: () => void
  ungroupBlock: (groupId: string) => void
  // Copy/paste styles
  copyBlockStyles: (blockId: string) => void
  pasteBlockStyles: (blockId: string) => void
  // Responsive visibility
  setBlockResponsiveVisibility: (blockId: string, visibility: ResponsiveVisibility) => void
  // Custom CSS class
  setBlockCustomClass: (blockId: string, className: string) => void
}

export type EditorStore = EditorState & EditorActions
