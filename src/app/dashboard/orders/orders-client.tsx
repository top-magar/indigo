"use client";

import { useTransition, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ShoppingCart01Icon,
    Clock01Icon,
    CheckmarkCircle02Icon,
    PackageIcon,
    Search01Icon,
    Download01Icon,
    Money01Icon,
    RefreshIcon,
    MoreHorizontalIcon,
    ViewIcon,
    PrinterIcon,
    Mail01Icon,
    Calendar03Icon,
    Cancel01Icon as CancelIcon,
} from "@hugeicons/core-free-icons";
import { useBulkActions, useUrlFilters } from "@/hooks";
import { StickyBulkActionsBar } from "@/components/dashboard";
import type { DataTableFilterOption } from "@/components/dashboard";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/components/dashboard/data-table/pagination";
import { updateOrderStatus } from "./actions";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

// Types
interface OrderRow {
    id: string;
    order_number: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
    customer_id: string | null;
    customer_name: string | null;
    customer_email: string | null;
    total: number;
    subtotal: number;
    shipping_total: number;
    tax_total: number;
    currency: string;
    items_count: number;
    created_at: string;
    updated_at: string;
}

interface OrdersClientProps {
    orders: OrderRow[];
    stats: {
        total: number;
        pending: number;
        processing: number;
        shipped: number;
        completed: number;
        cancelled: number;
        revenue: number;
        unpaid: number;
    };
    totalCount: number;
    currentPage: number;
    pageSize: number;
    currency: string;
    filters: {
        status?: string;
        payment?: string;
        search?: string;
        from?: string;
        to?: string;
    };
}

// Import centralized status configuration
import { orderStatusConfig, paymentStatusConfig } from "@/config/status";


