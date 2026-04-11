import type { ReactNode } from "react"

interface Props {
  sticky: boolean
  borderBottom: boolean
  backgroundColor: string
  _slots?: Record<string, ReactNode>
}

const placeholder = (
  <div className="h-8 rounded border-2 border-dashed border-gray-300 px-4 text-xs text-gray-400 flex items-center">
    Drop blocks here
  </div>
)

export function HeaderContainer({ sticky, borderBottom, backgroundColor, _slots }: Props) {
  return (
    <header className={sticky ? "sticky top-0 z-50" : ""} style={{ backgroundColor, borderBottom: borderBottom ? "1px solid #e5e7eb" : undefined }}>
      {_slots?.announcement}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">{_slots?.left ?? placeholder}</div>
        <div className="flex items-center gap-4">{_slots?.right ?? placeholder}</div>
      </div>
    </header>
  )
}
