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
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background flex-col justify-between p-16">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md bg-background/10 ring-1 ring-background/20">
            <Store className="size-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Indigo</span>
        </div>

        <div className="space-y-5 max-w-[400px]">
          <h2 className="text-3xl font-semibold tracking-tight leading-[1.2]">
            Your store,<br />ready in seconds.
          </h2>
          <div className="space-y-3 text-sm text-background/50">
            <div className="flex items-center gap-3">
              <span className="flex size-5 items-center justify-center rounded-full bg-background/10 text-[10px] font-medium">1</span>
              Name your store
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-5 items-center justify-center rounded-full bg-background/10 text-[10px] font-medium">2</span>
              Add your first product
            </div>
            <div className="flex items-center gap-3">
              <span className="flex size-5 items-center justify-center rounded-full bg-background/10 text-[10px] font-medium">3</span>
              Start selling
            </div>
          </div>
        </div>

        <p className="text-xs text-background/30">
          Built for merchants in Nepal
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
