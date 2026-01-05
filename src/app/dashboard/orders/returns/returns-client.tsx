"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Clock01Icon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Search01Icon,
  RefreshIcon,
  MoreHorizontalIcon,
  ViewIcon,
  PackageReceiveIcon,
  Money01Icon,
  ArrowRight01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"
import { cn, formatCurrency } from "@/lib/utils"
import { updateReturnStatus } from "./actions"
import type { ReturnStatus } from "@/lib/supabase/types"

interface ReturnRow {
  id: string
  return_number: string
  status: ReturnStatus
  reason: string | null
  customer_notes: string | null
  admin_notes: string | null
  refund_amount: number | null
  refund_method: string
  created_at: string
  order: {
    id: string
    order_number: string
    total: number
    currency: string
  } | null
  customer: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
  } | null
  return_items: {
    id: string
    quantity: number
    order_item: {
      product_name: string
      product_image: string | null
      unit_price: number
    } | null
  }[]
}

interface ReturnsClientProps {
  returns: ReturnRow[]
  stats: {
    total: number
    requested: number
    approved: number
    processing: number
    completed: number
    rejected: number
    totalRefunded: number
  }
  totalCount: number
  currency: string
  tenantId: string
}

const statusConfig: Record<ReturnStatus, { color: string; bgColor: string; label: string }> = {
  requested: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Requested" },
  approved: { color: "text-chart-1", bgColor: "bg-chart-1/10", label: "Approved" },
  rejected: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Rejected" },
  received: { color: "text-chart-5", bgColor: "bg-chart-5/10", label: "Received" },
  processing: { color: "text-chart-1", bgColor: "bg-chart-1/10", label: "Processing" },
  refunded: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Refunded" },
  completed: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Completed" },
  cancelled: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Cancelled" },
}

const reasonLabels: Record<string, string> = {
  defective: "Defective Product",
  wrong_item: "Wrong Item Received",
  not_as_described: "Not as Described",
  changed_mind: "Changed Mind",
  damaged_in_shipping: "Damaged in Shipping",
  other: "Other",
}

