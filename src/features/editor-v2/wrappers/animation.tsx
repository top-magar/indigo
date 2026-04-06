"use client"

import { useRef, useEffect, useState, type ReactNode } from "react"

interface AnimationProps {
  entrance?: "none" | "fadeIn" | "slideUp" | "slideLeft" | "zoomIn"
  trigger?: "scroll" | "load"
  duration?: number
  delay?: number
  children: ReactNode
}

const keyframes: Record<string, string> = {
  fadeIn: "from{opacity:0}to{opacity:1}",
  slideUp: "from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}",
  slideLeft: "from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}",
  zoomIn: "from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:none}",
}

export function AnimationWrapper({ entrance = "none", trigger = "scroll", duration = 500, delay = 0, children }: AnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(trigger === "load")

  useEffect(() => {
    if (entrance === "none" || trigger !== "scroll" || !ref.current) return
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); observer.disconnect() } }, { threshold: 0.1 })
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [entrance, trigger])

  if (entrance === "none") return <>{children}</>

  const kf = keyframes[entrance]
  const animName = `v2-${entrance}`

  return (
    <div ref={ref} style={{ opacity: visible ? undefined : 0, animation: visible ? `${animName} ${duration}ms ease ${delay}ms both` : undefined }}>
      {visible && <style>{`@keyframes ${animName}{${kf}}`}</style>}
      {children}
    </div>
  )
}
