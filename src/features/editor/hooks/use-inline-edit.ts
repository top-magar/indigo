// useInlineEdit - Hook for managing inline text editing state in the preview iframe

"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { sendToEditor, messages } from "../communication"

/**
 * State for tracking the currently active inline edit
 */
export interface InlineEditState {
  blockId: string
  fieldPath: string
  originalValue: string
}

/**
 * Return type for the useInlineEdit hook
 */
export interface UseInlineEditReturn {
  /** Current inline edit state, null if not editing */
  state: InlineEditState | null
  /** Start editing a field */
  startEdit: (blockId: string, fieldPath: string, value: string) => void
  /** Update the current value (debounced) */
  updateValue: (value: string) => void
  /** End the current edit session */
  endEdit: (save: boolean) => void
  /** Check if a specific field is being edited */
  isEditing: (blockId: string, fieldPath: string) => boolean
  /** Navigate to adjacent editable field */
  navigateToField: (direction: "next" | "prev") => HTMLElement | null
  /** Get all editable fields sorted by visual position */
  getEditableFields: () => HTMLElement[]
}

/** Debounce delay for value updates (ms) */
const DEBOUNCE_DELAY = 300

/**
 * useInlineEdit - Manages inline editing state for the preview iframe.
 * 
 * This hook:
 * - Tracks the active edit state (blockId, fieldPath, originalValue)
 * - Sends postMessage events to the editor for synchronization
 * - Implements 300ms debounce for value updates to avoid excessive traffic
 * - Provides tab navigation between editable fields
 * 
 * @example
 * ```tsx
 * const { state, startEdit, updateValue, endEdit, isEditing } = useInlineEdit()
 * 
 * // Start editing
 * startEdit("block-1", "headline", "Original text")
 * 
 * // Update value (debounced)
 * updateValue("New text")
 * 
 * // End editing
 * endEdit(true) // save
 * endEdit(false) // cancel
 * ```
 */
export function useInlineEdit(): UseInlineEditReturn {
  // Active edit state
  const [state, setState] = useState<InlineEditState | null>(null)
  
  // Ref for debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Ref for pending value (to send after debounce)
  const pendingValueRef = useRef<string | null>(null)

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  /**
   * Start editing a field
   */
  const startEdit = useCallback((blockId: string, fieldPath: string, value: string) => {
    // If already editing a different field, end that edit first
    if (state && (state.blockId !== blockId || state.fieldPath !== fieldPath)) {
      // Flush any pending value update
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }

    // Set new edit state
    setState({
      blockId,
      fieldPath,
      originalValue: value,
    })

    // Send start message to editor
    sendToEditor("INLINE_EDIT_START", messages.inlineEditStart({
      blockId,
      fieldPath,
      originalValue: value,
    }).payload)
  }, [state])

  /**
   * Update the current value with debouncing
   * Sends INLINE_EDIT_CHANGE to editor after 300ms of no input
   */
  const updateValue = useCallback((value: string) => {
    if (!state) return

    // Store pending value
    pendingValueRef.current = value

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      if (pendingValueRef.current !== null && state) {
        sendToEditor("INLINE_EDIT_CHANGE", messages.inlineEditChange({
          blockId: state.blockId,
          fieldPath: state.fieldPath,
          value: pendingValueRef.current,
        }).payload)
        pendingValueRef.current = null
      }
      debounceTimerRef.current = null
    }, DEBOUNCE_DELAY)
  }, [state])

  /**
   * End the current edit session
   * @param save - If true, save changes; if false, revert to original
   */
  const endEdit = useCallback((save: boolean) => {
    if (!state) return

    // Clear any pending debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    if (save) {
      // Get the final value from the DOM element
      const element = document.querySelector<HTMLElement>(
        `[data-block-id="${state.blockId}"][data-field-path="${state.fieldPath}"]`
      )
      const finalValue = element?.textContent || pendingValueRef.current || state.originalValue

      // Send end message with final value
      sendToEditor("INLINE_EDIT_END", messages.inlineEditEnd({
        blockId: state.blockId,
        fieldPath: state.fieldPath,
        value: finalValue,
        originalValue: state.originalValue,
      }).payload)
    } else {
      // Send cancel message
      sendToEditor("INLINE_EDIT_CANCEL", messages.inlineEditCancel({
        blockId: state.blockId,
        fieldPath: state.fieldPath,
        originalValue: state.originalValue,
      }).payload)
    }

    // Clear state
    pendingValueRef.current = null
    setState(null)
  }, [state])

  /**
   * Check if a specific field is currently being edited
   */
  const isEditing = useCallback((blockId: string, fieldPath: string): boolean => {
    return state?.blockId === blockId && state?.fieldPath === fieldPath
  }, [state])

  /**
   * Get all editable fields sorted by visual position (top, then left)
   */
  const getEditableFields = useCallback((): HTMLElement[] => {
    const allEditables = Array.from(
      document.querySelectorAll<HTMLElement>("[data-editable-field]")
    )
    
    // Sort by visual position (top, then left)
    allEditables.sort((a, b) => {
      const rectA = a.getBoundingClientRect()
      const rectB = b.getBoundingClientRect()
      // Consider elements on the same "row" if within 10px vertically
      if (Math.abs(rectA.top - rectB.top) < 10) {
        return rectA.left - rectB.left
      }
      return rectA.top - rectB.top
    })

    return allEditables
  }, [])

  /**
   * Navigate to the next or previous editable field
   * Returns the target element if found, null otherwise
   */
  const navigateToField = useCallback((direction: "next" | "prev"): HTMLElement | null => {
    if (!state) return null

    const allEditables = getEditableFields()
    
    // Find current element
    const currentElement = document.querySelector<HTMLElement>(
      `[data-block-id="${state.blockId}"][data-field-path="${state.fieldPath}"]`
    )
    
    if (!currentElement) return null

    const currentIndex = allEditables.indexOf(currentElement)
    if (currentIndex === -1) return null

    // Calculate target index
    const targetIndex = direction === "next" 
      ? currentIndex + 1 
      : currentIndex - 1

    // Check bounds
    if (targetIndex < 0 || targetIndex >= allEditables.length) {
      return null
    }

    return allEditables[targetIndex]
  }, [state, getEditableFields])

  return {
    state,
    startEdit,
    updateValue,
    endEdit,
    isEditing,
    navigateToField,
    getEditableFields,
  }
}

