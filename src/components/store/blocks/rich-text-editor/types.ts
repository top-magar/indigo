import type { Editor } from "@tiptap/react"

export interface RichTextEditorProps {
  blockId: string
  fieldPath: string
  value: string
  placeholder?: string
  className?: string
  toolbarConfig?: ToolbarConfig
  onUpdate?: (html: string) => void
  maxSizeBytes?: number // Maximum content size in bytes (default: 50KB)
}

export interface ToolbarConfig {
  bold?: boolean
  italic?: boolean
  underline?: boolean
  strike?: boolean
  heading?: boolean | { levels: (1 | 2 | 3 | 4 | 5 | 6)[] }
  bulletList?: boolean
  orderedList?: boolean
  link?: boolean
  textAlign?: boolean
  code?: boolean
}

export interface ToolbarProps {
  editor: Editor | null
  config?: ToolbarConfig
}

export const defaultToolbarConfig: ToolbarConfig = {
  bold: true,
  italic: true,
  underline: true,
  strike: false,
  heading: { levels: [1, 2, 3] },
  bulletList: true,
  orderedList: true,
  link: true,
  textAlign: true,
  code: false,
}