export function OrdersClient({
    orders,
    stats,
    totalCount,
    currentPage,
    pageSize: initialPageSize,
    currency,
    filters: initialFilters,
}: OrdersClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isRefreshing, startRefreshTransition] = useTransition();

    // Use the new useUrlFilters hook for URL state management
    const {
        searchValue,
        setSearchValue,
        dateRange,
        setDateRange,
        setFilter,
        clearAll,
        hasActiveFilters,
        page,
        pageSize,
        setPage,
        setPageSize,
        isPending,
        getFilter,
    } = useUrlFilters({ defaultPageSize: initialPageSize });

    // Use Saleor-inspired bulk actions hook
    const bulkActions = useBulkActions();

    // Filter options for inline selects
    const statusOptions: DataTableFilterOption[] = useMemo(() => [
        { value: "pending", label: "Pending", count: stats.pending, color: "bg-chart-4" },
        { value: "processing,confirmed", label: "Processing", count: stats.processing, color: "bg-chart-1" },
        { value: "shipped", label: "Shipped", count: stats.shipped, color: "bg-chart-5" },
        { value: "delivered,completed", label: "Completed", count: stats.completed, color: "bg-chart-2" },
        { value: "cancelled,refunded", label: "Cancelled", count: stats.cancelled, color: "bg-destructive" },
    ], [stats]);

    const paymentOptions: DataTableFilterOption[] = useMemo(() => [
        { value: "paid", label: "Paid", color: "bg-chart-2" },
        { value: "pending", label: "Unpaid", color: "bg-chart-4" },
        { value: "failed", label: "Failed", color: "bg-destructive" },
        { value: "refunded", label: "Refunded", color: "bg-muted-foreground" },
    ], []);

    // Calculate active filter chips using getFilter()
    const activeFilterChips = useMemo(() => {
        const chips: { key: string; label: string; displayValue: string }[] = [];
        
        const statusFilter = getFilter("status");
        if (statusFilter) {
            const option = statusOptions.find(o => o.value === statusFilter);
            chips.push({ key: "status", label: "Status", displayValue: option?.label || statusFilter });
        }
        
        const paymentFilter = getFilter("payment");
        if (paymentFilter) {
            const option = paymentOptions.find(o => o.value === paymentFilter);
            chips.push({ key: "payment", label: "Payment", displayValue: option?.label || paymentFilter });
        }
        
        if (dateRange.from) {
            const dateLabel = dateRange.to
                ? `${format(dateRange.from, "MMM d")} - ${format(dateRange.to, "MMM d")}`
                : format(dateRange.from, "MMM d, yyyy");
            chips.push({ key: "dateRange", label: "Date", displayValue: dateLabel });
        }
        
        return chips;
    }, [getFilter, dateRange, statusOptions, paymentOptions]);

    // Handle removing a filter chip
    const removeFilterChip = (key: string) => {
        if (key === "dateRange") {
            setDateRange({});
        } else {
            setFilter(key, undefined);
        }
    };

    // Clear bulk selection when orders change (e.g., page change)
    useEffect(() => {
        bulkActions.reset();
    }, [currentPage]);

    // Handle bulk status update
    const handleBulkStatusUpdate = async (status: string) => {
        const formData = new FormData();
        formData.set("status", status);
        
        for (const orderId of bulkActions.selectedArray) {
            formData.set("orderId", orderId);
            await updateOrderStatus(formData);
        }
        
        toast.success(`Updated ${bulkActions.selectedCount} orders to ${status}`);
        bulkActions.reset();
        router.refresh();
    };

    // Export orders
    const handleExport = () => {
        const csvContent = [
            ["Order #", "Customer", "Email", "Status", "Payment", "Total", "Date"].join(","),
            ...orders.map(o => [
                o.order_number,
                o.customer_name || "Guest",
                o.customer_email || "",
                o.status,
                o.payment_status,
                o.total,
                format(new Date(o.created_at), "yyyy-MM-dd"),
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `orders-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Orders exported successfully");
    };

    const pageCount = Math.ceil(totalCount / pageSize);
    const orderNodes = orders.map(o => ({ id: o.id }));

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Total Orders</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-caption text-muted-foreground">All time</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <HugeiconsIcon icon={ShoppingCart01Icon} className="w-5 h-5 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Pending</p>
                                <p className="text-2xl font-bold text-chart-4">{stats.pending}</p>
                                <p className="text-caption text-muted-foreground">Needs action</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 text-chart-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Completed</p>
                                <p className="text-2xl font-bold text-chart-2">{stats.completed}</p>
                                <p className="text-caption text-muted-foreground">Delivered</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-chart-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Revenue</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(stats.revenue, currency)}</p>
                                <p className="text-caption text-muted-foreground">From paid orders</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Money01Icon} className="w-5 h-5 text-chart-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full sm:max-w-sm">
                        <HugeiconsIcon
                            icon={Search01Icon}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        />
                        <Input
                            placeholder="Search orders..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>

                    {/* Inline Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filter */}
                        <Select
                            value={getFilter("status") || "all"}
                            onValueChange={(value) => setFilter("status", value === "all" ? undefined : value)}
                        >
                            <SelectTrigger className="w-[140px] bg-background">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">
                                            {opt.color && <span className={cn("h-2 w-2 rounded-full", opt.color)} />}
                                            {opt.label}
                                            {opt.count !== undefined && (
                                                <span className="text-muted-foreground">({opt.count})</span>
                                            )}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Payment Filter */}
                        <Select
                            value={getFilter("payment") || "all"}
                            onValueChange={(value) => setFilter("payment", value === "all" ? undefined : value)}
                        >
                            <SelectTrigger className="w-[140px] bg-background">
                                <SelectValue placeholder="Payment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payment</SelectItem>
                                {paymentOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">
                                            {opt.color && <span className={cn("h-2 w-2 rounded-full", opt.color)} />}
                                            {opt.label}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Date Range Filter */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-[200px] justify-start text-left font-normal",
                                        !dateRange.from && "text-muted-foreground"
                                    )}
                                >
                                    <HugeiconsIcon icon={Calendar03Icon} className="mr-2 h-4 w-4" />
                                    {dateRange.from ? (
                                        dateRange.to ? (
                                            <>
                                                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                                            </>
                                        ) : (
                                            format(dateRange.from, "MMM d, yyyy")
                                        )
                                    ) : (
                                        <span>Pick date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{ from: dateRange.from, to: dateRange.to }}
                                    onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearAll}>
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            className="gap-2"
                        >
                            <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => startRefreshTransition(() => router.refresh())}
                            disabled={isPending || isRefreshing}
                        >
                            <HugeiconsIcon icon={RefreshIcon} className={cn("w-4 h-4", (isPending || isRefreshing) && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Active Filter Chips */}
                {activeFilterChips.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                        {activeFilterChips.map((chip) => (
                            <Badge
                                key={chip.key}
                                variant="secondary"
                                className="gap-1.5 pr-1 font-normal"
                            >
                                <span className="text-muted-foreground">{chip.label}:</span>
                                <span>{chip.displayValue}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => removeFilterChip(chip.key)}
                                >
                                    <HugeiconsIcon icon={CancelIcon} className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-muted-foreground"
                            onClick={clearAll}
                        >
                            Clear all
                        </Button>
                    </div>
                )}

                {/* Bulk Actions */}
                <StickyBulkActionsBar
                    selectedCount={bulkActions.selectedCount}
                    onClear={bulkActions.reset}
                    itemLabel="order"
                >
                    <Button size="sm" variant="secondary" onClick={() => handleBulkStatusUpdate("confirmed")}>
                        Mark Confirmed
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleBulkStatusUpdate("shipped")}>
                        Mark Shipped
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleBulkStatusUpdate("delivered")}>
                        Mark Delivered
                    </Button>
                </StickyBulkActionsBar>
            </div>

            {/* Orders Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={bulkActions.isAllSelected(orderNodes)}
                                    onCheckedChange={() => bulkActions.toggleAll(orderNodes)}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead className="w-[120px]">Order</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden lg:table-cell">Items</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Payment</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={9} className="h-[300px]">
                                    <EmptyState
                                        icon={PackageIcon}
                                        title={getFilter("status") || getFilter("payment") || searchValue
                                            ? "No orders match your filters"
                                            : "No orders yet"}
                                        description={getFilter("status") || getFilter("payment") || searchValue
                                            ? "Try adjusting your search or filters"
                                            : "Orders will appear here once customers start purchasing"}
                                        action={(getFilter("status") || getFilter("payment") || searchValue) ? {
                                            label: "Clear Filters",
                                            onClick: clearAll,
                                        } : undefined}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const status = orderStatusConfig[order.status as keyof typeof orderStatusConfig] || orderStatusConfig.pending;
                                const payment = paymentStatusConfig[order.payment_status as keyof typeof paymentStatusConfig] || paymentStatusConfig.pending;
                                const isSelected = bulkActions.isSelected(order.id);

                                return (
                                    <TableRow 
                                        key={order.id} 
                                        className={cn("group", isSelected && "bg-muted/50")}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => bulkActions.toggle(order.id)}
                                                aria-label={`Select order ${order.order_number}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Link 
                                                href={`/dashboard/orders/${order.id}`}
                                                className="font-mono text-sm font-semibold hover:text-primary transition-colors"
                                            >
                                                #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold">
                                                    {(order.customer_name || order.customer_email || "G")[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate max-w-[150px]">
                                                        {order.customer_name || "Guest"}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                        {order.customer_email || "No email"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <span className="text-muted-foreground">
                                                {order.items_count} item{order.items_count !== 1 ? "s" : ""}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn("border-0 gap-1.5 font-medium", status.bgColor, status.color)}
                                            >
                                                <span className={cn("h-1.5 w-1.5 rounded-full", status.color.replace("text-", "bg-"))} />
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge
                                                variant="secondary"
                                                className={cn("border-0 font-medium", payment.bgColor, payment.color)}
                                            >
                                                {payment.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="font-semibold">
                                                {formatCurrency(Number(order.total), currency)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-muted-foreground">
                                            <div className="flex flex-col">
                                                <span className="text-xs">
                                                    {format(new Date(order.created_at), "MMM d, yyyy")}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground/70">
                                                    {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/orders/${order.id}`}>
                                                            <HugeiconsIcon icon={ViewIcon} className="w-4 h-4 mr-2" />
                                                            View Details
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <HugeiconsIcon icon={PrinterIcon} className="w-4 h-4 mr-2" />
                                                        Print Invoice
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem>
                                                        <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 mr-2" />
                                                        Email Customer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* Pagination */}
            {pageCount > 1 && (
                <DataTablePagination
                    pageIndex={currentPage - 1}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalItems={totalCount}
                    onPageChange={(pageIndex) => setPage(pageIndex + 1)}
                    onPageSizeChange={setPageSize}
                />
            )}
        </div>
    );
}
