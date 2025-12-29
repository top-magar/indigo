"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import TextAlign from "@tiptap/extension-text-align"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useRef } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"
import type { RichtextField as RichtextFieldConfig } from "../types"

interface RichtextFieldProps {
  name: string
  value: string
  onChange: (value: string) => void
  config: RichtextFieldConfig
}

export function RichtextField({ name, value, onChange, config }: RichtextFieldProps) {
  const isUpdatingRef = useRef(false)

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
      }),
      Placeholder.configure({
        placeholder: config.placeholder || "Enter content...",
        emptyEditorClass: "is-editor-empty",
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      if (!isUpdatingRef.current) {
        onChange(editor.getHTML())
      }
    },
    editorProps: {
      attributes: {
        class: "outline-none min-h-[100px] p-3 prose prose-sm max-w-none",
      },
    },
  })

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      isUpdatingRef.current = true
      editor.commands.setContent(value, { emitUpdate: false })
      isUpdatingRef.current = false
    }
  }, [value, editor])

  const toolbar = config.toolbar || {
    bold: true,
    italic: true,
    underline: true,
    bulletList: true,
    orderedList: true,
    link: true,
    textAlign: true,
  }

  const iconSize = 14

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href
    const url = window.prompt("URL", previousUrl)
    if (url === null) return
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{config.label}</Label>
      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
      
      <div className="border rounded-md overflow-hidden">
        {/* Toolbar */}
        {editor && (
          <div className="flex items-center gap-0.5 p-1 border-b bg-muted/50">
            {toolbar.bold && (
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive("bold")}
                title="Bold"
              >
                <Bold size={iconSize} />
              </ToolbarButton>
            )}
            {toolbar.italic && (
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive("italic")}
                title="Italic"
              >
                <Italic size={iconSize} />
              </ToolbarButton>
            )}
            {toolbar.underline && (
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive("underline")}
                title="Underline"
              >
                <UnderlineIcon size={iconSize} />
              </ToolbarButton>
            )}
            
            {(toolbar.bulletList || toolbar.orderedList) && (
              <div className="w-px h-4 bg-border mx-1" />
            )}
            
            {toolbar.bulletList && (
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive("bulletList")}
                title="Bullet List"
              >
                <List size={iconSize} />
              </ToolbarButton>
            )}
            {toolbar.orderedList && (
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive("orderedList")}
                title="Numbered List"
              >
                <ListOrdered size={iconSize} />
              </ToolbarButton>
            )}
            
            {toolbar.textAlign && (
              <>
                <div className="w-px h-4 bg-border mx-1" />
                <ToolbarButton
                  onClick={() => editor.chain().focus().setTextAlign("left").run()}
                  isActive={editor.isActive({ textAlign: "left" })}
                  title="Align Left"
                >
                  <AlignLeft size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                  isActive={editor.isActive({ textAlign: "center" })}
                  title="Align Center"
                >
                  <AlignCenter size={iconSize} />
                </ToolbarButton>
                <ToolbarButton
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                  isActive={editor.isActive({ textAlign: "right" })}
                  title="Align Right"
                >
                  <AlignRight size={iconSize} />
                </ToolbarButton>
              </>
            )}
            
            {toolbar.link && (
              <>
                <div className="w-px h-4 bg-border mx-1" />
                <ToolbarButton
                  onClick={setLink}
                  isActive={editor.isActive("link")}
                  title="Add Link"
                >
                  <LinkIcon size={iconSize} />
                </ToolbarButton>
              </>
            )}
          </div>
        )}
        
        {/* Editor */}
        <EditorContent
          editor={editor}
          className={cn(
            "bg-background",
            "[&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
            "[&_.is-editor-empty]:before:text-muted-foreground",
            "[&_.is-editor-empty]:before:opacity-50",
            "[&_.is-editor-empty]:before:pointer-events-none",
            "[&_.is-editor-empty]:before:float-left",
            "[&_.is-editor-empty]:before:h-0"
          )}
        />
      </div>
    </div>
  )
}

function ToolbarButton({
  onClick,
  isActive,
  title,
  children,
}: {
  onClick: () => void
  isActive?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded hover:bg-accent transition-colors",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </button>
  )
}
