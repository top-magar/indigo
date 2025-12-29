// usePreviewMode - Hook for the preview/store side to receive editor updates

"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import {
  sendToEditor,
  createEditorListener,
  type BlocksUpdatePayload,
  type SelectBlockPayload,
  type HighlightBlockPayload,
  type FieldValueUpdatePayload,
} from "../communication"
import type { StoreBlock, BlockType } from "@/types/blocks"
import type { InlineEditState } from "../types"

/**
 * Sets a nested value in an object using a field path.
 * Supports dot notation and array indexing: "headline", "settings.items[0].title"
 */
function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let current: Record<string, unknown> = obj
  
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i]
    if (current[key] === undefined || current[key] === null) {
      const nextKey = parts[i + 1]
      current[key] = /^\d+$/.test(nextKey) ? [] : {}
    }
    current = current[key] as Record<string, unknown>
  }
  
  const lastKey = parts[parts.length - 1]
  current[lastKey] = value
}

interface PreviewState {
  blocks: StoreBlock[]
  selectedBlockId: string | null
  highlightedBlockId: string | null
  isEditorConnected: boolean
  /** Current inline edit state from the preview side */
  inlineEdit: InlineEditState | null
  /** Queue of field updates from settings panel while inline editing */
  pendingFieldUpdates: FieldValueUpdatePayload[]
}

