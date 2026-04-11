"use client"
import React, { useRef, useState, useCallback } from "react"
import { useBlockMode } from "./data-context"
import { useEditorStore } from "../store"

interface EditableTextProps {
  value: string
  sectionId: string
  propName: string
  as?: keyof React.JSX.IntrinsicElements
  className?: string
  style?: React.CSSProperties
  placeholder?: string
}

export function EditableText({ value, sectionId, propName, as: tag = "span", className, style, placeholder }: EditableTextProps) {
  const { mode } = useBlockMode()
  const updateProps = useEditorStore((s) => s.updateProps)
  const [editing, setEditing] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const Tag = tag

  const handleBlur = useCallback(() => {
    setEditing(false)
    const newText = ref.current?.textContent ?? ""
    if (newText !== value) updateProps(sectionId, { [propName]: newText })
  }, [value, sectionId, propName, updateProps])

  // @ts-expect-error — dynamic intrinsic element
  if (mode !== "editor") return <Tag className={className} style={style}>{value}</Tag>

  return (
    // @ts-expect-error — dynamic intrinsic element with contentEditable props
    <Tag
      ref={ref}
      className={className}
      style={{ ...style, outline: editing ? "2px solid #3b82f6" : undefined, borderRadius: editing ? 2 : undefined, cursor: "text", minWidth: 20 }}
      contentEditable={editing}
      suppressContentEditableWarning
      onDoubleClick={(e: React.MouseEvent) => { e.stopPropagation(); setEditing(true); setTimeout(() => ref.current?.focus(), 0) }}
      onBlur={handleBlur}
      onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ref.current?.blur() } if (e.key === "Escape") { ref.current!.textContent = value; ref.current?.blur() } }}
      data-placeholder={!value ? (placeholder ?? "Type here...") : undefined}
    >
      {value || placeholder || "Type here..."}
    </Tag>
  )
}
