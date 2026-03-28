"use client"

import { useNode } from "@craftjs/core"
import { craftRef } from "../craft-ref"

interface ButtonBlockProps {
  text: string
  href: string
  variant: "primary" | "secondary" | "outline" | "ghost"
  size: "sm" | "md" | "lg"
  fullWidth: boolean
}

const variantStyles: Record<string, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
  ghost: "hover:bg-accent hover:text-accent-foreground",
}

const sizeStyles: Record<string, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
}

export const ButtonBlock = ({ text, variant, size, fullWidth }: ButtonBlockProps) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div ref={craftRef(connect, drag)} className="cursor-pointer">
      <button
        className={`inline-flex items-center justify-center rounded-md font-medium transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? "w-full" : ""}`}
        onClick={(e) => e.preventDefault()}
      >
        {text}
      </button>
    </div>
  )
}

const ButtonSettings = () => {
  const {
    actions: { setProp },
    props,
  } = useNode((node) => ({ props: node.data.props as ButtonBlockProps }))

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Text
        <input
          type="text"
          value={props.text}
          onChange={(e) => setProp((p: ButtonBlockProps) => (p.text = e.target.value))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Link
        <input
          type="text"
          value={props.href}
          onChange={(e) => setProp((p: ButtonBlockProps) => (p.href = e.target.value))}
          placeholder="/products"
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Variant
        <select
          value={props.variant}
          onChange={(e) => setProp((p: ButtonBlockProps) => (p.variant = e.target.value as any))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost</option>
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Size
        <select
          value={props.size}
          onChange={(e) => setProp((p: ButtonBlockProps) => (p.size = e.target.value as any))}
          className="rounded-md border border-border bg-background px-2 py-1.5 text-sm"
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </label>
      <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <input
          type="checkbox"
          checked={props.fullWidth}
          onChange={(e) => setProp((p: ButtonBlockProps) => (p.fullWidth = e.target.checked))}
        />
        Full Width
      </label>
    </div>
  )
}

ButtonBlock.craft = {
  displayName: "Button",
  props: { _v: 1,
    text: "Click me",
    href: "#",
    variant: "primary",
    size: "md",
    fullWidth: false,
  },
  related: { settings: ButtonSettings },
}