export function usePreviewMode(initialBlocks: StoreBlock[]) {
  const [state, setState] = useState<PreviewState>({
    blocks: initialBlocks,
    selectedBlockId: null,
    highlightedBlockId: null,
    isEditorConnected: false,
    inlineEdit: null,
    pendingFieldUpdates: [],
  })
  
  // Track if we've sent ready signal
  const hasSignaledReady = useRef(false)

  // Check if we're in an iframe (editor mode)
  const isInEditor = typeof window !== "undefined" && window.parent !== window

  // Listen for editor messages
  useEffect(() => {
    if (!isInEditor) return

    const listener = createEditorListener({
      onEditorReady: () => {
        setState((s) => ({ ...s, isEditorConnected: true }))
        // Always respond to EDITOR_READY with PREVIEW_READY
        sendToEditor("PREVIEW_READY", null)
      },
      onBlocksUpdate: (payload: BlocksUpdatePayload) => {
        setState((s) => ({
          ...s,
          blocks: payload.blocks,
          selectedBlockId: payload.selectedBlockId,
        }))
      },
      onSelectBlock: (payload: SelectBlockPayload) => {
        setState((s) => ({ ...s, selectedBlockId: payload.blockId }))
        // Auto-scroll to selected block
        if (payload.blockId) {
          const element = document.querySelector(`[data-block-id="${payload.blockId}"]`)
          element?.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      },
      onHighlightBlock: (payload: HighlightBlockPayload) => {
        setState((s) => ({ ...s, highlightedBlockId: payload.blockId }))
      },
      onScrollToBlock: (payload: { blockId: string }) => {
        const element = document.querySelector(`[data-block-id="${payload.blockId}"]`)
        element?.scrollIntoView({ behavior: "smooth", block: "center" })
      },
      onFieldValueUpdate: (payload: FieldValueUpdatePayload) => {
        setState((s) => {
          // If we're actively inline editing the same field, queue the update
          // to avoid conflicts (user input takes precedence)
          if (
            s.inlineEdit &&
            s.inlineEdit.blockId === payload.blockId &&
            s.inlineEdit.fieldPath === payload.fieldPath
          ) {
            return {
              ...s,
              pendingFieldUpdates: [...s.pendingFieldUpdates, payload],
            }
          }
          
          // Otherwise, update the block field directly
          const updatedBlocks = s.blocks.map((block) => {
            if (block.id !== payload.blockId) return block
            
            // Update the field using the path
            const updated = { ...block }
            setNestedValue(updated, payload.fieldPath, payload.value)
            return updated as StoreBlock
          })
          
          return { ...s, blocks: updatedBlocks }
        })
      },
    })

    window.addEventListener("message", listener)

    // Send ready signal on mount (with retry for timing issues)
    const signalReady = () => {
      if (!hasSignaledReady.current) {
        sendToEditor("PREVIEW_READY", null)
        hasSignaledReady.current = true
      }
    }
    
    // Signal immediately
    signalReady()
    
    // Also signal after a short delay in case editor wasn't ready
    const retryTimeout = setTimeout(signalReady, 500)

    return () => {
      window.removeEventListener("message", listener)
      clearTimeout(retryTimeout)
    }
  }, [isInEditor])

  // Handle block click in preview
  const handleBlockClick = useCallback(
    (blockId: string, blockType: BlockType) => {
      if (!isInEditor) return
      sendToEditor("PREVIEW_CLICK", { blockId, blockType })
    },
    [isInEditor]
  )

  // Handle block hover in preview
  const handleBlockHover = useCallback(
    (blockId: string | null) => {
      if (!isInEditor) return
      sendToEditor("PREVIEW_HOVER", { blockId })
    },
    [isInEditor]
  )

  // Start inline editing a field
  const startInlineEdit = useCallback(
    (blockId: string, fieldPath: string, originalValue: string) => {
      setState((s) => ({
        ...s,
        inlineEdit: { blockId, fieldPath, originalValue },
        pendingFieldUpdates: [],
      }))
    },
    []
  )

  // End inline editing and apply any pending field updates
  const endInlineEdit = useCallback(() => {
    setState((s) => {
      // Apply any pending field updates that were queued during inline editing
      let updatedBlocks = s.blocks
      for (const update of s.pendingFieldUpdates) {
        updatedBlocks = updatedBlocks.map((block) => {
          if (block.id !== update.blockId) return block
          const updated = { ...block }
          setNestedValue(updated, update.fieldPath, update.value)
          return updated as StoreBlock
        })
      }

      return {
        ...s,
        blocks: updatedBlocks,
        inlineEdit: null,
        pendingFieldUpdates: [],
      }
    })
  }, [])

  // Check if a specific field is being inline edited
  const isFieldBeingEdited = useCallback(
    (blockId: string, fieldPath: string): boolean => {
      return (
        state.inlineEdit?.blockId === blockId &&
        state.inlineEdit?.fieldPath === fieldPath
      )
    },
    [state.inlineEdit]
  )

  // Block action handlers - send messages to editor
  const handleMoveUp = useCallback(
    (blockId: string) => {
      if (!isInEditor) return
      sendToEditor("BLOCK_MOVE_UP", { blockId })
    },
    [isInEditor]
  )

  const handleMoveDown = useCallback(
    (blockId: string) => {
      if (!isInEditor) return
      sendToEditor("BLOCK_MOVE_DOWN", { blockId })
    },
    [isInEditor]
  )

  const handleDuplicate = useCallback(
    (blockId: string) => {
      if (!isInEditor) return
      sendToEditor("BLOCK_DUPLICATE", { blockId })
    },
    [isInEditor]
  )

  const handleDelete = useCallback(
    (blockId: string) => {
      if (!isInEditor) return
      sendToEditor("BLOCK_DELETE", { blockId })
    },
    [isInEditor]
  )

  const handleAddBelow = useCallback(
    (blockId: string) => {
      if (!isInEditor) return
      sendToEditor("BLOCK_ADD_BELOW", { blockId })
    },
    [isInEditor]
  )

  return {
    blocks: state.blocks,
    selectedBlockId: state.selectedBlockId,
    highlightedBlockId: state.highlightedBlockId,
    isInEditor,
    isEditorConnected: state.isEditorConnected,
    handleBlockClick,
    handleBlockHover,
    // Inline edit handlers
    inlineEdit: state.inlineEdit,
    startInlineEdit,
    endInlineEdit,
    isFieldBeingEdited,
    // Block action handlers
    handleMoveUp,
    handleMoveDown,
    handleDuplicate,
    handleDelete,
    handleAddBelow,
  }
}
