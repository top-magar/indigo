"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Store01Icon, Cancel01Icon, SparklesIcon } from "@hugeicons/core-free-icons"
import { createClient } from "@/lib/supabase/client"

export default function OnboardingPage() {
  const [storeName, setStoreName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const storeNameRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Check if user already has a tenant (existing user logging in)
  useEffect(() => {
    async function checkExistingUser() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if user already has a profile with tenant
      const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single()

      if (userData?.tenant_id) {
        // Existing user, redirect to dashboard
        router.push("/dashboard")
        return
      }

      setIsChecking(false)
      storeNameRef.current?.focus()
    }

    checkExistingUser()
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
        setError("Session expired. Please sign in again.")
        router.push("/auth/login")
        return
      }

      // Call API to create tenant and user profile
      const response = await fetch("/api/auth/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeName }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create store")
      }

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-muted/30">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-muted/30 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <HugeiconsIcon icon={Store01Icon} className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">Indigo</span>
          </div>
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                <HugeiconsIcon icon={SparklesIcon} className="h-6 w-6 text-chart-2" />
              </div>
              <CardTitle className="text-2xl">Welcome aboard!</CardTitle>
              <CardDescription>
                Let&apos;s set up your store. What would you like to call it?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="store-name">Store name</Label>
                    <Input
                      ref={storeNameRef}
                      id="store-name"
                      type="text"
                      placeholder="My Awesome Store"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      autoComplete="organization"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will be your store&apos;s display name. You can change it later.
                    </p>
                  </div>

                  {error && (
                    <p className="text-sm text-destructive flex items-center gap-1.5">
                      <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 shrink-0" />
                      {error}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating your store..." : "Create my store"}
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
