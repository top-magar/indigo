import type { ReactNode } from "react"

interface Props {
  backgroundColor: string
  textColor: string
  _slots?: Record<string, ReactNode>
}

export function FooterContainer({ backgroundColor = "#111827", textColor = "#f9fafb", _slots }: Props) {
  return (
    <footer style={{ backgroundColor, color: textColor }} className="px-6 py-10">
      <div className="max-w-[1200px] mx-auto">
        {_slots?.top}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-8">
          {_slots?.columns}
        </div>
        {_slots?.bottom}
      </div>
    </footer>
  )
}
