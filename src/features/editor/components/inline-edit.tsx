"use client"

import { useCallback, useRef, useEffect } from "react"

interface InlineEditProps {
  value: string
  onChange: (value: string) => void
  enabled: boolean
  tag?: React.ElementType
  style?: React.CSSProperties
  className?: string
}

/** Makes any text element contentEditable when enabled (block is selected). */
export function InlineEdit({ value, onChange, enabled, tag: Tag = "span", style, className }: InlineEditProps) {
  const ref = useRef<HTMLElement>(null)

  const handleBlur = useCallback(() => {
    const el = ref.current
    if (!el) return
    const text = el.innerText.trim()
    if (text !== value) onChange(text)
  }, [value, onChange])

  // Sync value when it changes externally (e.g. from settings panel)
  useEffect(() => {
    const el = ref.current
    if (el && !el.matches(":focus") && el.innerText.trim() !== value) {
      el.innerText = value
    }
  }, [value])

  return (
    // @ts-expect-error — dynamic tag
    <Tag
      ref={ref}
      contentEditable={enabled}
      suppressContentEditableWarning
      onBlur={handleBlur}
      style={{ ...style, outline: "none", cursor: enabled ? "text" : "inherit" }}
      className={className}
    >
      {value}
    </Tag>
  )
}
