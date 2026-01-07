// Editor Communication - postMessage bridge between editor and preview iframe
//
// IMPORTANT: This module is ONLY used for LivePreview (iframe) mode.
// InlinePreview reads directly from Editor Store - no postMessage needed.
// Requirements 6.1, 6.2: InlinePreview should not use postMessage communication.
//
// This module provides:
// - sendToPreview: Send messages from editor to preview iframe
// - sendToEditor: Send messages from preview iframe to editor
// - createPreviewListener: Create a listener for preview messages
// - createEditorListener: Create a listener for editor messages

import type {
  EditorMessage,
  EditorMessageType,
  BlocksUpdatePayload,
  SelectBlockPayload,
  HighlightBlockPayload,
  PreviewClickPayload,
  PreviewHoverPayload,
  InlineEditStartPayload,
  InlineEditChangePayload,
  InlineEditEndPayload,
  InlineEditCancelPayload,
  FieldValueUpdatePayload,
  BlockActionPayload,
} from "./types"

export type {
  BlocksUpdatePayload,
  SelectBlockPayload,
  HighlightBlockPayload,
  PreviewClickPayload,
  PreviewHoverPayload,
  InlineEditStartPayload,
  InlineEditChangePayload,
  InlineEditEndPayload,
  InlineEditCancelPayload,
  FieldValueUpdatePayload,
  BlockActionPayload,
}

const EDITOR_ORIGIN = typeof window !== "undefined" ? window.location.origin : ""

/**
 * Sync state management for error recovery
 * Tracks failed messages for retry on next content change
 */
interface SyncState {
  /** Whether the last sync attempt failed */
  lastSyncFailed: boolean
  /** The pending message to retry on next change */
  pendingMessage: EditorMessage | null
  /** Whether the parent frame connection is available */
  isConnected: boolean
}


// Global sync state for tracking failed syncs
const syncState: SyncState = {
  lastSyncFailed: false,
  pendingMessage: null,
  isConnected: true,
}

/**
 * Get the current sync state (for testing and debugging)
 */
export function getSyncState(): Readonly<SyncState> {
  return { ...syncState }
}

/**
 * Reset the sync state (useful for testing)
 */
export function resetSyncState(): void {
  syncState.lastSyncFailed = false
  syncState.pendingMessage = null
  syncState.isConnected = true
}

/**
 * Check if the parent frame connection is available
 */
export function isParentFrameAvailable(): boolean {
  if (typeof window === "undefined") return false
  if (window.parent === window) return false
  
  try {
    // Try to access parent - this will throw if cross-origin without permission
    // In same-origin iframe, this should work
    return window.parent !== null && window.parent !== undefined
  } catch {
    return false
  }
}

/**
 * Mark the connection as restored and attempt to sync pending message
 */
export function markConnectionRestored(): void {
  syncState.isConnected = true
  
  // If there's a pending message, try to send it
  if (syncState.pendingMessage) {
    const message = syncState.pendingMessage
    syncState.pendingMessage = null
    syncState.lastSyncFailed = false
    
    // Attempt to send the pending message
    sendToEditorInternal(message)
  }
}

// Validate message is from our editor system
export function isEditorMessage(event: MessageEvent): event is MessageEvent<EditorMessage> {
  if (event.origin !== EDITOR_ORIGIN) return false
  const data = event.data
  return (
    data &&
    typeof data === "object" &&
    "type" in data &&
    "source" in data &&
    (data.source === "editor" || data.source === "preview")
  )
}


// Send message from editor to preview iframe
export function sendToPreview(
  iframe: HTMLIFrameElement | null,
  type: EditorMessageType,
  payload: unknown
) {
  if (!iframe?.contentWindow) return

  const message: EditorMessage = {
    type,
    source: "editor",
    payload,
  }

  iframe.contentWindow.postMessage(message, EDITOR_ORIGIN)
}

// Send message from preview to parent editor
export function sendToEditor(type: EditorMessageType, payload: unknown): boolean {
  if (typeof window === "undefined" || window.parent === window) return false

  const message: EditorMessage = {
    type,
    source: "preview",
    payload,
  }

  return sendToEditorInternal(message)
}

/**
 * Internal function to send message to editor with error handling
 * Returns true if message was sent successfully, false otherwise
 */
