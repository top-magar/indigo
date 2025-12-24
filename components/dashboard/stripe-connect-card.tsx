"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CreditCardIcon,
  LinkSquare01Icon,
  CheckmarkCircle02Icon,
  Alert02Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons"
import { toast } from "sonner"

interface StripeStatus {
  connected: boolean
  onboardingComplete: boolean
  chargesEnabled?: boolean
  payoutsEnabled?: boolean
  detailsSubmitted?: boolean
}

export function StripeConnectCard() {
  const [status, setStatus] = useState<StripeStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    fetchStatus()
  }, [])

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/stripe/connect/status")
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch {
      toast.error("Failed to fetch Stripe status")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to create Stripe account")
      }

      const data = await response.json()
      window.location.href = data.url
    } catch {
      toast.error("Failed to connect Stripe")
      setIsConnecting(false)
    }
  }

  const handleDashboard = async () => {
    try {
      const response = await fetch("/api/stripe/connect/dashboard")
      if (!response.ok) {
        throw new Error("Failed to get dashboard link")
      }

      const data = await response.json()
      window.open(data.url, "_blank")
    } catch {
      toast.error("Failed to open Stripe dashboard")
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5" />
            Stripe Payments
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <HugeiconsIcon icon={Loading01Icon} className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={CreditCardIcon} className="h-5 w-5" />
              Stripe Payments
            </CardTitle>
            <CardDescription>Accept payments from your customers</CardDescription>
          </div>
          {status?.connected && (
            <Badge variant={status.onboardingComplete ? "default" : "secondary"}>
              {status.onboardingComplete ? (
                <>
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="mr-1 h-3 w-3" />
                  Active
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={Alert02Icon} className="mr-1 h-3 w-3" />
                  Setup Required
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status?.connected ? (
          <>
            <p className="text-sm text-muted-foreground">
              Connect your Stripe account to start accepting payments. You&apos;ll be able to receive payments directly
              to your bank account.
            </p>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={CreditCardIcon} className="mr-2 h-4 w-4" />
                  Connect Stripe
                </>
              )}
            </Button>
          </>
        ) : !status.onboardingComplete ? (
          <>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-900/20">
              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={Alert02Icon} className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Complete your setup</p>
                  <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                    Your Stripe account is connected but requires additional information before you can accept payments.
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleConnect} disabled={isConnecting}>
              {isConnecting ? (
                <>
                  <HugeiconsIcon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Complete Setup"
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-chart-2" />
                  <span className="text-sm font-medium">Charges Enabled</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">You can accept payments</p>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-chart-2" />
                  <span className="text-sm font-medium">Payouts Enabled</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Funds will be sent to your bank</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleDashboard}>
              <HugeiconsIcon icon={LinkSquare01Icon} className="mr-2 h-4 w-4" />
              Open Stripe Dashboard
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
