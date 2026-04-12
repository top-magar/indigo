import type { ReactNode } from "react"

type Layout = "columns" | "stacked" | "minimal"

interface Props {
  layout: Layout
  backgroundColor: string
  textColor: string
  _slots?: Record<string, ReactNode>
}

const placeholder = (
  <div className="h-8 rounded border-2 border-dashed border-gray-300 px-4 text-xs text-gray-400 flex items-center justify-center">
    Drop blocks here
  </div>
)

export function FooterContainer({ layout = "columns", backgroundColor = "#111827", textColor = "#f9fafb", _slots }: Props) {
  const isMinimal = layout === "minimal"
  const isStacked = layout === "stacked"

  return (
    <footer style={{ backgroundColor, color: textColor }} className="px-6 py-10" role="contentinfo">
      <div className="max-w-[1200px] mx-auto">
        {/* Brand zone */}
        <div className={`mb-8 ${isStacked ? "text-center" : ""}`}>
          {_slots?.brand ?? placeholder}
        </div>

        {/* Main content zone */}
        {isMinimal ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            {_slots?.content ?? placeholder}
          </div>
        ) : (
          <div className={`grid gap-8 mb-8 ${isStacked ? "grid-cols-1 max-w-md mx-auto" : "grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4"}`}>
            {_slots?.content ?? placeholder}
          </div>
        )}

        {/* Bottom bar zone */}
        <div className={`flex flex-wrap items-center gap-4 pt-6 ${isStacked ? "justify-center" : "justify-between"}`}
          style={{ borderTop: `1px solid color-mix(in srgb, ${textColor} 12%, transparent)` }}>
          {_slots?.bottom ?? placeholder}
        </div>
      </div>
    </footer>
  )
}
