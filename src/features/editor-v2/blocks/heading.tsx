interface HeadingProps {
  text: string; level: "h1" | "h2" | "h3" | "h4"; alignment: "left" | "center" | "right"
}

export function HeadingBlock({ text, level, alignment }: HeadingProps) {
  const Tag = level
  return (
    <Tag style={{ fontFamily: "var(--store-font-heading)", fontWeight: "var(--store-heading-weight)" as never, color: "var(--store-color-text)", textAlign: alignment, margin: 0 }}>
      {text}
    </Tag>
  )
}