/**
 * Helper function to find editable fields within a specific block
 */
export function getBlockEditableFields(blockId: string): HTMLElement[] {
  const blockElement = document.querySelector(`[data-block-id="${blockId}"]`)
  if (!blockElement) return []

  const editables = Array.from(
    blockElement.querySelectorAll<HTMLElement>("[data-editable-field]")
  )

  // Sort by visual position
  editables.sort((a, b) => {
    const rectA = a.getBoundingClientRect()
    const rectB = b.getBoundingClientRect()
    if (Math.abs(rectA.top - rectB.top) < 10) {
      return rectA.left - rectB.left
    }
    return rectA.top - rectB.top
  })

  return editables
}

/**
 * Helper function to find the next block's first editable field
 */
export function getNextBlockFirstField(currentBlockId: string): HTMLElement | null {
  const allBlocks = Array.from(
    document.querySelectorAll<HTMLElement>("[data-block-id]")
  )
  
  // Filter to only block wrappers (not nested editable fields)
  const blockWrappers = allBlocks.filter(el => 
    el.getAttribute("data-block-id") && !el.hasAttribute("data-editable-field")
  )

  // Sort by visual position
  blockWrappers.sort((a, b) => {
    const rectA = a.getBoundingClientRect()
    const rectB = b.getBoundingClientRect()
    return rectA.top - rectB.top
  })

  // Find current block index
  const currentIndex = blockWrappers.findIndex(
    el => el.getAttribute("data-block-id") === currentBlockId
  )

  if (currentIndex === -1 || currentIndex >= blockWrappers.length - 1) {
    return null
  }

  // Get next block's first editable field
  const nextBlock = blockWrappers[currentIndex + 1]
  const nextBlockId = nextBlock.getAttribute("data-block-id")
  if (!nextBlockId) return null

  const nextBlockFields = getBlockEditableFields(nextBlockId)
  return nextBlockFields[0] || null
}

/**
 * Helper function to find the previous block's last editable field
 */
export function getPrevBlockLastField(currentBlockId: string): HTMLElement | null {
  const allBlocks = Array.from(
    document.querySelectorAll<HTMLElement>("[data-block-id]")
  )
  
  // Filter to only block wrappers (not nested editable fields)
  const blockWrappers = allBlocks.filter(el => 
    el.getAttribute("data-block-id") && !el.hasAttribute("data-editable-field")
  )

  // Sort by visual position
  blockWrappers.sort((a, b) => {
    const rectA = a.getBoundingClientRect()
    const rectB = b.getBoundingClientRect()
    return rectA.top - rectB.top
  })

  // Find current block index
  const currentIndex = blockWrappers.findIndex(
    el => el.getAttribute("data-block-id") === currentBlockId
  )

  if (currentIndex <= 0) {
    return null
  }

  // Get previous block's last editable field
  const prevBlock = blockWrappers[currentIndex - 1]
  const prevBlockId = prevBlock.getAttribute("data-block-id")
  if (!prevBlockId) return null

  const prevBlockFields = getBlockEditableFields(prevBlockId)
  return prevBlockFields[prevBlockFields.length - 1] || null
}
