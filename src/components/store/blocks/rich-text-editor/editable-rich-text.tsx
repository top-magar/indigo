"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { EditorContent } from "@tiptap/react"
import { cn } from "@/shared/utils"
import { 
  sendToEditor, 
  messages, 
  retrySyncIfNeeded, 
  hasPendingSync,
  isConnectionAvailable,
  markConnectionRestored 
} from "@/features/editor/communication"
import { useRichTextEditor, MAX_CONTENT_SIZE_BYTES } from "./use-rich-text-editor"
import { RichTextToolbar } from "./toolbar"
import { type RichTextEditorProps, defaultToolbarConfig } from "./types"

/**
 * Formats bytes to a human-readable string (e.g., "45.2 KB")
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  return `${(bytes / 1024).toFixed(1)} KB`
}

/**
 * Calculates the optimal toolbar position based on selection bounds and viewport constraints.
 * Ensures the toolbar remains fully visible within the viewport.
 * 
 * @param selectionRect - The bounding rectangle of the text selection
 * @param containerRect - The bounding rectangle of the editor container
 * @param toolbarWidth - The width of the toolbar element
 * @param toolbarHeight - The height of the toolbar element
 * @returns The calculated top and left position for the toolbar
 */
export function calculateToolbarPosition(
  selectionRect: DOMRect,
  containerRect: DOMRect,
  toolbarWidth: number,
  toolbarHeight: number
): { top: number; left: number; positionBelow: boolean } {
  const PADDING = 8 // Minimum distance from viewport edge

  // Default: center above selection
  let top = selectionRect.top - containerRect.top - toolbarHeight - PADDING
  let left = selectionRect.left - containerRect.left + selectionRect.width / 2
  let positionBelow = false

  // If toolbar would go above viewport, position below selection
  if (selectionRect.top - toolbarHeight - PADDING < 0) {
    top = selectionRect.bottom - containerRect.top + PADDING
    positionBelow = true
  }

  // Constrain to left edge
  const leftEdge = left - toolbarWidth / 2
  if (leftEdge < PADDING) {
    left = toolbarWidth / 2 + PADDING
  }

  // Constrain to right edge
  const rightEdge = left + toolbarWidth / 2
  const viewportWidth = window.innerWidth
  if (rightEdge > viewportWidth - PADDING) {
    left = viewportWidth - toolbarWidth / 2 - PADDING
  }

  return { top, left, positionBelow }
}

