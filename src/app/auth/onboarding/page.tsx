"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, Store, LogOut } from "lucide-react"

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export default function OnboardingPage() {
  const [storeName, setStoreName] = useState("")
  const [currency, setCurrency] = useState("NPR")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push("/login"); return }
      const { data } = await supabase.from("users").select("tenant_id").eq("id", user.id).single()
      if (data?.tenant_id) { router.push("/dashboard"); return }
      setIsChecking(false)
    }
    checkUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (storeName.length < 3) { setError("At least 3 characters"); return }
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, currency }),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error || "Failed to create store"); setIsLoading(false); return }
      router.push("/dashboard")
    } catch {
      setError("Something went wrong. Try again.")
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  if (isChecking) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const slug = toSlug(storeName)
  const isValid = storeName.length >= 3

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-[340px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-12">
          <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
            <Store className="size-4 text-background" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Indigo</span>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Name your store</h1>
          <p className="text-sm text-muted-foreground mt-1">
            You can always change this later.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input
              id="store-name"
              type="text"
              placeholder="Kathmandu Crafts"
              required
              value={storeName}
              onChange={(e) => { setStoreName(e.target.value); setError(null) }}
              autoFocus
              className="w-full h-11 px-3 rounded-lg border border-input bg-transparent text-base placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors"
            />
            <div className="h-4">
              {error ? (
                <p className="text-xs text-destructive">{error}</p>
              ) : slug ? (
                <p className="text-xs text-muted-foreground">
                  indigo.com/store/<span className="text-foreground font-medium">{slug}</span>
                </p>
              ) : null}
            </div>
          </div>

          {/* Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Currency</label>
            <div className="flex gap-1.5">
              {[
                { code: "NPR", label: "Rs." },
                { code: "USD", label: "$" },
                { code: "INR", label: "₹" },
                { code: "EUR", label: "€" },
                { code: "GBP", label: "£" },
              ].map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={`h-8 px-3 rounded-md text-xs font-medium transition-colors ${
                    currency === c.code
                      ? "bg-foreground text-background"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {c.label} {c.code}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-10 text-sm"
            disabled={isLoading || !isValid}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Create store
                <ArrowRight className="size-3.5" />
              </>
            )}
          </Button>
        </form>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-muted-foreground/50 hover:text-muted-foreground mx-auto mt-8 transition-colors"
        >
          <LogOut className="size-3" />
          Use a different account
        </button>
      </div>
    </div>
  )
}
