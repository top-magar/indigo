import { Clock, CheckCircle2, Package, Truck, PackageCheck, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/shared/utils"

export const STATUS_CONFIG: Record<string, {
  label: string
  className: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  pending: { label: "Pending", className: "bg-warning/10 text-warning border-warning/20", icon: Clock },
  confirmed: { label: "Confirmed", className: "bg-info/10 text-info border-info/20", icon: CheckCircle2 },
  processing: { label: "Processing", className: "bg-ds-blue-700/10 text-ds-blue-700 border-ds-blue-700/20", icon: Package },
  shipped: { label: "Shipped", className: "bg-ds-teal-700/10 text-ds-teal-700 border-ds-teal-700/20", icon: Truck },
  delivered: { label: "Delivered", className: "bg-success/10 text-success border-success/20", icon: PackageCheck },
  completed: { label: "Completed", className: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
}

export const PAYMENT_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: "Unpaid", className: "bg-warning/10 text-warning" },
  paid: { label: "Paid", className: "bg-success/10 text-success" },
  partially_paid: { label: "Partial", className: "bg-info/10 text-info" },
  refunded: { label: "Refunded", className: "bg-muted text-muted-foreground" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
}

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const Icon = config.icon
  return (
    <Badge className={cn("gap-1 text-xs font-medium border", config.className)}>
      <Icon className="size-3.5" />
      {config.label}
    </Badge>
  )
}

export function PaymentStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_CONFIG[status] || PAYMENT_CONFIG.pending
  return (
    <Badge className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  )
}
