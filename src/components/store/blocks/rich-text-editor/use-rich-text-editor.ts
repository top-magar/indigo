"use client"

import { useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { useCallback, useEffect, useRef, useState } from "react"

// Maximum content size in bytes (50KB as per requirements)
export const MAX_CONTENT_SIZE_BYTES = 50 * 1024

/**
 * Calculates the size of a string in bytes (UTF-8 encoding)
 */
export function getContentSizeBytes(content: string): number {
  return new Blob([content]).size
}

/**
 * Checks if content exceeds the maximum allowed size
 */
export function isContentOverLimit(content: string): boolean {
  return getContentSizeBytes(content) > MAX_CONTENT_SIZE_BYTES
}

interface UseRichTextEditorOptions {
  content: string
  placeholder?: string
  onUpdate?: (html: string) => void
  editable?: boolean
  isEditing?: boolean // When true, external updates are ignored to prevent overriding user input
  maxSizeBytes?: number // Maximum content size in bytes (default: 50KB)
}

interface UseRichTextEditorReturn {
  editor: ReturnType<typeof useEditor>
  setLink: () => void
  contentSize: number
  isOverLimit: boolean
  maxSize: number
}

export function useRichTextEditor({
  content,
  placeholder = "Start typing...",
  onUpdate,
  editable = true,
  isEditing = false,
  maxSizeBytes = MAX_CONTENT_SIZE_BYTES,
}: UseRichTextEditorOptions): UseRichTextEditorReturn {
  const isUpdatingRef = useRef(false)
  const lastValidContentRef = useRef(content)
  const [contentSize, setContentSize] = useState(() => getContentSizeBytes(content))
  const [isOverLimit, setIsOverLimit] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        defaultAlignment: "left",
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      if (isUpdatingRef.current) return

      const html = editor.getHTML()
      const size = getContentSizeBytes(html)
      setContentSize(size)

      // Check if content exceeds limit
      if (size > maxSizeBytes) {
        setIsOverLimit(true)
        // Revert to last valid content to prevent further input
        isUpdatingRef.current = true
        editor.commands.setContent(lastValidContentRef.current, { emitUpdate: false })
        isUpdatingRef.current = false
        return
      }

      setIsOverLimit(false)
      lastValidContentRef.current = html

      if (onUpdate) {
        onUpdate(html)
      }
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[1em] prose prose-sm max-w-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": placeholder,
      },
    },
  })

  // Update content when prop changes (from external source like settings panel)
  // Only apply external updates when not actively editing to prevent overriding user input
  useEffect(() => {
    if (editor && !isEditing && content !== editor.getHTML()) {
      isUpdatingRef.current = true
      editor.commands.setContent(content, { emitUpdate: false })
      lastValidContentRef.current = content
      setContentSize(getContentSizeBytes(content))
      setIsOverLimit(false)
      isUpdatingRef.current = false
    }
  }, [content, editor, isEditing])

  const setLink = useCallback(() => {
    if (!editor) return

    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)

    if (url === null) return

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }, [editor])

  return {
    editor,
    setLink,
    contentSize,
    isOverLimit,
    maxSize: maxSizeBytes,
  }
}
