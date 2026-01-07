"use client"

import {
  useRef,
  useState,
  useCallback,
  useEffect,
  type KeyboardEvent,
  type MouseEvent,
  type FocusEvent,
} from "react"
import { cn } from "@/shared/utils"
import { sendToEditor, messages } from "@/features/editor/communication"

type EditableElement = "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div"

interface EditableTextProps {
  blockId: string
  fieldPath: string
  value: string
  placeholder?: string
  multiline?: boolean
  className?: string
  as?: EditableElement
  children?: React.ReactNode
}

/**
 * EditableText - A component that enables inline text editing in the preview iframe.
 * 
 * When in editor mode (inside iframe), this component:
 * - Shows a hover indicator (dashed outline) when hovered
 * - Becomes contenteditable when clicked
 * - Sends postMessage events to the editor for synchronization
 * - Handles keyboard navigation (Enter, Escape, Tab)
 * - Saves on click-outside
 */
export function EditableText({
  blockId,
  fieldPath,
  value,
  placeholder = "Click to edit...",
  multiline = false,
  className,
  as: Component = "span",
  children,
}: EditableTextProps) {
  // Use a generic ref that works with any HTML element
  const elementRef = useRef<HTMLElement | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [originalValue, setOriginalValue] = useState(value)
  const [currentValue, setCurrentValue] = useState(value)

  // Check if we're in editor mode (inside iframe)
  // Disable if we are explicitly in "preview" mode (via query param)
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("mode") === "preview"
  const isInEditor = typeof window !== "undefined" && window.parent !== window && !isPreview

  // Update current value when prop changes (from settings panel sync)
  useEffect(() => {
    if (!isEditing) {
      setCurrentValue(value)
    }
  }, [value, isEditing])

  // Place cursor at click position using Selection API
  const placeCursorAtClick = useCallback((element: HTMLElement, clientX: number, clientY: number) => {
    const range = document.caretRangeFromPoint(clientX, clientY)
    if (range) {
      const selection = window.getSelection()
      selection?.removeAllRanges()
      selection?.addRange(range)
    } else {
      // Fallback: place cursor at end
      const selection = window.getSelection()
      const range = document.createRange()
      range.selectNodeContents(element)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [])

  // Start editing
  const startEdit = useCallback((e: MouseEvent<HTMLElement>) => {
    if (!isInEditor || isEditing) return

    e.stopPropagation()

    const element = elementRef.current
    if (!element) return

    // Store original value for cancel/undo
    setOriginalValue(currentValue)
    setIsEditing(true)

    // Make contenteditable
    element.contentEditable = "true"
    element.focus()

    // Place cursor at click position
    placeCursorAtClick(element, e.clientX, e.clientY)

    // Send start message to editor
    sendToEditor("INLINE_EDIT_START", messages.inlineEditStart({
      blockId,
      fieldPath,
      originalValue: currentValue,
    }).payload)
  }, [isInEditor, isEditing, blockId, fieldPath, currentValue, placeCursorAtClick])

  // End editing (save or cancel)
  const endEdit = useCallback((save: boolean) => {
    if (!isEditing) return

    const element = elementRef.current
    if (!element) return

    const newValue = element.textContent || ""

    // Disable contenteditable
    element.contentEditable = "false"
    setIsEditing(false)

    if (save) {
      setCurrentValue(newValue)
      // Send end message with save
      sendToEditor("INLINE_EDIT_END", messages.inlineEditEnd({
        blockId,
        fieldPath,
        value: newValue,
        originalValue,
      }).payload)
    } else {
      // Revert to original value
      element.textContent = originalValue
      setCurrentValue(originalValue)
      // Send cancel message
      sendToEditor("INLINE_EDIT_CANCEL", messages.inlineEditCancel({
        blockId,
        fieldPath,
        originalValue,
      }).payload)
    }
  }, [isEditing, blockId, fieldPath, originalValue])

  // Handle text input changes (debounced sync to editor)
  const handleInput = useCallback(() => {
    if (!isEditing) return

    const element = elementRef.current
    if (!element) return

    const newValue = element.textContent || ""
    setCurrentValue(newValue)

    // Send change message to editor (will be debounced by the hook)
    sendToEditor("INLINE_EDIT_CHANGE", messages.inlineEditChange({
      blockId,
      fieldPath,
      value: newValue,
    }).payload)
  }, [isEditing, blockId, fieldPath])

  // Find next/previous editable field for tab navigation
  const findAdjacentField = useCallback((direction: "next" | "prev") => {
    const allEditables = Array.from(
      document.querySelectorAll<HTMLElement>("[data-editable-field]")
    )

    // Sort by visual position (top, then left)
    allEditables.sort((a, b) => {
      const rectA = a.getBoundingClientRect()
      const rectB = b.getBoundingClientRect()
      if (Math.abs(rectA.top - rectB.top) < 10) {
        return rectA.left - rectB.left
      }
      return rectA.top - rectB.top
    })

    const currentIndex = allEditables.findIndex(el => el === elementRef.current)
    if (currentIndex === -1) return null

    const targetIndex = direction === "next"
      ? currentIndex + 1
      : currentIndex - 1

    if (targetIndex >= 0 && targetIndex < allEditables.length) {
      return allEditables[targetIndex]
    }
    return null
  }, [])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLElement>) => {
    if (!isEditing) return

    switch (e.key) {
      case "Enter":
        if (!multiline) {
          // Single-line: save and exit
          e.preventDefault()
          endEdit(true)
        }
        // Multi-line: allow default behavior (insert line break)
        break

      case "Escape":
        // Cancel and revert
        e.preventDefault()
        endEdit(false)
        break

      case "Tab":
        // Save and move to next/prev field
        e.preventDefault()
        endEdit(true)

        const nextField = findAdjacentField(e.shiftKey ? "prev" : "next")
        if (nextField) {
          // Trigger click on next field to start editing
          nextField.click()
        }
        break
    }
  }, [isEditing, multiline, endEdit, findAdjacentField])

  // Handle blur (click outside)
  const handleBlur = useCallback((e: FocusEvent<HTMLElement>) => {
    if (!isEditing) return

    // Check if focus moved to another editable field (tab navigation)
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (relatedTarget?.hasAttribute("data-editable-field")) {
      // Don't save here, tab handler already did
      return
    }

    // Save on blur (click outside)
    endEdit(true)
  }, [isEditing, endEdit])

  // Click-outside detection using document listener
  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (e: globalThis.MouseEvent) => {
      const element = elementRef.current
      if (!element) return

      // Check if click is outside this element
      if (!element.contains(e.target as Node)) {
        endEdit(true)
      }
    }

    // Add listener with slight delay to avoid catching the initial click
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEditing, endEdit])

  // Hover handlers
  const handleMouseEnter = useCallback(() => {
    if (isInEditor && !isEditing) {
      setIsHovered(true)
    }
  }, [isInEditor, isEditing])

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false)
  }, [])

  // Determine display content
  const displayContent = children ?? currentValue
  const isEmpty = !currentValue || currentValue.trim() === ""
  const showPlaceholder = isEmpty && !isEditing && isInEditor

  // If not in editor, just render normally
  if (!isInEditor) {
    return (
      <Component className={className}>
        {displayContent}
      </Component>
    )
  }

  return (
    <Component
      ref={elementRef as React.RefObject<never>}
      data-editable-field="true"
      data-block-id={blockId}
      data-field-path={fieldPath}
      data-multiline={multiline}
      className={cn(
        className,
        "outline-none transition-all duration-150",
        // Hover indicator - uses CSS class from globals.css
        isHovered && !isEditing && "editable-field-hover",
        // Editing state - uses CSS class from globals.css
        isEditing && "editable-field-active",
        // Placeholder styling - uses CSS class from globals.css
        showPlaceholder && "editable-field-placeholder"
      )}
      onClick={startEdit}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      suppressContentEditableWarning
    >
      {showPlaceholder ? placeholder : displayContent}
    </Component>
  )
}