export function EditableRichText({
  blockId,
  fieldPath,
  value,
  placeholder = "Click to edit...",
  className,
  toolbarConfig = defaultToolbarConfig,
  onUpdate,
  maxSizeBytes = MAX_CONTENT_SIZE_BYTES,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [originalValue, setOriginalValue] = useState(value)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 })
  const [showToolbar, setShowToolbar] = useState(false)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Check if we're in editor mode (inside iframe)
  const isInEditor = typeof window !== "undefined" && window.parent !== window

  // Handle content updates with debounce and retry logic
  const handleUpdate = useCallback(
    (html: string) => {
      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }

      // Debounce the sync to editor
      debounceRef.current = setTimeout(() => {
        if (isInEditor) {
          // First, retry any pending sync from previous failure
          if (hasPendingSync()) {
            retrySyncIfNeeded()
          }

          // Send the current change
          const success = sendToEditor(
            "INLINE_EDIT_CHANGE",
            messages.inlineEditChange({
              blockId,
              fieldPath,
              value: html,
            }).payload
          )

          // If send failed, it will be retried on next content change
          if (!success) {
            console.warn("[EditableRichText] Sync failed, will retry on next change")
          }
        }
        onUpdate?.(html)
      }, 300)
    },
    [blockId, fieldPath, isInEditor, onUpdate]
  )

  const { editor, contentSize, isOverLimit, maxSize } = useRichTextEditor({
    content: value,
    placeholder,
    onUpdate: handleUpdate,
    editable: isInEditor,
    isEditing, // Pass isEditing state to prevent external updates during active editing
    maxSizeBytes,
  })

  // Update toolbar position based on selection
  const updateToolbarPosition = useCallback(() => {
    if (!editor || !containerRef.current || !toolbarRef.current) return

    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
      setShowToolbar(false)
      return
    }

    const range = selection.getRangeAt(0)
    const selectionRect = range.getBoundingClientRect()
    const containerRect = containerRef.current.getBoundingClientRect()
    const toolbarRect = toolbarRef.current.getBoundingClientRect()

    // Use the calculateToolbarPosition function for viewport-aware positioning
    const position = calculateToolbarPosition(
      selectionRect,
      containerRect,
      toolbarRect.width || 300, // Fallback width if not yet rendered
      toolbarRect.height || 40  // Fallback height if not yet rendered
    )

    setToolbarPosition({
      top: position.top,
      left: position.left,
    })
    setShowToolbar(true)
  }, [editor])

  // Listen for selection changes
  useEffect(() => {
    if (!isEditing || !editor) return

    const handleSelectionChange = () => {
      updateToolbarPosition()
    }

    document.addEventListener("selectionchange", handleSelectionChange)
    return () => document.removeEventListener("selectionchange", handleSelectionChange)
  }, [isEditing, editor, updateToolbarPosition])

  // Start editing
  const startEdit = useCallback(() => {
    if (!isInEditor || isEditing || !editor) return

    setOriginalValue(editor.getHTML())
    setIsEditing(true)
    editor.commands.focus()

    // Check if connection was restored
    if (!isConnectionAvailable()) {
      markConnectionRestored()
    }

    // Send start message to editor
    sendToEditor(
      "INLINE_EDIT_START",
      messages.inlineEditStart({
        blockId,
        fieldPath,
        originalValue: editor.getHTML(),
      }).payload
    )
  }, [isInEditor, isEditing, editor, blockId, fieldPath])

  // End editing
  const endEdit = useCallback(
    (save: boolean) => {
      if (!isEditing || !editor) return

      setIsEditing(false)
      setShowToolbar(false)

      // Check if connection was restored before sending end message
      if (!isConnectionAvailable()) {
        markConnectionRestored()
      }

      if (save) {
        const newValue = editor.getHTML()
        sendToEditor(
          "INLINE_EDIT_END",
          messages.inlineEditEnd({
            blockId,
            fieldPath,
            value: newValue,
            originalValue,
          }).payload
        )
      } else {
        // Revert to original value
        editor.commands.setContent(originalValue, { emitUpdate: false })
        sendToEditor(
          "INLINE_EDIT_CANCEL",
          messages.inlineEditCancel({
            blockId,
            fieldPath,
            originalValue,
          }).payload
        )
      }
    },
    [isEditing, editor, blockId, fieldPath, originalValue]
  )

  // Handle click outside
  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (e: MouseEvent) => {
      const container = containerRef.current
      const toolbar = toolbarRef.current
      if (!container) return

      // Check if click is outside the editor and toolbar
      const target = e.target as Node
      const isOutsideContainer = !container.contains(target)
      const isOutsideToolbar = !toolbar || !toolbar.contains(target)

      if (isOutsideContainer && isOutsideToolbar) {
        endEdit(true)
      }
    }

    // Add listener with slight delay
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside)
    }, 10)

    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEditing, endEdit])

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isEditing || !editor) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        endEdit(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isEditing, editor, endEdit])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // If not in editor, just render the HTML content
  if (!isInEditor) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      data-editable-field="true"
      data-block-id={blockId}
      data-field-path={fieldPath}
      data-rich-text="true"
      className={cn(
        "relative outline-none transition-all duration-150",
        isHovered && !isEditing && "editable-field-hover",
        isEditing && "editable-field-active",
        className
      )}
      onClick={startEdit}
      onFocus={startEdit}
      onMouseEnter={() => !isEditing && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Floating toolbar - appears on text selection */}
      {editor && isEditing && showToolbar && (
        <div
          ref={toolbarRef}
          data-rich-text-toolbar
          className="absolute z-50 -translate-x-1/2"
          style={{
            top: toolbarPosition.top,
            left: toolbarPosition.left,
          }}
        >
          <RichTextToolbar editor={editor} config={toolbarConfig} />
        </div>
      )}

      {/* Content size limit warning */}
      {isEditing && isOverLimit && (
        <div
          className="absolute bottom-full left-0 right-0 mb-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm"
          role="alert"
          aria-live="polite"
        >
          <span className="font-medium">Content limit exceeded.</span>{" "}
          Maximum size is {formatBytes(maxSize)}. Current: {formatBytes(contentSize)}.
          Further input has been prevented.
        </div>
      )}

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className={cn(
          "prose prose-sm max-w-none",
          "[&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
          "[&_.is-editor-empty]:before:text-muted-foreground",
          "[&_.is-editor-empty]:before:opacity-50",
          "[&_.is-editor-empty]:before:pointer-events-none",
          "[&_.is-editor-empty]:before:float-left",
          "[&_.is-editor-empty]:before:h-0"
        )}
      />
    </div>
  )
}