function sendToEditorInternal(message: EditorMessage): boolean {
  try {
    // Check if parent frame is available
    if (!isParentFrameAvailable()) {
      syncState.isConnected = false
      syncState.lastSyncFailed = true
      syncState.pendingMessage = message
      return false
    }

    // Attempt to send the message
    window.parent.postMessage(message, EDITOR_ORIGIN)
    
    // Mark as successful
    syncState.lastSyncFailed = false
    syncState.isConnected = true
    
    // Clear any pending message since we just sent successfully
    if (syncState.pendingMessage?.type === message.type) {
      syncState.pendingMessage = null
    }
    
    return true
  } catch (error) {
    // Log error for debugging
    console.warn("[Editor Communication] Failed to send message:", error)
    
    // Mark sync as failed and store pending message for retry
    syncState.lastSyncFailed = true
    syncState.pendingMessage = message
    
    return false
  }
}


/**
 * Retry sending a failed sync message
 * Called automatically on next content change if previous sync failed
 * Returns true if retry was successful or no retry needed
 */
export function retrySyncIfNeeded(): boolean {
  if (!syncState.lastSyncFailed || !syncState.pendingMessage) {
    return true
  }

  // Attempt to send the pending message
  const success = sendToEditorInternal(syncState.pendingMessage)
  
  if (success) {
    syncState.pendingMessage = null
    syncState.lastSyncFailed = false
  }
  
  return success
}

/**
 * Check if there's a pending sync that needs to be retried
 */
export function hasPendingSync(): boolean {
  return syncState.lastSyncFailed && syncState.pendingMessage !== null
}

/**
 * Check if the connection to the parent frame is currently available
 */
export function isConnectionAvailable(): boolean {
  return syncState.isConnected
}

// Type-safe message creators
export const messages = {
  // Editor -> Preview
  blocksUpdate: (payload: BlocksUpdatePayload) => ({
    type: "BLOCKS_UPDATE" as const,
    payload,
  }),

  selectBlock: (payload: SelectBlockPayload) => ({
    type: "SELECT_BLOCK" as const,
    payload,
  }),

  highlightBlock: (payload: HighlightBlockPayload) => ({
    type: "HIGHLIGHT_BLOCK" as const,
    payload,
  }),

  editorReady: () => ({
    type: "EDITOR_READY" as const,
    payload: null,
  }),

  fieldValueUpdate: (payload: FieldValueUpdatePayload) => ({
    type: "FIELD_VALUE_UPDATE" as const,
    payload,
  }),

  // Preview -> Editor
  previewReady: () => ({
    type: "PREVIEW_READY" as const,
    payload: null,
  }),

  previewClick: (payload: PreviewClickPayload) => ({
    type: "PREVIEW_CLICK" as const,
    payload,
  }),

  previewHover: (payload: PreviewHoverPayload) => ({
    type: "PREVIEW_HOVER" as const,
    payload,
  }),

  // Inline editing messages (Preview -> Editor)
  inlineEditStart: (payload: InlineEditStartPayload) => ({
    type: "INLINE_EDIT_START" as const,
    payload,
  }),

  inlineEditChange: (payload: InlineEditChangePayload) => ({
    type: "INLINE_EDIT_CHANGE" as const,
    payload,
  }),

  inlineEditEnd: (payload: InlineEditEndPayload) => ({
    type: "INLINE_EDIT_END" as const,
    payload,
  }),

  inlineEditCancel: (payload: InlineEditCancelPayload) => ({
    type: "INLINE_EDIT_CANCEL" as const,
    payload,
  }),

  // Block action messages (Preview -> Editor)
  blockMoveUp: (payload: BlockActionPayload) => ({
    type: "BLOCK_MOVE_UP" as const,
    payload,
  }),

  blockMoveDown: (payload: BlockActionPayload) => ({
    type: "BLOCK_MOVE_DOWN" as const,
    payload,
  }),

  blockDuplicate: (payload: BlockActionPayload) => ({
    type: "BLOCK_DUPLICATE" as const,
    payload,
  }),

  blockDelete: (payload: BlockActionPayload) => ({
    type: "BLOCK_DELETE" as const,
    payload,
  }),

  blockAddBelow: (payload: BlockActionPayload) => ({
    type: "BLOCK_ADD_BELOW" as const,
    payload,
  }),
}


