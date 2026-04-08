"use client"

import { useRef, useEffect, useState, type CSSProperties, type ReactNode } from "react"

export type ScrollEffect = "none" | "fadeIn" | "fadeOut" | "parallax" | "zoomIn"

interface Props {
  effect: ScrollEffect
  children: ReactNode
}

export function ScrollEffectWrapper({ effect, children }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (effect === "none" || !ref.current) return
    const el = ref.current

    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 = just entered bottom, 1 = fully visible/past center
      const p = Math.min(1, Math.max(0, 1 - rect.top / vh))
      setProgress(p)
    }

    // Find scrollable parent (editor canvas or window)
    let scrollParent: HTMLElement | Window = window
    let parent = el.parentElement
    while (parent) {
      const ov = getComputedStyle(parent).overflowY
      if (ov === "auto" || ov === "scroll") { scrollParent = parent; break }
      parent = parent.parentElement
    }

    scrollParent.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => scrollParent.removeEventListener("scroll", onScroll)
  }, [effect])

  if (effect === "none") return <>{children}</>

  const style: CSSProperties = {}

  switch (effect) {
    case "fadeIn":
      style.opacity = progress
      style.transition = "opacity 0.1s linear"
      break
    case "fadeOut":
      style.opacity = 1 - progress * 0.8
      style.transition = "opacity 0.1s linear"
      break
    case "parallax":
      style.transform = `translateY(${(1 - progress) * 40}px)`
      style.willChange = "transform"
      break
    case "zoomIn":
      style.transform = `scale(${0.9 + progress * 0.1})`
      style.opacity = Math.min(1, progress * 1.5)
      style.willChange = "transform, opacity"
      break
  }

  return <div ref={ref} style={style}>{children}</div>
}
