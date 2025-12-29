import { StripeConnectCard } from "@/components/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { Money01Icon } from "@hugeicons/core-free-icons"

export default function PaymentsSettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage your payment settings and Stripe account</p>
        </div>
      </div>

      <StripeConnectCard />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Money01Icon} className="h-5 w-5" />
            Platform Fees
          </CardTitle>
          <CardDescription>Information about transaction fees</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Platform Fee</p>
                <p className="text-sm text-muted-foreground">Applied to each transaction</p>
              </div>
              <span className="text-lg font-semibold">5%</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="font-medium">Stripe Processing Fee</p>
                <p className="text-sm text-muted-foreground">Standard Stripe fees apply</p>
              </div>
              <span className="text-lg font-semibold">2.9% + $0.30</span>
            </div>
            <p className="text-xs text-muted-foreground">
              * Fees are deducted automatically from each transaction. The remaining amount is transferred to your
              connected Stripe account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
