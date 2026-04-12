interface CopyrightBarProps {
  text: string
}

export function CopyrightBar({ text = "© 2026 My Store. All rights reserved." }: CopyrightBarProps) {
  return (
    <p className="text-sm" style={{ textAlign: "center", color: "var(--store-color-muted, #64748b)", borderTop: "1px solid #e5e7eb", padding: "12px 0", margin: 0 }}>{text}</p>
  )
}
