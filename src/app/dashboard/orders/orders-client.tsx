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
import { updateOrderStatus } from "./actions";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/shared/utils";
import { NoiseBackground } from "@/components/ui/aceternity/noise-background";
import { motion, AnimatePresence } from "motion/react";

import type { OrderRow, OrderStats, AIInsight, OrdersClientProps } from "./types";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "./types";

const STATUS_CONFIG: Record<string, { 
  label: string; 
  className: string; 
  icon: React.ComponentType<{ className?: string }>;
}> = {
  pending: { 
    label: "Pending", 
    className: "bg-warning/10 text-warning border-warning/20",
    icon: Clock,
  },
  confirmed: { 
    label: "Confirmed", 
    className: "bg-info/10 text-info border-info/20",
    icon: CheckCircle2,
  },
  processing: { 
    label: "Processing", 
    className: "bg-purple-50 text-purple-700 border-purple-100",
    icon: Package,
  },
  shipped: { 
    label: "Shipped", 
    className: "bg-blue-50 text-blue-800 border-blue-100",
    icon: Truck,
  },
  delivered: { 
    label: "Delivered", 
    className: "bg-success/10 text-success border-success/20",
    icon: PackageCheck,
  },
  completed: { 
    label: "Completed", 
    className: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  cancelled: { 
    label: "Cancelled", 
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
};

const PAYMENT_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { 
    label: "Unpaid", 
    className: "bg-warning/10 text-warning",
  },
  paid: { 
    label: "Paid", 
    className: "bg-success/10 text-success",
  },
  partially_paid: { 
    label: "Partial", 
    className: "bg-info/10 text-info",
  },
  refunded: { 
    label: "Refunded", 
    className: "bg-muted text-muted-foreground",
  },
  failed: { 
    label: "Failed", 
    className: "bg-destructive/10 text-destructive",
  },
};

// ============================================================================
// Helper Components
// ============================================================================

function StatCard({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  trend,
  loading,
}: {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ComponentType<{ className?: string }>;
  trend?: "up" | "down";
  loading?: boolean;
}) {
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
          <Skeleton className="h-8 w-24 mt-2" />
          <Skeleton className="h-3 w-16 mt-1" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:ring-foreground/20 transition-colors duration-150">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {title}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="stat-value">
            {value}
          </span>
          {change && (
            <span className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              changeType === "positive" && "text-success",
              changeType === "negative" && "text-destructive",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {trend === "up" && <TrendingUp className="h-3 w-3" />}
              {trend === "down" && <TrendingDown className="h-3 w-3" />}
              {change}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "gap-1 text-xs font-medium border",
        config.className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_CONFIG[status] || PAYMENT_CONFIG.pending;
  
  return (
    <Badge variant="secondary" className={cn("text-xs font-medium", config.className)}>
      {config.label}
    </Badge>
  );
}

function AIInsightCard({ insight }: { insight: AIInsight }) {
  const iconMap = {
    warning: AlertTriangle,
    opportunity: Sparkles,
    info: Brain,
    success: CheckCircle2,
  };
  const colorMap = {
    warning: "border-warning/20 bg-warning/5",
    opportunity: "border-purple-100 bg-purple-50",
    info: "border-info/20 bg-primary/5",
    success: "border-success/20 bg-emerald-50",
  };
  const iconColorMap = {
    warning: "text-warning",
    opportunity: "text-purple-400",
    info: "text-info",
    success: "text-success",
  };

  const Icon = iconMap[insight.type];

  return (
    <div className={cn(
      "flex items-start gap-3 p-3 rounded-lg border",
      colorMap[insight.type]
    )}>
      <div className={cn("mt-0.5", iconColorMap[insight.type])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {insight.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {insight.description}
        </p>
        {insight.action && (
          <Link
            href={insight.action.href}
            className="inline-flex items-center gap-1 text-xs font-medium text-info hover:text-info mt-2 transition-colors"
          >
            {insight.action.label}
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        )}
      </div>
    </div>
  );
}

function AIInsightsPanel({ insights }: { insights: AIInsight[] }) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!insights || insights.length === 0) return null;

  return (
    <NoiseBackground
      containerClassName="p-1"
      gradientColors={[
        "rgb(139, 92, 246)",   // Purple
        "rgb(59, 130, 246)",   // Blue
        "rgb(147, 51, 234)",   // Violet
      ]}
      noiseIntensity={0.12}
      speed={0.08}
    >
      <div className="rounded-md bg-background overflow-hidden">
        <div className="flex items-center justify-between p-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
              <Zap className="h-4 w-4 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-foreground">
                AI Insights
              </h3>
              <p className="text-xs text-muted-foreground">
                Powered by Indigo AI
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              !isExpanded && "-rotate-90"
            )} />
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2">
                {insights.slice(0, 3).map((insight) => (
                  <AIInsightCard key={insight.id} insight={insight} />
                ))}
                {insights.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full mt-2 text-xs">
                    View {insights.length - 3} more insights
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </NoiseBackground>
  );
}

// ============================================================================
// Filter Components
// ============================================================================

function ActiveFilters({
  filters,
  onClear,
  onClearAll,
}: {
  filters: { key: string; label: string; value: string }[];
  onClear: (key: string) => void;
  onClearAll: () => void;
}) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">Active filters:</span>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="gap-1 bg-muted text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
          onClick={() => onClear(filter.key)}
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          {filter.value}
          <X className="h-3 w-3 ml-0.5" />
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  );
}

// DateRangePicker is now imported from @/components/ui/date-range-picker

// ============================================================================
// Orders Table Skeleton
// ============================================================================

function OrdersTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-12">
              <Skeleton className="h-4 w-4" />
            </TableHead>
            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
            <TableHead><Skeleton className="h-3 w-20" /></TableHead>
            <TableHead><Skeleton className="h-3 w-12" /></TableHead>
            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
            <TableHead className="text-right"><Skeleton className="h-3 w-12 ml-auto" /></TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} className="border-b">
              <TableCell className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-20 rounded-full" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="h-4 w-16 ml-auto" />
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ============================================================================
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
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
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
                  size="sm"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <Link href={`/dashboard/orders/${order.id}`}>
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View order</span>
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View details</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/orders/${order.id}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.info("Print invoice feature coming soon");
                }}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print invoice
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  toast.info("Email customer feature coming soon");
                }}
              >
                <Mail className="h-4 w-4 mr-2" />
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
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.4px] text-foreground">Orders</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track your store orders
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => router.refresh()}
            disabled={isPending}
          >
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleExport}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link href="/dashboard/orders/new">
              <Plus className="h-4 w-4" />
              Create order
            </Link>
          </Button>
        </div>
      </div>

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="Search orders" placeholder="Search orders…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => setFilter("status", value === "all" ? undefined : value)}
          >
            <SelectTrigger className="w-[140px] h-9" aria-label="Filter by status">
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
            <SelectTrigger className="w-[140px] h-9" aria-label="Filter by payment">
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
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("confirmed")}
                >
                  Mark Confirmed
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction("shipped")}
                >
                  Mark Shipped
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExport}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-1" />
                  )}
                  Export
                </Button>
              </div>
              <Separator orientation="vertical" className="h-6" />
              <Button
                size="sm"
                variant="ghost"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
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
                    size="sm"
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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
    </div>
  );
}