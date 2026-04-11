import type { ReactNode } from "react"

interface Props {
  variant: "full" | "split"
  backgroundImage: string
  overlay: boolean
  _slots?: Record<string, ReactNode>
}

export function HeroContainer({ backgroundImage, overlay, _slots }: Props) {
  const bg = backgroundImage ? `url(${backgroundImage}) center/cover no-repeat` : undefined
  return (
    <section className="relative py-16 sm:py-20" style={{ background: bg }}>
      {overlay && <div className="absolute inset-0 bg-black/50" />}
      <div className="relative max-w-3xl mx-auto text-center px-6">
        {_slots?.content ?? (
          <div className="flex items-center justify-center h-32 rounded border-2 border-dashed border-gray-300 text-sm text-gray-400">
            Drop blocks here
          </div>
        )}
      </div>
    </section>
  )
}
