/**
 * Clipboard Manager - Handles copy/paste operations for blocks
 * 
 * Requirements:
 * - 3.1: Copy block data to clipboard with Cmd/Ctrl+C
 * - 3.6: Support copying blocks between browser tabs of the same origin
 * 
 * Uses Clipboard API with localStorage fallback for cross-tab support.
 */

import type { StoreBlock, BlockType } from "@/types/blocks"

// Clipboard data format for serialization
export interface ClipboardBlock {
  type: BlockType
  variant: string
  settings: Record<string, unknown>
  visible: boolean
  copiedAt: number
}

// Clipboard data wrapper with type identifier
interface ClipboardData {
  type: 'store-block'
  version: 1
  block: ClipboardBlock
}

// Storage key for localStorage fallback
const CLIPBOARD_STORAGE_KEY = 'editor-clipboard'

// Clipboard expiration time (1 hour)
const CLIPBOARD_EXPIRATION_MS = 60 * 60 * 1000

/**
 * Serializes a StoreBlock to ClipboardBlock format.
 * Strips runtime-specific fields (id, order) that should be regenerated on paste.
 */
export function serializeBlock(block: StoreBlock): ClipboardBlock {
  return {
    type: block.type,
    variant: block.variant,
    settings: { ...block.settings },
    visible: block.visible,
    copiedAt: Date.now(),
  }
}

/**
 * Validates clipboard data structure.
 */
function isValidClipboardData(data: unknown): data is ClipboardData {
  if (!data || typeof data !== 'object') return false
  const obj = data as Record<string, unknown>
  if (obj.type !== 'store-block') return false
  if (obj.version !== 1) return false
  if (!obj.block || typeof obj.block !== 'object') return false
  
  const block = obj.block as Record<string, unknown>
  if (typeof block.type !== 'string') return false
  if (typeof block.variant !== 'string') return false
  if (typeof block.copiedAt !== 'number') return false
  
  return true
}

/**
 * Checks if clipboard data has expired.
 */
function isExpired(clipboardBlock: ClipboardBlock): boolean {
  return Date.now() - clipboardBlock.copiedAt > CLIPBOARD_EXPIRATION_MS
}

/**
 * ClipboardManager - Handles copy/paste operations for blocks.
 * 
 * Uses the Clipboard API for modern browsers with localStorage fallback
 * for cross-tab support and older browsers.
 */
export interface ClipboardManager {
  /** Copy a block to clipboard */
  copy: (block: StoreBlock) => Promise<void>
  /** Paste a block from clipboard */
  paste: () => Promise<ClipboardBlock | null>
  /** Check if clipboard has valid content */
  hasContent: () => Promise<boolean>
  /** Clear clipboard content */
  clear: () => void
}

/**
 * Creates a ClipboardManager instance.
 */
export function createClipboardManager(): ClipboardManager {
  /**
   * Copy a block to clipboard using Clipboard API with localStorage fallback.
   * Requirement 3.1: Copy block data to clipboard
   * Requirement 3.6: Support copying between browser tabs
   */
  async function copy(block: StoreBlock): Promise<void> {
    const clipboardBlock = serializeBlock(block)
    const clipboardData: ClipboardData = {
      type: 'store-block',
      version: 1,
      block: clipboardBlock,
    }
    const jsonData = JSON.stringify(clipboardData)

    // Try Clipboard API first
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(jsonData)
      }
    } catch {
      // Clipboard API failed, continue to localStorage fallback
    }

    // Always write to localStorage for cross-tab support
    try {
      localStorage.setItem(CLIPBOARD_STORAGE_KEY, jsonData)
    } catch {
      // localStorage might be full or disabled
      console.warn('Failed to write to localStorage clipboard fallback')
    }
  }


  /**
   * Paste a block from clipboard.
   * Tries Clipboard API first, then falls back to localStorage.
   * Returns null if no valid content or content has expired.
   */
  async function paste(): Promise<ClipboardBlock | null> {
    let clipboardData: ClipboardData | null = null

    // Try Clipboard API first
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText()
        if (text) {
          const parsed = JSON.parse(text)
          if (isValidClipboardData(parsed)) {
            clipboardData = parsed
          }
        }
      }
    } catch {
      // Clipboard API failed or permission denied, try localStorage
    }

    // Fall back to localStorage if Clipboard API didn't work
    if (!clipboardData) {
      try {
        const stored = localStorage.getItem(CLIPBOARD_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (isValidClipboardData(parsed)) {
            clipboardData = parsed
          }
        }
      } catch {
        // localStorage read failed
      }
    }

    // Validate and check expiration
    if (!clipboardData) return null
    if (isExpired(clipboardData.block)) {
      clear()
      return null
    }

    return clipboardData.block
  }

  /**
   * Check if clipboard has valid, non-expired content.
   */
  async function hasContent(): Promise<boolean> {
    const content = await paste()
    return content !== null
  }

  /**
   * Clear clipboard content from localStorage.
   */
  function clear(): void {
    try {
      localStorage.removeItem(CLIPBOARD_STORAGE_KEY)
    } catch {
      // Ignore errors
    }
  }

  return {
    copy,
    paste,
    hasContent,
    clear,
  }
}

// Default singleton instance
let defaultManager: ClipboardManager | null = null

/**
 * Gets the default ClipboardManager instance.
 */
export function getClipboardManager(): ClipboardManager {
  if (!defaultManager) {
    defaultManager = createClipboardManager()
  }
  return defaultManager
}