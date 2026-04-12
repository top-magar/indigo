import { EditableText } from "./editable-text"

interface ButtonProps {
  text: string; href: string; variant: "solid" | "outline" | "ghost"
  size: "sm" | "md" | "lg"; color: string; _sectionId?: string
}

const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-5 py-2.5 text-base", lg: "px-8 py-3.5 text-lg" } as const

export function Button({ text, href, variant, size, color, _sectionId }: ButtonProps) {
  const base = `inline-block font-semibold ${sizes[size]}`
  const style =
    variant === "solid" ? { backgroundColor: color, color: "#fff", borderRadius: "var(--store-btn-radius, 8px)" } :
    variant === "outline" ? { border: `2px solid ${color}`, color, borderRadius: "var(--store-btn-radius, 8px)" } :
    { color, borderRadius: "var(--store-btn-radius, 8px)" }

  return (
    <a href={href} className={base} style={style}>
      {_sectionId ? <EditableText value={text} sectionId={_sectionId} propName="text" as="span" /> : text}
    </a>
  )
}
