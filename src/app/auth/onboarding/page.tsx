"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Store, Loader2 } from "lucide-react"

export default function OnboardingPage() {
  const [storeName, setStoreName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if user already has a tenant
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/login")
        return
      }

      // Check if user already has a profile with tenant
      const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single()

      if (userData?.tenant_id) {
        // User already has a tenant, redirect to dashboard
        router.push("/dashboard")
        return
      }

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
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError("Not authenticated")
        setIsLoading(false)
        return
      }

      // Call server action to create tenant and user profile
      const response = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || "Failed to create store")
        setIsLoading(false)
        return
      }

      router.push("/dashboard")
    } catch {
      setError("An error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-[var(--ds-background-200)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--ds-gray-600)]" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[var(--ds-background-200)] p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ds-gray-1000)]">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-[var(--ds-gray-1000)]">Indigo</span>
          </div>
          
          <Card className="border-[var(--ds-gray-200)]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold text-[var(--ds-gray-1000)]">
                Welcome to Indigo!
              </CardTitle>
              <CardDescription className="text-[var(--ds-gray-600)]">
                Let&apos;s set up your store
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="store-name" className="text-[var(--ds-gray-800)]">
                      Store name
                    </Label>
                    <Input
                      id="store-name"
                      type="text"
                      placeholder="My Awesome Store"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      className="border-[var(--ds-gray-300)]"
                      autoFocus
                    />
                    <p className="text-xs text-[var(--ds-gray-500)]">
                      This will be your store&apos;s display name
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-[var(--ds-red-700)]">{error}</p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating your store...
                      </>
                    ) : (
                      "Create store"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
