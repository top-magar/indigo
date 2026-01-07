"use client"

import { type Editor } from "@tiptap/react"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Unlink,
} from "lucide-react"
import { cn } from "@/shared/utils"
import { type ToolbarConfig, defaultToolbarConfig } from "./types"
import { useCallback, useState } from "react"

interface ToolbarProps {
  editor: Editor | null
  config?: ToolbarConfig
  className?: string
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  children: React.ReactNode
  title?: string
  ariaLabel: string
}

function ToolbarButton({ onClick, isActive, disabled, children, title, ariaLabel }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      className={cn(
        "p-1.5 rounded hover:bg-accent transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive && "bg-accent text-accent-foreground"
      )}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <div className="w-px h-5 bg-border mx-1" role="separator" aria-orientation="vertical" />
}

export function RichTextToolbar({ editor, config = defaultToolbarConfig, className }: ToolbarProps) {
  const [showLinkInput, setShowLinkInput] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")

  const setLink = useCallback(() => {
    if (!editor) return

    if (linkUrl === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run()
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run()
    }
    setShowLinkInput(false)
    setLinkUrl("")
  }, [editor, linkUrl])

  const openLinkInput = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes("link").href || ""
    setLinkUrl(previousUrl)
    setShowLinkInput(true)
  }, [editor])

  if (!editor) return null

  const iconSize = 16

  return (
    <div
      role="toolbar"
      aria-label="Text formatting toolbar"
      className={cn(
        "flex items-center gap-0.5 p-1 bg-popover border rounded-lg shadow-lg",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Text formatting */}
      {config.bold && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Cmd+B)"
          ariaLabel="Toggle bold formatting"
        >
          <Bold size={iconSize} />
        </ToolbarButton>
      )}

      {config.italic && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Cmd+I)"
          ariaLabel="Toggle italic formatting"
        >
          <Italic size={iconSize} />
        </ToolbarButton>
      )}

      {config.underline && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive("underline")}
          title="Underline (Cmd+U)"
          ariaLabel="Toggle underline formatting"
        >
          <Underline size={iconSize} />
        </ToolbarButton>
      )}

      {config.strike && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough"
          ariaLabel="Toggle strikethrough formatting"
        >
          <Strikethrough size={iconSize} />
        </ToolbarButton>
      )}

      {config.code && (
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Code"
          ariaLabel="Toggle code formatting"
        >
          <Code size={iconSize} />
        </ToolbarButton>
      )}

      {/* Headings */}
      {config.heading && (
        <>
          <ToolbarDivider />
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive("heading", { level: 1 })}
            title="Heading 1"
            ariaLabel="Toggle heading level 1"
          >
            <Heading1 size={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive("heading", { level: 2 })}
            title="Heading 2"
            ariaLabel="Toggle heading level 2"
          >
            <Heading2 size={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive("heading", { level: 3 })}
            title="Heading 3"
            ariaLabel="Toggle heading level 3"
          >
            <Heading3 size={iconSize} />
          </ToolbarButton>
        </>
      )}

      {/* Lists */}
      {(config.bulletList || config.orderedList) && (
        <>
          <ToolbarDivider />
          {config.bulletList && (
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              title="Bullet List"
              ariaLabel="Toggle bullet list"
            >
              <List size={iconSize} />
            </ToolbarButton>
          )}
          {config.orderedList && (
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              title="Numbered List"
              ariaLabel="Toggle numbered list"
            >
              <ListOrdered size={iconSize} />
            </ToolbarButton>
          )}
        </>
      )}

      {/* Text alignment */}
      {config.textAlign && (
        <>
          <ToolbarDivider />
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            isActive={editor.isActive({ textAlign: "left" })}
            title="Align Left"
            ariaLabel="Align text left"
          >
            <AlignLeft size={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            isActive={editor.isActive({ textAlign: "center" })}
            title="Align Center"
            ariaLabel="Align text center"
          >
            <AlignCenter size={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            isActive={editor.isActive({ textAlign: "right" })}
            title="Align Right"
            ariaLabel="Align text right"
          >
            <AlignRight size={iconSize} />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            isActive={editor.isActive({ textAlign: "justify" })}
            title="Justify"
            ariaLabel="Justify text"
          >
            <AlignJustify size={iconSize} />
          </ToolbarButton>
        </>
      )}

      {/* Link */}
      {config.link && (
        <>
          <ToolbarDivider />
          {showLinkInput ? (
            <div className="flex items-center gap-1 px-1" role="group" aria-label="Link input">
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://..."
                aria-label="Enter URL for link"
                className="w-32 px-2 py-1 text-xs border rounded bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    setLink()
                  }
                  if (e.key === "Escape") {
                    setShowLinkInput(false)
                    setLinkUrl("")
                  }
                }}
                autoFocus
              />
              <button
                type="button"
                onClick={setLink}
                aria-label="Apply link"
                className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded"
              >
                Set
              </button>
            </div>
          ) : (
            <>
              <ToolbarButton
                onClick={openLinkInput}
                isActive={editor.isActive("link")}
                title="Add Link"
                ariaLabel="Add or edit link"
              >
                <Link size={iconSize} />
              </ToolbarButton>
              {editor.isActive("link") && (
                <ToolbarButton
                  onClick={() => editor.chain().focus().unsetLink().run()}
                  title="Remove Link"
                  ariaLabel="Remove link"
                >
                  <Unlink size={iconSize} />
                </ToolbarButton>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
