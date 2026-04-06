interface TextProps {
  content: string
  fontSize: number
  lineHeight: number
  alignment: "left" | "center" | "right"
  color: string
  maxWidth: number
  paddingTop: number
  paddingBottom: number
}

export function TextRender({ content, fontSize, lineHeight, alignment, color, maxWidth, paddingTop, paddingBottom }: TextProps) {
  return (
    <div style={{ padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px` }}>
      <div
        style={{
          maxWidth: maxWidth || undefined,
          margin: alignment === "center" ? "0 auto" : undefined,
          fontSize,
          lineHeight,
          textAlign: alignment,
          color: color || undefined,
          fontFamily: "var(--v2-font-body, inherit)",
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
