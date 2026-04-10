"use client"

import { useRef, useState, type CSSProperties } from "react"
import { useEditorStore } from "../store"

interface Props {
  sectionId: string
  propKey: string
  value: string
  tag?: "h1" | "h2" | "p" | "span"
  className?: string
  style?: CSSProperties
}

export function InlineEditable({ sectionId, propKey, value, tag: Tag = "p", className, style }: Props) {
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLElement>(null)

  const handleBlur = () => {
    setEditing(false)
    const text = ref.current?.innerText ?? ""
    if (text !== value) useEditorStore.getState().updateProps(sectionId, { [propKey]: text })
  }

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={className}
      style={{ ...style, outline: "none", borderBottom: editing ? "1px dashed currentColor" : undefined }}
      contentEditable={editing}
      suppressContentEditableWarning
      onDoubleClick={() => { setEditing(true); setTimeout(() => ref.current?.focus(), 0) }}
      onBlur={handleBlur}
    >
      {value}
    </Tag>
  )
}
