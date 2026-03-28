"use client"

import { useNode } from "@craftjs/core"
import { useState, useEffect } from "react"
import { craftRef } from "../craft-ref"

interface TextBlockProps {
  text: string
  fontSize: number
  color: string
  alignment: "left" | "center" | "right"
  tagName: "p" | "h1" | "h2" | "h3" | "span"
}

export const TextBlock = ({ text, fontSize, color, alignment, tagName }: TextBlockProps) => {
  const {
    connectors: { connect, drag },
    isSelected,
    actions: { setProp },
  } = useNode((node) => ({
    isSelected: node.events.selected,
  }))

  const [editable, setEditable] = useState(false)

  useEffect(() => {
    if (!isSelected) setEditable(false)
  }, [isSelected])

  const Tag = tagName

  return (
    <div
      ref={craftRef(connect, drag)}
      className="cursor-pointer"
      onClick={() => isSelected && setEditable(true)}
    >
      <Tag
        contentEditable={editable}
        suppressContentEditableWarning
        onBlur={(e) =>
          setProp((props: TextBlockProps) => (props.text = e.currentTarget.innerText))
        }
        style={{ fontSize, color, textAlign: alignment, outline: "none", margin: 0 }}
      >
        {text}
      </Tag>
    </div>
  )
}

const TextSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as TextBlockProps }))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Text
        <textarea
          value={props.text}
          onChange={(e) => setProp((p: TextBlockProps) => (p.text = e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
          rows={3}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Tag
        <select
          value={props.tagName}
          onChange={(e) => setProp((p: TextBlockProps) => (p.tagName = e.target.value as any))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="span">Span</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Font Size ({props.fontSize}px)
        <input
          type="range"
          min={10}
          max={96}
          value={props.fontSize}
          onChange={(e) => setProp((p: TextBlockProps) => (p.fontSize = +e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Color
        <input
          type="color"
          value={props.color}
          onChange={(e) => setProp((p: TextBlockProps) => (p.color = e.target.value))}
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Alignment
        <select
          value={props.alignment}
          onChange={(e) => setProp((p: TextBlockProps) => (p.alignment = e.target.value as any))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </label>
    </div>
  )
}

TextBlock.craft = {
  displayName: "Text",
  props: { _v: 1,
    text: "Edit this text",
    fontSize: 16,
    color: "#000000",
    alignment: "left",
    tagName: "p",
  },
  related: { settings: TextSettings },
}
