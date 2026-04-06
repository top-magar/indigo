import type { CSSProperties } from "react"

interface ButtonProps {
  text: string
  href: string
  variant: "solid" | "outline" | "ghost"
  size: "sm" | "md" | "lg"
  alignment: "left" | "center" | "right"
  color: string
  textColor: string
  fullWidth: boolean
}

const sizeMap = { sm: { padding: "8px 16px", fontSize: 13 }, md: { padding: "12px 24px", fontSize: 15 }, lg: { padding: "16px 32px", fontSize: 17 } } as const
const alignMap = { left: "flex-start", center: "center", right: "flex-end" } as const

export function ButtonRender({ text, href, variant, size, alignment, color, textColor, fullWidth }: ButtonProps) {
  const s = sizeMap[size]
  const base: CSSProperties = { display: "inline-block", padding: s.padding, fontSize: s.fontSize, fontWeight: 600, borderRadius: "var(--v2-radius, 8px)", textDecoration: "none", cursor: "pointer", textAlign: "center", width: fullWidth ? "100%" : undefined }

  const styles: Record<string, CSSProperties> = {
    solid: { ...base, backgroundColor: color, color: textColor, border: "none" },
    outline: { ...base, backgroundColor: "transparent", color, border: `2px solid ${color}` },
    ghost: { ...base, backgroundColor: "transparent", color, border: "none" },
  }

  return (
    <div style={{ display: "flex", justifyContent: alignMap[alignment] }}>
      <a href={href} style={styles[variant]}>{text}</a>
    </div>
  )
}
