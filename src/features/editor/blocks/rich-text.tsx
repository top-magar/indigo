"use client"

import { useNode } from "@craftjs/core"
import { useState, useEffect } from "react"
import { craftRef } from "../craft-ref"

interface RichTextProps {
  content: string
  maxWidth: number
  padding: number
}

export const RichTextBlock = ({ content, maxWidth, padding }: RichTextProps) => {
  const {
    connectors: { connect, drag },
    isSelected,
    actions: { setProp },
  } = useNode((n) => ({ isSelected: n.events.selected }))

  const [editable, setEditable] = useState(false)

  useEffect(() => {
    if (!isSelected) setEditable(false)
  }, [isSelected])

  // Sanitize HTML to prevent XSS — strip script tags and event handlers
  const sanitized = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, "")

  return (
    <div
      ref={craftRef(connect, drag)}
      className="cursor-pointer"
      onClick={() => isSelected && setEditable(true)}
      style={{ maxWidth, margin: "0 auto", padding }}
    >
      <div
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={(e) =>
          setProp((p: RichTextProps) => (p.content = e.currentTarget.innerHTML))
        }
        dangerouslySetInnerHTML={{ __html: sanitized }}
        style={{ outline: "none", lineHeight: 1.7, fontSize: 16 }}
      />
    </div>
  )
}

const RichTextSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as RichTextProps }))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Content (HTML)
        <textarea
          value={props.content}
          onChange={(e) => setProp((p: RichTextProps) => (p.content = e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono"
          rows={6}
        />
      </label>
      <p className="text-[10px] text-muted-foreground">
        Tip: Click the block on canvas to edit inline. Supports HTML tags.
      </p>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Max Width ({props.maxWidth}px)
        <input
          type="range"
          min={400}
          max={1200}
          value={props.maxWidth}
          onChange={(e) => setProp((p: RichTextProps) => (p.maxWidth = +e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Padding ({props.padding}px)
        <input
          type="range"
          min={0}
          max={64}
          value={props.padding}
          onChange={(e) => setProp((p: RichTextProps) => (p.padding = +e.target.value))}
        />
      </label>
    </div>
  )
}

RichTextBlock.craft = {
  displayName: "Rich Text",
  props: {
    content: "<h2>About Us</h2><p>Tell your story here. You can use <strong>bold</strong>, <em>italic</em>, and other HTML formatting.</p>",
    maxWidth: 800,
    padding: 24,
  } satisfies RichTextProps,
  related: { settings: RichTextSettings },
}
