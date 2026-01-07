// useEditorPreview - Hook for the editor side to communicate with preview iframe
// 
// IMPORTANT: This hook is ONLY used for LivePreview (iframe) mode.
// InlinePreview reads directly from Editor Store - no postMessage needed.
// Requirements 6.1, 6.2: InlinePreview should not use postMessage communication.
//
// This hook handles:
// - Sending block updates to the iframe via postMessage
// - Receiving click/hover events from the iframe
// - Handling inline edit messages from the iframe
// - Block action messages (move, duplicate, delete) from the iframe

"use client"

import { useEffect, useRef, useCallback } from "react"
import { useEditorStore } from "../store"
import {
  sendToPreview,
  createPreviewListener,
  type PreviewClickPayload,
  type PreviewHoverPayload,
  type InlineEditStartPayload,
  type InlineEditChangePayload,
  type InlineEditEndPayload,
  type InlineEditCancelPayload,
  type BlockActionPayload,
} from "../communication"

interface UseEditorPreviewOptions {
  onBlockClick?: (blockId: string) => void
  onAddBlockBelow?: (blockId: string) => void
}

export function useEditorPreview(options: UseEditorPreviewOptions = {}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const blocksRef = useRef(useEditorStore.getState().blocks)
  const selectedBlockIdRef = useRef(useEditorStore.getState().selectedBlockId)
  
  // Debounce timer for inline edit changes
  const inlineEditDebounceRef = useRef<NodeJS.Timeout | null>(null)
  
  const {
    blocks,
    selectedBlockId,
    hoveredBlockId,
    isPreviewReady,
    selectBlock,
    hoverBlock,
    setPreviewReady,
    startInlineEdit,
    updateInlineEdit,
    endInlineEdit,
    moveBlock,
    duplicateBlock,
    removeBlock,
  } = useEditorStore()

  // Keep refs in sync for use in callbacks
  useEffect(() => {
    blocksRef.current = blocks
    selectedBlockIdRef.current = selectedBlockId
  }, [blocks, selectedBlockId])

  // Listen for messages from preview
  useEffect(() => {
    const listener = createPreviewListener({
      onPreviewReady: () => {
        setPreviewReady(true)
        // Send current state to preview immediately
        sendToPreview(iframeRef.current, "BLOCKS_UPDATE", {
          blocks: blocksRef.current,
          selectedBlockId: selectedBlockIdRef.current,
        })
      },
      onPreviewClick: (payload: PreviewClickPayload) => {
        selectBlock(payload.blockId)
        options.onBlockClick?.(payload.blockId)
      },
      onPreviewHover: (payload: PreviewHoverPayload) => {
        hoverBlock(payload.blockId)
      },
      onInlineEditStart: (payload: InlineEditStartPayload) => {
        // Select the block being edited in the editor
        selectBlock(payload.blockId)
        // Start inline edit tracking in the store
        startInlineEdit(payload.blockId, payload.fieldPath, payload.originalValue)
      },
      onInlineEditChange: (payload: InlineEditChangePayload) => {
        // Clear any existing debounce timer
        if (inlineEditDebounceRef.current) {
          clearTimeout(inlineEditDebounceRef.current)
        }
        
        // Debounce the store update to avoid excessive updates
        inlineEditDebounceRef.current = setTimeout(() => {
          updateInlineEdit(payload.value)
          inlineEditDebounceRef.current = null
        }, 50) // Short debounce since preview already debounces at 300ms
      },
      onInlineEditEnd: (payload: InlineEditEndPayload) => {
        // Clear any pending debounce
        if (inlineEditDebounceRef.current) {
          clearTimeout(inlineEditDebounceRef.current)
          inlineEditDebounceRef.current = null
        }
        
        // Update to final value and create history entry
        updateInlineEdit(payload.value)
        endInlineEdit(true) // save = true
      },
      onInlineEditCancel: (_payload: InlineEditCancelPayload) => {
        // Clear any pending debounce
        if (inlineEditDebounceRef.current) {
          clearTimeout(inlineEditDebounceRef.current)
          inlineEditDebounceRef.current = null
        }
        
        // Revert to original value
        endInlineEdit(false) // save = false
      },
      onBlockMoveUp: (payload: BlockActionPayload) => {
        const currentBlocks = blocksRef.current
        const index = currentBlocks.findIndex((b) => b.id === payload.blockId)
        if (index > 0) {
          moveBlock(index, index - 1)
        }
      },
      onBlockMoveDown: (payload: BlockActionPayload) => {
        const currentBlocks = blocksRef.current
        const index = currentBlocks.findIndex((b) => b.id === payload.blockId)
        if (index >= 0 && index < currentBlocks.length - 1) {
          moveBlock(index, index + 1)
        }
      },
      onBlockDuplicate: (payload: BlockActionPayload) => {
        duplicateBlock(payload.blockId)
      },
      onBlockDelete: (payload: BlockActionPayload) => {
        removeBlock(payload.blockId)
      },
      onBlockAddBelow: (payload: BlockActionPayload) => {
        // Delegate to parent component to open block palette
        options.onAddBlockBelow?.(payload.blockId)
      },
    })

    window.addEventListener("message", listener)
    
    // Cleanup debounce timer on unmount
    return () => {
      window.removeEventListener("message", listener)
      if (inlineEditDebounceRef.current) {
        clearTimeout(inlineEditDebounceRef.current)
      }
    }
  }, [selectBlock, hoverBlock, setPreviewReady, startInlineEdit, updateInlineEdit, endInlineEdit, moveBlock, duplicateBlock, removeBlock, options.onBlockClick, options.onAddBlockBelow])

  // Send blocks update to preview when blocks change
  useEffect(() => {
    if (!isPreviewReady) return
    sendToPreview(iframeRef.current, "BLOCKS_UPDATE", {
      blocks,
      selectedBlockId,
    })
  }, [blocks, isPreviewReady]) // Note: removed selectedBlockId to avoid double-sends

  // Send selection update to preview (separate from blocks update)
  useEffect(() => {
    if (!isPreviewReady) return
    sendToPreview(iframeRef.current, "SELECT_BLOCK", {
      blockId: selectedBlockId,
    })
  }, [selectedBlockId, isPreviewReady])

  // Send hover highlight to preview
  useEffect(() => {
    if (!isPreviewReady) return
    sendToPreview(iframeRef.current, "HIGHLIGHT_BLOCK", {
      blockId: hoveredBlockId,
    })
  }, [hoveredBlockId, isPreviewReady])

  // Notify preview that editor is ready
  const notifyEditorReady = useCallback(() => {
    sendToPreview(iframeRef.current, "EDITOR_READY", null)
  }, [])

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    // Reset preview ready state when iframe reloads
    setPreviewReady(false)
    // Small delay to ensure preview script is loaded
    setTimeout(notifyEditorReady, 100)
    // Retry in case of timing issues
    setTimeout(notifyEditorReady, 500)
  }, [notifyEditorReady, setPreviewReady])

  // Scroll to block in preview
  const scrollToBlock = useCallback((blockId: string) => {
    if (!isPreviewReady) return
    sendToPreview(iframeRef.current, "SCROLL_TO_BLOCK", { blockId })
  }, [isPreviewReady])

  // Send field value update to preview when settings panel changes a field
  // This enables bidirectional sync between settings panel and inline editing
  const sendFieldValueUpdate = useCallback((blockId: string, fieldPath: string, value: string) => {
    if (!isPreviewReady) return
    sendToPreview(iframeRef.current, "FIELD_VALUE_UPDATE", {
      blockId,
      fieldPath,
      value,
    })
  }, [isPreviewReady])

  return {
    iframeRef,
    isPreviewReady,
    handleIframeLoad,
    scrollToBlock,
    sendFieldValueUpdate,
  }
}
