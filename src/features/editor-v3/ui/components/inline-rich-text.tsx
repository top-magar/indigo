"use client"
import { useCallback, useEffect, useState, useRef } from "react"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { LinkNode } from "@lexical/link"
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html"
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $insertNodes,
  FORMAT_TEXT_COMMAND,
  COMMAND_PRIORITY_LOW,
  BLUR_COMMAND,
  type TextFormatType,
} from "lexical"
import { TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link"
import { $getNearestNodeOfType } from "@lexical/utils"
import { Bold, Italic, Strikethrough, Link2 } from "lucide-react"
import type { InstanceId } from "../../types"

// ── Floating Toolbar Plugin ──

function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const [isBold, setIsBold] = useState(false)
  const [isItalic, setIsItalic] = useState(false)
  const [isStrike, setIsStrike] = useState(false)
  const [isLink, setIsLink] = useState(false)

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return
        setIsBold(selection.hasFormat("bold"))
        setIsItalic(selection.hasFormat("italic"))
        setIsStrike(selection.hasFormat("strikethrough"))
        const node = selection.anchor.getNode()
        const parent = node.getParent()
        setIsLink($isLinkNode(parent) || $isLinkNode(node))
      })
    })
  }, [editor])

  const format = (type: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, type)
  }

  const toggleLink = () => {
    if (isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    } else {
      const url = prompt("Enter URL:")
      if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url)
    }
  }

  const btnStyle = (active: boolean): React.CSSProperties => ({
    width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
    background: active ? "#334155" : "transparent", border: "none", borderRadius: 3,
    color: active ? "#fff" : "#94a3b8", cursor: "pointer",
  })

  return (
    <div style={{
      display: "flex", gap: 1, background: "#1e293b", borderRadius: 5, padding: "2px 3px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)", marginBottom: 4,
    }}>
      <button onClick={() => format("bold")} style={btnStyle(isBold)}><Bold size={13} /></button>
      <button onClick={() => format("italic")} style={btnStyle(isItalic)}><Italic size={13} /></button>
      <button onClick={() => format("strikethrough")} style={btnStyle(isStrike)}><Strikethrough size={13} /></button>
      <button onClick={toggleLink} style={btnStyle(isLink)}><Link2 size={13} /></button>
    </div>
  )
}

// ── Blur Save Plugin ──

function BlurSavePlugin({ onSave }: { onSave: (html: string) => void }) {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      BLUR_COMMAND,
      () => {
        editor.update(() => {
          const html = $generateHtmlFromNodes(editor, null)
          // Strip wrapper <p> for inline text
          const clean = html.replace(/^<p>/, "").replace(/<\/p>$/, "")
          onSave(clean)
        })
        return false
      },
      COMMAND_PRIORITY_LOW,
    )
  }, [editor, onSave])

  return null
}

// ── Load HTML Plugin ──

function LoadHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext()
  const loaded = useRef(false)

  useEffect(() => {
    if (loaded.current || !html) return
    loaded.current = true

    editor.update(() => {
      const root = $getRoot()
      root.clear()
      const parser = new DOMParser()
      // Wrap in <p> if it's inline content
      const wrapped = html.startsWith("<") ? html : `<p>${html}</p>`
      const dom = parser.parseFromString(wrapped, "text/html")
      const nodes = $generateNodesFromDOM(editor, dom)
      $insertNodes(nodes)
    })
  }, [editor, html])

  return null
}

// ── Theme ──

const theme = {
  text: {
    bold: "lexical-bold",
    italic: "lexical-italic",
    strikethrough: "lexical-strikethrough",
    underline: "lexical-underline",
  },
  link: "lexical-link",
}

// ── Main Component ──

export function InlineRichText({ instanceId, initialContent, onSave }: {
  instanceId: InstanceId
  initialContent: string
  onSave: (html: string) => void
}) {
  const initialConfig = {
    namespace: `inline-${instanceId}`,
    theme,
    nodes: [LinkNode],
    onError: (error: Error) => console.error("[LexicalInline]", error),
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <style>{`
        .lexical-bold { font-weight: bold; }
        .lexical-italic { font-style: italic; }
        .lexical-strikethrough { text-decoration: line-through; }
        .lexical-underline { text-decoration: underline; }
        .lexical-link { color: #3b82f6; text-decoration: underline; }
      `}</style>
      <LexicalComposer initialConfig={initialConfig}>
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              style={{ outline: "none", minHeight: "1em" }}
              aria-label="Edit text"
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <LinkPlugin />
        <LoadHtmlPlugin html={initialContent} />
        <BlurSavePlugin onSave={onSave} />
      </LexicalComposer>
    </div>
  )
}
