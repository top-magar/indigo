"use client"
import { useState } from "react"
import { useBlockMode } from "./data-context"

interface NewsletterProps {
  heading: string; subheading: string; buttonText: string
  variant: "inline" | "stacked" | "card"
}

export function Newsletter({ heading, subheading, buttonText, variant }: NewsletterProps) {
  const { mode } = useBlockMode()
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === "editor" || !email) return
    await fetch("/api/newsletter/subscribe", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    setSent(true)
  }

  if (sent) return <div className="py-12 text-center text-lg">Thanks for subscribing!</div>

  const form = variant === "inline" ? (
    <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
      <input type="email" aria-label="Email address" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 rounded border px-3 py-2 text-sm" />
      <button type="submit" className="px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>{buttonText}</button>
    </form>
  ) : (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
      <input type="email" aria-label="Email address" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="rounded border px-3 py-2 text-sm" />
      <button type="submit" className="px-5 py-2 text-sm font-semibold text-white" style={{ backgroundColor: "var(--store-color-primary, #000)", borderRadius: "var(--store-btn-radius, 8px)" }}>{buttonText}</button>
    </form>
  )

  const inner = (
    <>
      {heading && <h2 className="text-2xl" style={{ fontFamily: "var(--store-font-heading, Inter, sans-serif)", fontWeight: "var(--store-heading-weight, 700)", color: "var(--store-color-text, #0f172a)" }}>{heading}</h2>}
      {subheading && <p className="mt-2" style={{ color: "var(--store-color-muted, #64748b)" }}>{subheading}</p>}
      {form}
    </>
  )

  if (variant === "card") {
    return <div className="py-12 px-6"><div className="mx-auto max-w-lg rounded-2xl bg-gray-50 p-10 text-center">{inner}</div></div>
  }
  return <div className={`mx-auto max-w-lg py-12 px-6 ${variant === "stacked" ? "text-center" : ""}`}>{inner}</div>
}
