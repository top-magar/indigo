"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ShoppingCart01Icon,
    Clock01Icon,
    CheckmarkCircle02Icon,
    DeliveryTruck01Icon,
    PackageIcon,
    Cancel01Icon,
    Search01Icon,
    FilterIcon,
    Download01Icon,
    ArrowRight01Icon,
    Calendar03Icon,
    Money01Icon,
    RefreshIcon,
    MoreHorizontalIcon,
    ViewIcon,
    PencilEdit01Icon,
    PrinterIcon,
    Mail01Icon,
} from "@hugeicons/core-free-icons";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { DataTablePagination } from "@/components/dashboard/data-table/pagination";
import { updateOrderStatus } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

// Status configuration
const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof Clock01Icon; label: string }> = {
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10", icon: Clock01Icon, label: "Pending" },
    confirmed: { color: "text-chart-1", bgColor: "bg-chart-1/10", icon: PackageIcon, label: "Confirmed" },
    processing: { color: "text-chart-1", bgColor: "bg-chart-1/10", icon: PackageIcon, label: "Processing" },
    shipped: { color: "text-chart-5", bgColor: "bg-chart-5/10", icon: DeliveryTruck01Icon, label: "Shipped" },
    delivered: { color: "text-chart-2", bgColor: "bg-chart-2/10", icon: CheckmarkCircle02Icon, label: "Delivered" },
    completed: { color: "text-chart-2", bgColor: "bg-chart-2/10", icon: CheckmarkCircle02Icon, label: "Completed" },
    cancelled: { color: "text-destructive", bgColor: "bg-destructive/10", icon: Cancel01Icon, label: "Cancelled" },
    refunded: { color: "text-destructive", bgColor: "bg-destructive/10", icon: Cancel01Icon, label: "Refunded" },
};

const paymentStatusConfig: Record<string, { color: string; bgColor: string; label: string }> = {
    pending: { color: "text-chart-4", bgColor: "bg-chart-4/10", label: "Unpaid" },
    paid: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Paid" },
    partially_refunded: { color: "text-chart-5", bgColor: "bg-chart-5/10", label: "Partial Refund" },
    refunded: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Refunded" },
    failed: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Failed" },
};

// Format currency
function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}


