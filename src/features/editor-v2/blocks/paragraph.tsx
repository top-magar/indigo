interface ParagraphProps {
  text: string; alignment: "left" | "center" | "right"
}

export function ParagraphBlock({ text, alignment }: ParagraphProps) {
  return (
    <p style={{ color: "var(--store-color-muted)", textAlign: alignment, margin: 0 }}>{text}</p>
  )
}
