import { useRef, useEffect, useState } from "react"

interface PopupProps {
  heading: string; content: string; buttonText: string
  trigger: "button" | "timer" | "scroll"; timerDelay: number; scrollPercent: number
  __isEditor?: boolean
}

export function Popup({ heading, content, buttonText, trigger, timerDelay, scrollPercent, __isEditor }: PopupProps) {
  const ref = useRef<HTMLDialogElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (__isEditor) return
    if (trigger === "timer") {
      const t = setTimeout(() => ref.current?.showModal(), (timerDelay || 3) * 1000)
      return () => clearTimeout(t)
    }
    if (trigger === "scroll") {
      const handler = () => {
        const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
        if (pct >= (scrollPercent || 50) && !shown) { setShown(true); ref.current?.showModal() }
      }
      window.addEventListener("scroll", handler)
      return () => window.removeEventListener("scroll", handler)
    }
  }, [trigger, timerDelay, scrollPercent, __isEditor, shown])

  if (__isEditor) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 p-6">
        <h3 className="mb-2 text-lg" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", fontWeight: "var(--store-heading-weight, 700)", color: "var(--store-color-text, #0f172a)" }}>{heading}</h3>
        <div className="text-sm" style={{ color: "var(--store-color-muted, #64748b)" }} dangerouslySetInnerHTML={{ __html: content }} />
        <div className="mt-3 text-xs text-gray-400">Trigger: {trigger}</div>
      </div>
    )
  }

  return (
    <>
      {trigger === "button" && <button onClick={() => ref.current?.showModal()} className="px-4 py-2 text-sm text-white" style={{ backgroundColor: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>{buttonText || "Open"}</button>}
      <dialog ref={ref} className="max-w-md p-6 backdrop:bg-black/50" style={{ borderRadius: "var(--store-radius, 8px)" }}>
        <h3 className="mb-2 text-lg" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", fontWeight: "var(--store-heading-weight, 700)", color: "var(--store-color-text, #0f172a)" }}>{heading}</h3>
        <div className="text-sm" style={{ color: "var(--store-color-muted, #64748b)" }} dangerouslySetInnerHTML={{ __html: content }} />
        <button onClick={() => ref.current?.close()} className="mt-4 px-4 py-2 text-sm text-white" style={{ backgroundColor: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>{buttonText || "Close"}</button>
      </dialog>
    </>
  )
}
