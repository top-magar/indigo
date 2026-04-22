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
    <div className="flex items-center justify-center min-h-screen bg-background">
      <form onSubmit={submit} className="p-8 rounded-lg border max-w-[360px] w-full text-center space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">This store is password protected</h2>
        <input value={input} onChange={(e) => { setInput(e.target.value); setError(false) }} type="password" placeholder="Enter password"
          className="w-full px-3 py-2.5 rounded-md border border-input bg-background text-foreground text-sm" />
        {error && <p className="text-destructive text-sm">Incorrect password</p>}
        <button type="submit" className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-semibold text-sm">Enter</button>
      </form>
    </div>
  )
}
