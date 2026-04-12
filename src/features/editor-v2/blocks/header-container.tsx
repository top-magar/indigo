"use client"
import { useState, useEffect, useCallback, type ReactNode } from "react"
import { Menu, X } from "lucide-react"
import { useBlockMode } from "./data-context"

type Layout = "left-right" | "left-center-right" | "center-only"

interface Props {
  layout: Layout
  sticky: boolean
  transparent: boolean
  borderBottom: boolean
  backgroundColor: string
  _slots?: Record<string, ReactNode>
}

const gridConfig: Record<Layout, { areas: string; columns: string }> = {
  "left-right":        { areas: `"left right"`,       columns: "auto 1fr" },
  "left-center-right": { areas: `"left center right"`, columns: "1fr auto 1fr" },
  "center-only":       { areas: `"center"`,            columns: "1fr" },
}

const placeholder = (
  <div className="h-8 rounded border-2 border-dashed border-gray-300 px-4 text-xs text-gray-400 flex items-center">
    Drop blocks here
  </div>
)

export function HeaderContainer({ layout = "left-right", sticky, borderBottom, transparent, backgroundColor, _slots }: Props) {
  const [scrolled, setScrolled] = useState(false)
  const { mode } = useBlockMode()
  const isEditor = mode === "editor"

  const onScroll = useCallback(() => setScrolled(window.scrollY > 20), [])
  useEffect(() => {
    if (!transparent || isEditor) return
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [transparent, isEditor, onScroll])

  const isTransparent = transparent && !scrolled && !isEditor
  const bg = isTransparent ? "transparent" : backgroundColor
  const border = borderBottom && !isTransparent
  const grid = gridConfig[layout]

  return (
    <div className={sticky && !isEditor ? "sticky top-0 z-50" : ""}>
      {_slots?.announcement}

      {/* Desktop */}
      <header
        className={`hidden @sm:grid items-center gap-4 px-6 py-3 transition-colors ${border ? "border-b border-gray-200" : ""}`}
        style={{ backgroundColor: bg, gridTemplateAreas: grid.areas, gridTemplateColumns: grid.columns }}
        role="banner"
      >
        {layout !== "center-only" && (
          <div className="flex items-center gap-3" style={{ gridArea: "left" }}>
            {_slots?.left ?? placeholder}
          </div>
        )}
        {(layout === "left-center-right" || layout === "center-only") && (
          <div className="flex items-center justify-center gap-4" style={{ gridArea: "center" }}>
            {_slots?.center ?? placeholder}
          </div>
        )}
        {layout !== "center-only" && (
          <div className="flex items-center gap-3 justify-end" style={{ gridArea: "right" }}>
            {_slots?.right ?? placeholder}
          </div>
        )}
      </header>

      {/* Mobile — always left + hamburger, drawer shows all slots */}
      <div className={`@sm:hidden flex items-center justify-between px-6 py-3 transition-colors ${border ? "border-b border-gray-200" : ""}`} style={{ backgroundColor: bg }} role="banner">
        <div className="flex items-center gap-3">{_slots?.left ?? placeholder}</div>
        <MobileToggle slots={_slots} />
      </div>
    </div>
  )
}

function MobileToggle({ slots }: { slots?: Record<string, ReactNode> }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [open])

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
      {open && (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 max-w-[80vw] bg-white shadow-xl flex flex-col p-6 gap-4 overflow-y-auto">
            <button onClick={() => setOpen(false)} className="self-end" aria-label="Close menu"><X size={22} /></button>
            {slots?.center}
            {slots?.right}
          </div>
        </div>
      )}
    </>
  )
}
