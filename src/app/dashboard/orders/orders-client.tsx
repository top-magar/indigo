"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { format, formatDistanceToNow } from "date-fns";
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Search,
  Download,
  RefreshCw,
  MoreHorizontal,
  Eye,
  Printer,
  Mail,
  X,
  Package,
  Truck,
  CreditCard,
  AlertTriangle,
  Sparkles,
  Brain,
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ArrowUpRight,
  Zap,
  DollarSign,
  PackageCheck,
  XCircle,
  Loader2,
  Plus,
} from "lucide-react";
import { useBulkActions, useUrlFilters } from "@/hooks";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTableSkeleton, TableRowSkeleton } from "@/components/dashboard/skeletons";
import { EntityListPage } from "@/components/dashboard/templates";
import { updateOrderStatus } from "./actions";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/shared/utils";
import { NoiseBackground } from "@/components/ui/aceternity/noise-background";
import { motion, AnimatePresence } from "motion/react";

import type { OrderRow, OrderStats, AIInsight, OrdersClientProps } from "./types";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "./types";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  STATUS_CONFIG,
  PAYMENT_CONFIG,
  StatCard,
  ActiveFilters,
  OrdersTableSkeleton,
  AIInsightsPanel,
} from "./_components";

// Order Row Component
// ============================================================================