// Hook for editor to listen to preview messages
export function createPreviewListener(handlers: {
  onPreviewReady?: () => void
  onPreviewClick?: (payload: PreviewClickPayload) => void
  onPreviewHover?: (payload: PreviewHoverPayload) => void
  onInlineEditStart?: (payload: InlineEditStartPayload) => void
  onInlineEditChange?: (payload: InlineEditChangePayload) => void
  onInlineEditEnd?: (payload: InlineEditEndPayload) => void
  onInlineEditCancel?: (payload: InlineEditCancelPayload) => void
  onBlockMoveUp?: (payload: BlockActionPayload) => void
  onBlockMoveDown?: (payload: BlockActionPayload) => void
  onBlockDuplicate?: (payload: BlockActionPayload) => void
  onBlockDelete?: (payload: BlockActionPayload) => void
  onBlockAddBelow?: (payload: BlockActionPayload) => void
}) {
  return (event: MessageEvent) => {
    if (!isEditorMessage(event)) return
    if (event.data.source !== "preview") return

    switch (event.data.type) {
      case "PREVIEW_READY":
        handlers.onPreviewReady?.()
        break
      case "PREVIEW_CLICK":
        handlers.onPreviewClick?.(event.data.payload as PreviewClickPayload)
        break
      case "PREVIEW_HOVER":
        handlers.onPreviewHover?.(event.data.payload as PreviewHoverPayload)
        break
      case "INLINE_EDIT_START":
        handlers.onInlineEditStart?.(event.data.payload as InlineEditStartPayload)
        break
      case "INLINE_EDIT_CHANGE":
        handlers.onInlineEditChange?.(event.data.payload as InlineEditChangePayload)
        break
      case "INLINE_EDIT_END":
        handlers.onInlineEditEnd?.(event.data.payload as InlineEditEndPayload)
        break
      case "INLINE_EDIT_CANCEL":
        handlers.onInlineEditCancel?.(event.data.payload as InlineEditCancelPayload)
        break
      case "BLOCK_MOVE_UP":
        handlers.onBlockMoveUp?.(event.data.payload as BlockActionPayload)
        break
      case "BLOCK_MOVE_DOWN":
        handlers.onBlockMoveDown?.(event.data.payload as BlockActionPayload)
        break
      case "BLOCK_DUPLICATE":
        handlers.onBlockDuplicate?.(event.data.payload as BlockActionPayload)
        break
      case "BLOCK_DELETE":
        handlers.onBlockDelete?.(event.data.payload as BlockActionPayload)
        break
      case "BLOCK_ADD_BELOW":
        handlers.onBlockAddBelow?.(event.data.payload as BlockActionPayload)
        break
    }
  }
}


// Hook for preview to listen to editor messages
export function createEditorListener(handlers: {
  onEditorReady?: () => void
  onBlocksUpdate?: (payload: BlocksUpdatePayload) => void
  onSelectBlock?: (payload: SelectBlockPayload) => void
  onHighlightBlock?: (payload: HighlightBlockPayload) => void
  onScrollToBlock?: (payload: { blockId: string }) => void
  onFieldValueUpdate?: (payload: FieldValueUpdatePayload) => void
}) {
  return (event: MessageEvent) => {
    if (!isEditorMessage(event)) return
    if (event.data.source !== "editor") return

    switch (event.data.type) {
      case "EDITOR_READY":
        handlers.onEditorReady?.()
        break
      case "BLOCKS_UPDATE":
        handlers.onBlocksUpdate?.(event.data.payload as BlocksUpdatePayload)
        break
      case "SELECT_BLOCK":
        handlers.onSelectBlock?.(event.data.payload as SelectBlockPayload)
        break
      case "HIGHLIGHT_BLOCK":
        handlers.onHighlightBlock?.(event.data.payload as HighlightBlockPayload)
        break
      case "SCROLL_TO_BLOCK":
        handlers.onScrollToBlock?.(event.data.payload as { blockId: string })
        break
      case "FIELD_VALUE_UPDATE":
        handlers.onFieldValueUpdate?.(event.data.payload as FieldValueUpdatePayload)
        break
    }
  }
}