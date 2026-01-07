/**
 * useBlockClipboard Hook - Provides copy/paste functionality for blocks
 * 
 * Requirements:
 * - 3.2: Paste block after selected block (or at end if no selection)
 * - 3.3: Handle edge case of no selection on paste
 * 
 * This hook integrates the ClipboardManager with the Editor Store,
 * providing a simple interface for copy/paste operations.
 */

import { useCallback, useRef } from 'react'
import { useEditorStore, selectSelectedBlockId, selectHasClipboardContent } from '../store'
import { getClipboardManager } from '../clipboard'

export interface UseBlockClipboardReturn {
  /** Copy the currently selected block to clipboard */
  copy: () => Promise<void>
  /** Paste block from clipboard after selected block (or at end) */
  paste: () => Promise<void>
  /** Whether clipboard has valid content that can be pasted */
  canPaste: boolean
  /** Whether a block is currently selected (required for copy) */
  canCopy: boolean
}

/**
 * Hook for block copy/paste operations.
 * 
 * Integrates with both the system clipboard (via ClipboardManager) and
 * the in-memory clipboard state in the Editor Store.
 */
export function useBlockClipboard(): UseBlockClipboardReturn {
  const selectedBlockId = useEditorStore(selectSelectedBlockId)
  const hasClipboardContent = useEditorStore(selectHasClipboardContent)
  const blocks = useEditorStore((s) => s.blocks)
  const copyBlock = useEditorStore((s) => s.copyBlock)
  const pasteBlock = useEditorStore((s) => s.pasteBlock)
  const setClipboardBlock = useEditorStore((s) => s.setClipboardBlock)

  // Use ref to track if we've copied something in this session
  const hasCopiedInSession = useRef(false)

  /**
   * Copy the currently selected block to clipboard.
   * Requirement 3.1: Copy block data to clipboard
   */
  const copy = useCallback(async () => {
    if (!selectedBlockId) return

    const block = blocks.find((b) => b.id === selectedBlockId)
    if (!block) return

    // Copy to in-memory store
    copyBlock(selectedBlockId)
    hasCopiedInSession.current = true

    // Also copy to system clipboard for cross-tab support
    try {
      const manager = getClipboardManager()
      await manager.copy(block)
    } catch {
      // System clipboard failed, but in-memory copy succeeded
      console.warn('Failed to copy to system clipboard')
    }
  }, [selectedBlockId, blocks, copyBlock])

  /**
   * Paste block from clipboard.
   * Requirements 3.2, 3.3: Paste after selected block or at end
   */
  const paste = useCallback(async () => {
    // First, try to get content from system clipboard (for cross-tab paste)
    try {
      const manager = getClipboardManager()
      const clipboardContent = await manager.paste()
      
      if (clipboardContent) {
        // Update in-memory clipboard with system clipboard content
        setClipboardBlock(clipboardContent)
      }
    } catch {
      // System clipboard failed, use in-memory clipboard
    }

    // Perform paste from in-memory clipboard
    pasteBlock()
  }, [pasteBlock, setClipboardBlock])

  // Can paste if in-memory clipboard has content or we've copied in this session
  const canPaste = hasClipboardContent || hasCopiedInSession.current

  // Can copy if a block is selected
  const canCopy = selectedBlockId !== null

  return {
    copy,
    paste,
    canPaste,
    canCopy,
  }
}
