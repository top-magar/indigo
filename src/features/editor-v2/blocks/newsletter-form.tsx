"use client"
import { useState } from "react"

interface NewsletterFormProps {
  heading: string; description: string; buttonText: string; _sectionId?: string
}

export function NewsletterForm({ heading, description, buttonText = "Subscribe", _sectionId }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!_sectionId && email) await fetch("/api/newsletter/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) })
  }
  return (
    <div>
      {heading && <h3 style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", color: "var(--store-color-text, #0f172a)", margin: "0 0 4px" }}>{heading}</h3>}
      {description && <p className="text-sm" style={{ color: "var(--store-color-muted, #64748b)", margin: "0 0 8px" }}>{description}</p>}
      <form onSubmit={submit} style={{ display: "flex", gap: 8 }}>
        <input type="email" aria-label="Email address" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="text-sm" style={{ flex: 1, padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: "var(--store-btn-radius, 8px)" }} />
        <button type="submit" className="text-sm" style={{ padding: "6px 16px", background: "var(--store-color-primary, #000)", color: "#fff", border: "none", borderRadius: "var(--store-btn-radius, 8px)", cursor: "pointer" }}>{buttonText}</button>
      </form>
    </div>
  )
}
