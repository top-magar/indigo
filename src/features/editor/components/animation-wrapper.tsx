"use client"

import { useRef, useEffect, useState, type CSSProperties } from "react"
import { ENTRANCE_KEYFRAMES, HOVER_STYLES, ANIMATION_STYLES, type AnimationConfig } from "./animation-control"

let stylesInjected = false

function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return
  stylesInjected = true
  const style = document.createElement("style")
  style.textContent = ANIMATION_STYLES
  document.head.appendChild(style)
}

/**
 * Wraps a rendered element with entrance + hover animations.
 * Uses Intersection Observer for scroll-triggered entrance.
 */
export function AnimationWrapper({
  animation,
  children,
}: {
  animation: AnimationConfig
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)

  const hasEntrance = animation.entrance !== "none"
  const hasHover = animation.hover !== "none"

  // Inject keyframe CSS once
  useEffect(() => {
    if (hasEntrance) injectStyles()
  }, [hasEntrance])

  // Intersection Observer for entrance (only when trigger is "scroll")
  useEffect(() => {
    if (!hasEntrance || animation.trigger === "load") {
      setVisible(true)
      return
    }
    if (!ref.current) { setVisible(true); return }
    const el = ref.current
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasEntrance])

  if (!hasEntrance && !hasHover) return <>{children}</>

  const entranceStyle: CSSProperties = hasEntrance && !visible
    ? { opacity: 0 }
    : hasEntrance && visible
      ? {
          animation: `${ENTRANCE_KEYFRAMES[animation.entrance]} ${animation.duration}ms ease-out ${animation.delay}ms both`,
        }
      : {}

  const hoverStyle: CSSProperties = hovered && hasHover
    ? HOVER_STYLES[animation.hover] ?? {}
    : {}

  return (
    <div
      ref={ref}
      onMouseEnter={hasHover ? () => setHovered(true) : undefined}
      onMouseLeave={hasHover ? () => setHovered(false) : undefined}
      style={{
        ...entranceStyle,
        ...hoverStyle,
        transition: hasHover ? `transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease` : undefined,
      }}
    >
      {children}
    </div>
  )
}
