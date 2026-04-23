"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowRight, Store } from "lucide-react"

function toSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export default function OnboardingPage() {
  const [storeName, setStoreName] = useState("")
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
        body: JSON.stringify({ storeName, currency: "NPR" }),
      })
      const result = await res.json()
      if (!res.ok) { setError(result.error || "Failed to create store"); setIsLoading(false); return }
      router.push("/dashboard")
    } catch {
      setError("Something went wrong. Try again.")
      setIsLoading(false)
    }
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
    <div className="flex min-h-svh bg-background">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background flex-col justify-between p-16 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 0h40v40H0z\' fill=\'none\' stroke=\'white\' stroke-width=\'.5\'/%3E%3C/svg%3E")' }} />

        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-background/10 ring-1 ring-background/10">
            <Store className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Indigo</span>
        </div>

        <div className="relative z-10 space-y-8">
          <h2 className="text-4xl font-semibold tracking-tight leading-[1.1]">
            Sell online,<br />your way.
          </h2>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {["Products", "Orders", "Payments", "Customers", "Analytics", "Storefront"].map((f) => (
              <span key={f} className="rounded-full bg-background/8 ring-1 ring-background/10 px-3 py-1 text-xs text-background/70">
                {f}
              </span>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 pt-4 border-t border-background/10">
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="size-7 rounded-full bg-background/10 ring-2 ring-foreground" />
              ))}
            </div>
            <p className="text-xs text-background/40">
              Join merchants selling across Nepal
            </p>
          </div>
        </div>

        <p className="relative z-10 text-[11px] text-background/20">
          © {new Date().getFullYear()} Indigo Commerce
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-[340px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-12 lg:hidden">
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

          <p className="text-[11px] text-muted-foreground/40 text-center mt-8">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
