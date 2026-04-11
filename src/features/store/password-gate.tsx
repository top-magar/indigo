"use client"

import { useState, type ReactNode } from "react"

export function PasswordGate({ enabled, password, slug, children }: {
  enabled: boolean; password: string; slug: string; children: ReactNode
}) {
  const key = `store-unlocked-${slug}`
  const [unlocked, setUnlocked] = useState(() =>
    typeof window !== "undefined" && sessionStorage.getItem(key) === "1"
  )
  const [input, setInput] = useState("")
  const [error, setError] = useState(false)

  if (!enabled || unlocked) return <>{children}</>

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input === password) {
      sessionStorage.setItem(key, "1")
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <form onSubmit={submit} style={{ padding: 32, borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,.12)", maxWidth: 360, width: "100%", textAlign: "center" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: 20 }}>This store is password protected</h2>
        <input value={input} onChange={(e) => { setInput(e.target.value); setError(false) }} type="password" placeholder="Enter password" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", marginBottom: 12, boxSizing: "border-box" }} />
        {error && <p style={{ color: "#ef4444", fontSize: 14, margin: "0 0 12px" }}>Incorrect password</p>}
        <button type="submit" style={{ width: "100%", padding: "10px 0", borderRadius: 8, background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontWeight: 600 }}>Enter</button>
      </form>
    </div>
  )
}
