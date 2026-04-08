import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Banknote, Building2, Wallet } from "lucide-react"

export default function PaymentsSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
        <p className="text-muted-foreground">Manage your payment methods</p>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Banknote className="h-8 w-8 text-green-600" />
            <div className="flex-1">
              <CardTitle className="text-base">Cash on Delivery</CardTitle>
              <CardDescription>Customers pay when they receive their order</CardDescription>
            </div>
            <Badge variant="default">Active</Badge>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="flex-1">
              <CardTitle className="text-base">Bank Transfer</CardTitle>
              <CardDescription>Customers transfer to your bank account</CardDescription>
            </div>
            <Badge variant="default">Active</Badge>
          </CardHeader>
        </Card>

        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center gap-3">
            <Wallet className="h-8 w-8 text-green-500" />
            <div className="flex-1">
              <CardTitle className="text-base">eSewa</CardTitle>
              <CardDescription>Accept payments via eSewa digital wallet</CardDescription>
            </div>
            <Badge variant="outline">Coming Soon</Badge>
          </CardHeader>
        </Card>

        <Card className="opacity-60">
          <CardHeader className="flex flex-row items-center gap-3">
            <Wallet className="h-8 w-8 text-purple-600" />
            <div className="flex-1">
              <CardTitle className="text-base">Khalti</CardTitle>
              <CardDescription>Accept payments via Khalti digital wallet</CardDescription>
            </div>
            <Badge variant="outline">Coming Soon</Badge>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
