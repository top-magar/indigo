import type { ReactNode } from "react"

interface ColumnsProps {
  columns: number
  gap: number
  proportions: "equal" | "40-60" | "60-40" | "30-70" | "70-30"
  verticalAlign: "stretch" | "start" | "center" | "end"
  paddingTop: number
  paddingBottom: number
  backgroundColor: string
  children?: ReactNode
}

const proportionMap: Record<string, string> = {
  equal: "",
  "40-60": "2fr 3fr",
  "60-40": "3fr 2fr",
  "30-70": "3fr 7fr",
  "70-30": "7fr 3fr",
}

export function ColumnsRender({ columns, gap, proportions, verticalAlign, paddingTop, paddingBottom, backgroundColor, children }: ColumnsProps) {
  const grid = proportionMap[proportions] || `repeat(${columns}, 1fr)`

  return (
    <div style={{ padding: `${paddingTop}px var(--v2-section-gap-h, 24px) ${paddingBottom}px`, background: backgroundColor || undefined }}>
      <div style={{ maxWidth: "var(--v2-max-width, 1200px)", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: grid, gap, alignItems: verticalAlign, minHeight: 60 }}>
          {children}
        </div>
      </div>
    </div>
  )
}
