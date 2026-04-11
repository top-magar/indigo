import { useEffect, useState } from "react"

interface ScrollProgressProps {
  color: string; height: number; position: "top" | "bottom"
}

export function ScrollProgress({ color = "var(--color-primary, #000)", height = 3, position = "top" }: ScrollProgressProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let raf: number
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        const scrollTop = document.documentElement.scrollTop
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
        setProgress(scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0)
      })
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div
      style={{
        position: "fixed", [position === "top" ? "top" : "bottom"]: 0, left: 0,
        width: `${progress}%`, height, backgroundColor: color, zIndex: 50, transition: "width 0.1s",
      }}
    />
  )
}