export function ReturnsClient({
  returns,
  stats,
  totalCount,
  currency,
  tenantId,
}: ReturnsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  
  // Status update dialog
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<ReturnRow | null>(null)
  const [newStatus, setNewStatus] = useState<ReturnStatus>("approved")
  const [adminNotes, setAdminNotes] = useState("")
  const [refundAmount, setRefundAmount] = useState("")

  const filteredReturns = returns.filter(r => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false
    if (searchValue) {
      const search = searchValue.toLowerCase()
      return (
        r.return_number.toLowerCase().includes(search) ||
        r.order?.order_number.toLowerCase().includes(search) ||
        r.customer?.email.toLowerCase().includes(search)
      )
    }
    return true
  })

  const handleStatusUpdate = async () => {
    if (!selectedReturn) return

    const formData = new FormData()
    formData.set("returnId", selectedReturn.id)
    formData.set("status", newStatus)
    if (adminNotes) formData.set("adminNotes", adminNotes)
    if (refundAmount) formData.set("refundAmount", refundAmount)

    startTransition(async () => {
      const result = await updateReturnStatus(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Return ${newStatus}`)
        setStatusDialogOpen(false)
        router.refresh()
      }
    })
  }

  const openStatusDialog = (returnItem: ReturnRow, status: ReturnStatus) => {
    setSelectedReturn(returnItem)
    setNewStatus(status)
    setAdminNotes("")
    setRefundAmount(returnItem.order?.total.toString() || "")
    setStatusDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Returns</h1>
          <p className="text-sm text-muted-foreground">
            Manage product returns and refunds
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-label text-muted-foreground">Total Returns</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                <HugeiconsIcon icon={PackageReceiveIcon} className="w-5 h-5 text-chart-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-label text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-chart-4">{stats.requested}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-label text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-chart-2">{stats.completed}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-label text-muted-foreground">Total Refunded</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalRefunded, currency)}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                <HugeiconsIcon icon={Money01Icon} className="w-5 h-5 text-chart-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
          />
          <Input
            placeholder="Search returns..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] bg-background">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9 ml-auto"
          onClick={() => router.refresh()}
          disabled={isPending}
        >
          <HugeiconsIcon icon={RefreshIcon} className={cn("w-4 h-4", isPending && "animate-spin")} />
        </Button>
      </div>

      {/* Returns Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Return #</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReturns.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={8} className="h-[300px]">
                  <EmptyState
                    icon={PackageReceiveIcon}
                    title={searchValue || statusFilter !== "all" ? "No returns match your filters" : "No returns yet"}
                    description={searchValue || statusFilter !== "all"
                      ? "Try adjusting your search or filters"
                      : "Returns will appear here when customers request them"}
                  />
                </TableCell>
              </TableRow>
            ) : (
              filteredReturns.map((returnItem) => {
                const status = statusConfig[returnItem.status]
                const customerName = returnItem.customer
                  ? `${returnItem.customer.first_name || ""} ${returnItem.customer.last_name || ""}`.trim() || returnItem.customer.email
                  : "Guest"

                return (
                  <TableRow key={returnItem.id} className="group">
                    <TableCell>
                      <span className="font-mono text-sm font-semibold">
                        {returnItem.return_number}
                      </span>
                    </TableCell>
                    <TableCell>
                      {returnItem.order ? (
                        <Link
                          href={`/dashboard/orders/${returnItem.order.id}`}
                          className="text-sm hover:text-primary transition-colors"
                        >
                          #{returnItem.order.order_number}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                          {customerName[0].toUpperCase()}
                        </div>
                        <span className="text-sm truncate max-w-[120px]">{customerName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {returnItem.reason ? reasonLabels[returnItem.reason] || returnItem.reason : "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("border-0 font-medium", status.bgColor, status.color)}
                      >
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold">
                        {returnItem.refund_amount
                          ? formatCurrency(returnItem.refund_amount, returnItem.order?.currency || currency)
                          : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex flex-col">
                        <span className="text-xs">
                          {format(new Date(returnItem.created_at), "MMM d, yyyy")}
                        </span>
                        <span className="text-[10px] text-muted-foreground/70">
                          {formatDistanceToNow(new Date(returnItem.created_at), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/orders/${returnItem.order?.id}`}>
                              <HugeiconsIcon icon={ViewIcon} className="h-4 w-4 mr-2" />
                              View Order
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {returnItem.status === "requested" && (
                            <>
                              <DropdownMenuItem onClick={() => openStatusDialog(returnItem, "approved")}>
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 mr-2 text-chart-2" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openStatusDialog(returnItem, "rejected")}>
                                <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4 mr-2 text-destructive" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {returnItem.status === "approved" && (
                            <DropdownMenuItem onClick={() => openStatusDialog(returnItem, "received")}>
                              <HugeiconsIcon icon={PackageReceiveIcon} className="h-4 w-4 mr-2" />
                              Mark Received
                            </DropdownMenuItem>
                          )}
                          {returnItem.status === "received" && (
                            <DropdownMenuItem onClick={() => openStatusDialog(returnItem, "refunded")}>
                              <HugeiconsIcon icon={Money01Icon} className="h-4 w-4 mr-2" />
                              Process Refund
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Status Update Dialog */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {newStatus === "approved" && "Approve Return"}
              {newStatus === "rejected" && "Reject Return"}
              {newStatus === "received" && "Mark as Received"}
              {newStatus === "refunded" && "Process Refund"}
            </DialogTitle>
            <DialogDescription>
              {selectedReturn?.return_number} - {selectedReturn?.order?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {(newStatus === "refunded" || newStatus === "approved") && (
              <div className="space-y-2">
                <Label htmlFor="refund-amount">Refund Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="refund-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="admin-notes">Notes (optional)</Label>
              <Textarea
                id="admin-notes"
                placeholder="Add internal notes about this return..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isPending}
              variant={newStatus === "rejected" ? "destructive" : "default"}
            >
              {isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