export function OrdersClient({
    orders,
    stats,
    totalCount,
    currentPage,
    pageSize,
    currency,
    filters,
}: OrdersClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [searchValue, setSearchValue] = useState(filters.search || "");
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: filters.from ? new Date(filters.from) : undefined,
        to: filters.to ? new Date(filters.to) : undefined,
    });

    // Update URL with filters
    const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        // Reset to page 1 when filters change
        if (!updates.page) {
            params.delete("page");
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [pathname, router, searchParams]);

    // Handle search with debounce
    const handleSearch = useCallback((value: string) => {
        setSearchValue(value);
        const timeoutId = setTimeout(() => {
            updateFilters({ search: value || undefined });
        }, 300);
        return () => clearTimeout(timeoutId);
    }, [updateFilters]);

    // Handle bulk selection
    const toggleSelectAll = () => {
        if (selectedOrders.size === orders.length) {
            setSelectedOrders(new Set());
        } else {
            setSelectedOrders(new Set(orders.map(o => o.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedOrders);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedOrders(newSelected);
    };

    // Handle bulk status update
    const handleBulkStatusUpdate = async (status: string) => {
        const formData = new FormData();
        formData.set("status", status);
        
        for (const orderId of selectedOrders) {
            formData.set("orderId", orderId);
            await updateOrderStatus(formData);
        }
        
        toast.success(`Updated ${selectedOrders.size} orders to ${status}`);
        setSelectedOrders(new Set());
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

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Orders</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-muted-foreground">All time</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                <HugeiconsIcon icon={ShoppingCart01Icon} className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pending</p>
                                <p className="text-2xl font-bold text-chart-4">{stats.pending}</p>
                                <p className="text-xs text-muted-foreground">Needs action</p>
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
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Completed</p>
                                <p className="text-2xl font-bold text-chart-2">{stats.completed}</p>
                                <p className="text-xs text-muted-foreground">Delivered</p>
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
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revenue</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(stats.revenue, currency)}</p>
                                <p className="text-xs text-muted-foreground">From paid orders</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Money01Icon} className="w-5 h-5 text-primary" />
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
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Select
                            value={filters.status || "all"}
                            onValueChange={(value) => updateFilters({ status: value === "all" ? undefined : value })}
                        >
                            <SelectTrigger className="w-[140px] bg-background">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-chart-4" />
                                        Pending ({stats.pending})
                                    </span>
                                </SelectItem>
                                <SelectItem value="processing,confirmed">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-chart-1" />
                                        Processing ({stats.processing})
                                    </span>
                                </SelectItem>
                                <SelectItem value="shipped">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-chart-5" />
                                        Shipped ({stats.shipped})
                                    </span>
                                </SelectItem>
                                <SelectItem value="delivered,completed">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-chart-2" />
                                        Completed ({stats.completed})
                                    </span>
                                </SelectItem>
                                <SelectItem value="cancelled,refunded">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-destructive" />
                                        Cancelled ({stats.cancelled})
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.payment || "all"}
                            onValueChange={(value) => updateFilters({ payment: value === "all" ? undefined : value })}
                        >
                            <SelectTrigger className="w-[130px] bg-background">
                                <SelectValue placeholder="Payment" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payments</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="pending">Unpaid</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Date Range */}
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" size="sm" className="h-9 gap-2">
                                    <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4" />
                                    {dateRange.from ? (
                                        dateRange.to ? (
                                            <span className="hidden sm:inline">
                                                {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d")}
                                            </span>
                                        ) : (
                                            format(dateRange.from, "MMM d, yyyy")
                                        )
                                    ) : (
                                        <span>Date Range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={{ from: dateRange.from, to: dateRange.to }}
                                    onSelect={(range) => {
                                        setDateRange({ from: range?.from, to: range?.to });
                                        updateFilters({
                                            from: range?.from?.toISOString(),
                                            to: range?.to?.toISOString(),
                                        });
                                    }}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>

                        {/* Clear Filters */}
                        {(filters.status || filters.payment || filters.search || filters.from) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchValue("");
                                    setDateRange({});
                                    router.push(pathname);
                                }}
                            >
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
                            onClick={() => router.refresh()}
                            disabled={isPending}
                        >
                            <HugeiconsIcon icon={RefreshIcon} className={cn("w-4 h-4", isPending && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedOrders.size > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">{selectedOrders.size} selected</span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("confirmed")}>
                                Mark Confirmed
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("shipped")}>
                                Mark Shipped
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("delivered")}>
                                Mark Delivered
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedOrders(new Set())}>
                                Clear
                            </Button>
                        </div>
                    </div>
                )}
            </div>


            {/* Orders Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedOrders.size === orders.length && orders.length > 0}
                                    onCheckedChange={toggleSelectAll}
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
                                        title={filters.search || filters.status || filters.payment
                                            ? "No orders match your filters"
                                            : "No orders yet"}
                                        description={filters.search || filters.status || filters.payment
                                            ? "Try adjusting your search or filters"
                                            : "Orders will appear here once customers start purchasing"}
                                        action={(filters.search || filters.status || filters.payment) ? {
                                            label: "Clear Filters",
                                            onClick: () => router.push(pathname),
                                        } : undefined}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            orders.map((order) => {
                                const status = statusConfig[order.status] || statusConfig.pending;
                                const payment = paymentStatusConfig[order.payment_status] || paymentStatusConfig.pending;
                                const isSelected = selectedOrders.has(order.id);

                                return (
                                    <TableRow 
                                        key={order.id} 
                                        className={cn("group", isSelected && "bg-muted/50")}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelect(order.id)}
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
                                                    {order.customer_email && (
                                                        <DropdownMenuItem>
                                                            <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 mr-2" />
                                                            Email Customer
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={async () => {
                                                            const formData = new FormData();
                                                            formData.set("orderId", order.id);
                                                            formData.set("status", "confirmed");
                                                            await updateOrderStatus(formData);
                                                            router.refresh();
                                                            toast.success("Order confirmed");
                                                        }}
                                                    >
                                                        Mark as Confirmed
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={async () => {
                                                            const formData = new FormData();
                                                            formData.set("orderId", order.id);
                                                            formData.set("status", "shipped");
                                                            await updateOrderStatus(formData);
                                                            router.refresh();
                                                            toast.success("Order marked as shipped");
                                                        }}
                                                    >
                                                        Mark as Shipped
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={async () => {
                                                            const formData = new FormData();
                                                            formData.set("orderId", order.id);
                                                            formData.set("status", "delivered");
                                                            await updateOrderStatus(formData);
                                                            router.refresh();
                                                            toast.success("Order marked as delivered");
                                                        }}
                                                    >
                                                        Mark as Delivered
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
            {orders.length > 0 && (
                <DataTablePagination
                    pageIndex={currentPage}
                    pageSize={pageSize}
                    pageCount={pageCount}
                    totalItems={totalCount}
                    selectedCount={selectedOrders.size}
                    onPageChange={(page) => updateFilters({ page: String(page + 1) })}
                    onPageSizeChange={(size) => updateFilters({ per_page: String(size), page: "1" })}
                />
            )}
        </div>
    );
}
