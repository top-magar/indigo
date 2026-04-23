"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowRight } from "lucide-react"

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
    setIsLoading(true)
    setError(null)

    if (storeName.length < 3) {
      setError("Store name must be at least 3 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName, currency }),
      })
      const result = await response.json()
      if (!response.ok) {
        setError(result.error || "Failed to create store")
        setIsLoading(false)
        return
      }
      router.push("/dashboard")
    } catch {
      setError("Something went wrong. Please try again.")
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
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground text-background flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-background/10">
              <span className="text-sm font-bold">I</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Indigo</span>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight leading-tight">
            Start selling in<br />minutes, not days.
          </h2>
          <p className="text-sm text-background/60 leading-relaxed max-w-[320px]">
            Set up your store, add products, and start accepting payments — all from one dashboard.
          </p>
        </div>

        <p className="text-xs text-background/40">
          Trusted by merchants across Nepal
        </p>
      </div>

      {/* Right — form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-[360px] space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
              <span className="text-sm font-bold text-background">I</span>
            </div>
            <span className="text-sm font-semibold tracking-tight">Indigo</span>
          </div>

          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Create your store</h1>
            <p className="text-sm text-muted-foreground">
              Takes less than a minute. You can change everything later.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="store-name" className="text-xs font-medium">
                Store name
              </label>
              <Input
                id="store-name"
                type="text"
                placeholder="e.g. Kathmandu Crafts"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                autoFocus
                className="h-9"
              />
              {slug ? (
                <p className="text-xs text-muted-foreground">
                  <span className="text-muted-foreground/60">indigo.com/store/</span>
                  <span className="font-medium text-foreground">{slug}</span>
                </p>
              ) : (
                <p className="text-xs text-muted-foreground/60">
                  Your store URL will appear here
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="currency" className="text-xs font-medium">
                Currency
              </label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NPR">Rs. — Nepali Rupee</SelectItem>
                  <SelectItem value="INR">₹ — Indian Rupee</SelectItem>
                  <SelectItem value="USD">$ — US Dollar</SelectItem>
                  <SelectItem value="EUR">€ — Euro</SelectItem>
                  <SelectItem value="GBP">£ — British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full h-9"
              disabled={isLoading || !isValid}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Creating store...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="size-3.5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-[11px] text-muted-foreground/50 text-center leading-relaxed">
            By continuing, you agree to Indigo&apos;s Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  )
}
