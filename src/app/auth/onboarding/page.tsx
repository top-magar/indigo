"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Store, Loader2 } from "lucide-react"

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
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const slug = toSlug(storeName)

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-foreground">
            <Store className="size-4 text-background" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Indigo</span>
        </div>

        {/* Form */}
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Create your store</h1>
          <p className="text-sm text-muted-foreground">You can change these later in settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store name</Label>
            <Input
              id="store-name"
              type="text"
              placeholder="My Store"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              autoFocus
            />
            {slug && (
              <p className="text-xs text-muted-foreground">
                yourstore.indigo.com/<span className="font-medium text-foreground">{slug}</span>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NPR">NPR — Nepali Rupee (Rs.)</SelectItem>
                <SelectItem value="USD">USD — US Dollar ($)</SelectItem>
                <SelectItem value="INR">INR — Indian Rupee (₹)</SelectItem>
                <SelectItem value="EUR">EUR — Euro (€)</SelectItem>
                <SelectItem value="GBP">GBP — British Pound (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isLoading || storeName.length < 3}>
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Creating...
              </>
            ) : (
              "Create store"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
