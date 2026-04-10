interface TextProps {
  text: string; fontSize: number; fontWeight: number; color: string
  alignment: "left" | "center" | "right"; tagName: "p" | "h1" | "h2" | "h3" | "h4" | "span"
}

export function Text({ text, fontSize, fontWeight, color, alignment, tagName }: TextProps) {
  const Tag = tagName
  return (
    <div style={{ textAlign: alignment }}>
      <Tag style={{ fontSize, fontWeight, color, margin: 0, lineHeight: 1.6 }}>{text}</Tag>
    </div>
  )
}
