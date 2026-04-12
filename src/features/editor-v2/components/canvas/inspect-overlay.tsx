"use client"

import { useEffect, useRef, useCallback } from "react"

interface InspectOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>
}

export function InspectOverlay({ containerRef }: InspectOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const altHeld = useRef(false)
  const activeEl = useRef<HTMLElement | null>(null)

  const show = useCallback((target: HTMLElement) => {
    const overlay = overlayRef.current
    const container = containerRef.current
    if (!overlay || !container) return

    const cs = getComputedStyle(target)
    const rect = target.getBoundingClientRect()
    const cRect = container.getBoundingClientRect()

    const top = rect.top - cRect.top + container.scrollTop
    const left = rect.left - cRect.left + container.scrollLeft

    overlay.style.top = `${top}px`
    overlay.style.left = `${left}px`
    overlay.style.width = `${rect.width}px`
    overlay.style.height = `${rect.height}px`
    overlay.style.display = "block"

    const pad = `${parseInt(cs.paddingTop)}/${parseInt(cs.paddingRight)}/${parseInt(cs.paddingBottom)}/${parseInt(cs.paddingLeft)}`
    const mar = `${parseInt(cs.marginTop)}/${parseInt(cs.marginRight)}/${parseInt(cs.marginBottom)}/${parseInt(cs.marginLeft)}`

    overlay.innerHTML = `<div style="position:absolute;top:-1px;left:-1px;transform:translateY(-100%);background:rgba(15,23,42,0.9);color:#e2e8f0;font:10px/1.4 ui-monospace,monospace;padding:4px 6px;border-radius:4px;white-space:nowrap;pointer-events:none;backdrop-filter:blur(4px);z-index:100">
      <span style="color:#93c5fd">${Math.round(rect.width)}×${Math.round(rect.height)}</span>
      <span style="color:#6b7280"> │ </span>
      <span style="color:#86efac">P ${pad}</span>
      <span style="color:#6b7280"> │ </span>
      <span style="color:#fbbf24">M ${mar}</span>
      <span style="color:#6b7280"> │ </span>
      <span style="color:#c4b5fd">${cs.fontSize}</span>
      <span style="color:#6b7280"> │ </span>
      <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${cs.color};vertical-align:middle;border:1px solid rgba(255,255,255,0.2)"></span>
      <span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${cs.backgroundColor};vertical-align:middle;margin-left:2px;border:1px solid rgba(255,255,255,0.2)"></span>
    </div>`
  }, [containerRef])

  const hide = useCallback(() => {
    if (overlayRef.current) {
      overlayRef.current.style.display = "none"
      overlayRef.current.innerHTML = ""
    }
    activeEl.current = null
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Alt") { altHeld.current = true; if (activeEl.current) show(activeEl.current) }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") { altHeld.current = false; hide() }
    }
    const onMouseOver = (e: MouseEvent) => {
      if (!altHeld.current) return
      const section = (e.target as HTMLElement).closest("[data-section-idx]") as HTMLElement | null
      if (!section || section === activeEl.current) return
      activeEl.current = section
      show(section)
    }
    const onMouseOut = (e: MouseEvent) => {
      if (!altHeld.current) return
      const related = (e.relatedTarget as HTMLElement)?.closest("[data-section-idx]")
      if (!related) hide()
    }

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("keyup", onKeyUp)
    container.addEventListener("mouseover", onMouseOver)
    container.addEventListener("mouseout", onMouseOut)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("keyup", onKeyUp)
      container.removeEventListener("mouseover", onMouseOver)
      container.removeEventListener("mouseout", onMouseOut)
    }
  }, [containerRef, show, hide])

  return (
    <div
      ref={overlayRef}
      style={{ display: "none", position: "absolute", pointerEvents: "none", zIndex: 50, outline: "1px dashed rgba(59,130,246,0.5)" }}
    />
  )
}
