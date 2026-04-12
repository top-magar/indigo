"use client"

import { useCallback, useRef } from "react"

interface ResizeHandleProps {
  onResize: (delta: number) => void
}

export function ResizeHandle({ onResize }: ResizeHandleProps) {
  const dragging = useRef(false)
  const lastX = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    lastX.current = e.clientX
    const onMouseMove = (ev: MouseEvent) => {
      const delta = ev.clientX - lastX.current
      lastX.current = ev.clientX
      onResize(delta)
    }
    const onMouseUp = () => {
      dragging.current = false
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)
  }, [onResize])

  return <div onMouseDown={onMouseDown} className="w-1 shrink-0 cursor-col-resize hover:bg-blue-500/50 transition-colors" />
}
