"use client"
import { useState } from "react"
import { X } from "lucide-react"

interface AnnouncementProps {
  text: string; dismissible: boolean
}

export function Announcement({ text, dismissible = true }: AnnouncementProps) {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="text-xs" style={{ width: "100%", background: "var(--store-color-primary, #000)", color: "#fff", padding: "6px 16px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
      <span>{text}</span>
      {dismissible && <button onClick={() => setVisible(false)} style={{ position: "absolute", right: 8, background: "none", border: "none", color: "#fff", cursor: "pointer" }} aria-label="Dismiss"><X size={14} /></button>}
    </div>
  )
}