function OrderTableRow({
  order,
  isSelected,
  onSelect,
  currency,
}: {
  order: OrderRow;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  currency: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("orderId", order.id);
        formData.set("status", newStatus);
        await updateOrderStatus(formData);
        toast.success(`Order ${order.order_number} updated to ${newStatus}`);
        router.refresh();
      } catch (error) {
        toast.error("Failed to update order status");
      }
    });
  };

  const customerInitials = order.customer_name
    ? order.customer_name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : order.customer_email?.charAt(0).toUpperCase() || "?";

  return (
    <TableRow 
      className={cn(
        "group transition-colors duration-150",
        isSelected && "bg-primary/5",
        isPending && "opacity-50"
      )}
    >
      <TableCell className="w-12">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelect}
          aria-label={`Select order ${order.order_number}`}
        />
      </TableCell>
      
      <TableCell>
        <Link
          href={`/dashboard/orders/${order.id}`}
          className="font-medium text-foreground hover:text-info transition-colors"
        >
          #{order.order_number}
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
        </p>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarFallback className="text-xs bg-muted text-muted-foreground">
              {customerInitials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm text-foreground truncate">
              {order.customer_name || "Guest"}
            </p>
            {order.customer_email && (
              <p className="text-xs text-muted-foreground truncate">
                {order.customer_email}
              </p>
            )}
          </div>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-1.5">
          <Package className="size-3.5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground tabular-nums">
            {order.items_count} {order.items_count === 1 ? "item" : "items"}
          </span>
        </div>
      </TableCell>

      <TableCell>
        <OrderStatusBadge status={order.status} />
      </TableCell>

      <TableCell>
        <PaymentStatusBadge status={order.payment_status} />
      </TableCell>

      <TableCell className="text-right">
        <span className="font-medium text-foreground tabular-nums">
          {formatCurrency(order.total, currency)}
        </span>
      </TableCell>

      <TableCell>
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                 
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Eye className="size-4" />
                    <span className="sr-only">View order</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View details</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="More actions">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/orders/${order.id}`}>
                  <Eye className="size-4 mr-2" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.info("Print invoice feature coming soon");
                }}
              >
                <Printer className="size-4 mr-2" />
                Print invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.info("Email customer feature coming soon");
                }}
              >
                <Mail className="size-4 mr-2" />
                Email customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Update status
                </DropdownMenuLabel>
                {["confirmed", "processing", "shipped", "delivered"].map((status) => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={order.status === status}
                  >
                    Mark as {status}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function OrdersClient({
  orders,
  stats,
  totalCount,
  currentPage,
  pageSize,
  currency,
  aiInsights = [],
  filters: initialFilters,
}: OrdersClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // URL-based filters
  const { 
    filters, 
    setFilter, 
    searchValue,
    setSearchValue,
    dateRange,
    setDateRange,
    clearAll,
    hasActiveFilters,
    page,
    setPage,
    isPending: isFilterPending,
  } = useUrlFilters({
    debounceMs: 300,
    defaultPageSize: pageSize,
  });

  // Bulk selection
  const {
    selectedArray: selectedIds,
    isAllSelected,
    toggle: toggleSelection,
    toggleAll,
    reset: clearSelection,
    isIndeterminate,
  } = useBulkActions({
    paginationKey: `${currentPage}-${pageSize}`,
  });

  // Computed active filters for display
  const activeFilters = useMemo(() => {
    const result: { key: string; label: string; value: string }[] = [];
    if (filters.status && filters.status !== "all") {
      result.push({ key: "status", label: "Status", value: filters.status });
    }
    if (filters.payment && filters.payment !== "all") {
      result.push({ key: "payment", label: "Payment", value: filters.payment });
    }
    if (dateRange.from) {
      result.push({ 
        key: "from", 
        label: "From", 
        value: format(dateRange.from, "MMM d") 
      });
    }
    if (dateRange.to) {
      result.push({ 
        key: "to", 
        label: "To", 
        value: format(dateRange.to, "MMM d") 
      });
    }
    return result;
  }, [filters, dateRange]);

  // Handle clearing individual filters
  const handleClearFilter = useCallback((key: string) => {
    if (key === "from" || key === "to") {
      setDateRange({ 
        from: key === "from" ? undefined : dateRange.from,
        to: key === "to" ? undefined : dateRange.to,
      });
    } else {
      setFilter(key, undefined);
    }
  }, [setFilter, setDateRange, dateRange]);

  // Handle bulk actions - calls the server action to update order statuses
  const handleBulkAction = useCallback(async (action: string) => {
    if (selectedIds.length === 0) return;
    
    startTransition(async () => {
      try {
        const { bulkUpdateStatus } = await import("@/app/dashboard/bulk-actions/actions");
        const result = await bulkUpdateStatus("orders", selectedIds, action);
        
        if (result.success) {
          toast.success(`${result.successCount} orders updated to ${action}`);
          if (result.failedCount > 0) {
            toast.warning(`${result.failedCount} orders failed to update`);
          }
        } else {
          toast.error(result.message || "Failed to update orders");
        }
        
        clearSelection();
        router.refresh();
      } catch (error) {
        toast.error("Failed to update orders");
      }
    });
  }, [selectedIds, clearSelection, router]);

  // Handle export - exports selected orders or all orders to CSV
  const handleExport = useCallback(async () => {
    startTransition(async () => {
      try {
        const { bulkExport } = await import("@/app/dashboard/bulk-actions/actions");
        
        // If orders are selected, export only those; otherwise export all visible orders
        const idsToExport = selectedIds.length > 0 
          ? selectedIds 
          : orders.map(o => o.id);
        
        const result = await bulkExport("orders", idsToExport, "csv");
        
        if (result.success && result.data) {
          // Download the file
          const blob = new Blob([result.data], { type: result.mimeType || "text/csv" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = result.filename || `orders-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          const exportCount = selectedIds.length > 0 ? selectedIds.length : orders.length;
          toast.success(`${exportCount} orders exported successfully`);
        } else {
          toast.error(result.error || "Failed to export orders");
        }
      } catch (error) {
        toast.error("Failed to export orders");
      }
    });
  }, [orders, selectedIds]);

  // Convert orders to Node format for bulk actions
  const orderNodes = useMemo(() => 
    orders.map((o) => ({ id: o.id })), 
    [orders]
  );

  return (
    <EntityListPage
      title="Orders"
      description="Manage and track your store orders"
      actions={
        <>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => router.refresh()}
            disabled={isPending}
          >
            <RefreshCw className={cn("size-4", isPending && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleExport}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export
          </Button>
          <Button className="gap-2" asChild>
            <Link href="/dashboard/orders/new">
              <Plus className="size-4" />
              Create order
            </Link>
          </Button>
        </>
      }
    >

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={stats.total.toLocaleString()}
          icon={ShoppingCart}
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.revenue, currency)}
          icon={DollarSign}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          change={stats.pending > 5 ? "Needs attention" : undefined}
          changeType={stats.pending > 5 ? "negative" : "neutral"}
          icon={Clock}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle2}
        />
      </div>

      {/* AI Insights Panel */}
      <AIInsightsPanel insights={aiInsights} />

      {/* Filters & Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2 flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              aria-label="Search orders" placeholder="Search orders…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => setFilter("status", value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-[140px]" aria-label="Filter by status">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.payment || "all"}
            onValueChange={(value) => setFilter("payment", value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-[140px]" aria-label="Filter by payment">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker
            value={{
              from: dateRange.from,
              to: dateRange.to,
            }}
            onChange={(range) => setDateRange({ from: range.from, to: range.to })}
            presets={["today", "7d", "30d", "90d"]}
          />
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <ActiveFilters
          filters={activeFilters}
          onClear={handleClearFilter}
          onClearAll={clearAll}
        />
      )}

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <Card className="shadow-sm">
            <CardContent className="flex items-center gap-4 p-3">
              <span className="text-sm font-medium text-foreground">
                {selectedIds.length} selected
              </span>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <Button
                 
                  variant="outline"
                  onClick={() => handleBulkAction("confirmed")}
                >
                  Mark Confirmed
                </Button>
                <Button
                 
                  variant="outline"
                  onClick={() => handleBulkAction("shipped")}
                >
                  Mark Shipped
                </Button>
                <Button
                 
                  variant="outline"
                  onClick={handleExport}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="size-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="size-4 mr-1" />
                  )}
                  Export
                </Button>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Button
               
                variant="ghost"
                onClick={clearSelection}
              >
                <X className="size-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Orders Table */}
      {isFilterPending ? (
        <OrdersTableSkeleton rows={pageSize} />
      ) : (
        <div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b">
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected(orderNodes)}
                    onCheckedChange={() => toggleAll(orderNodes)}
                    aria-label="Select all orders"
                  />
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Order
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Customer
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Items
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Payment
                </TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                  Total
                </TableHead>
                <TableHead className="w-24">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-64">
                    <EmptyState
                      icon={ShoppingCart}
                      title="No orders found"
                      description="Orders will appear here once customers start purchasing."
                      hint="Press ⌘K to navigate or G then O to jump here"
                      action={{
                        label: "Create Draft Order",
                        onClick: () => router.push("/dashboard/orders/new"),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <OrderTableRow
                    key={order.id}
                    order={order}
                    isSelected={selectedIds.includes(order.id)}
                    onSelect={(checked) => toggleSelection(order.id)}
                    currency={currency}
                  />
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {orders.length > 0 && totalCount > 0 && (
            <div className="border-t p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {Math.min(((currentPage - 1) * pageSize) + 1, totalCount)} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} orders
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                   
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                   
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage * pageSize >= totalCount}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </EntityListPage>
  );
}
