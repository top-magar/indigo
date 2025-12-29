"use client";

import { useState, useCallback, useTransition, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserMultipleIcon,
    UserAdd01Icon,
    Search01Icon,
    Download01Icon,
    RefreshIcon,
    MoreHorizontalIcon,
    ViewIcon,
    Mail01Icon,
    Cancel01Icon,
    CheckmarkCircle02Icon,
    Money01Icon,
    ShoppingCart01Icon,
    Calendar03Icon,
    ArrowUp02Icon,
    ArrowDown02Icon,
    UserIcon,
    SmartPhone01Icon,
    Delete02Icon,
    PencilEdit01Icon,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTablePagination } from "@/components/dashboard/data-table/pagination";
import { bulkUpdateMarketing, exportCustomers, deleteCustomer } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { CustomerWithStats, CustomerStats } from "./actions";

interface CustomersClientProps {
    customers: CustomerWithStats[];
    stats: CustomerStats;
    totalCount: number;
    currentPage: number;
    pageSize: number;
    currency: string;
    filters: {
        search?: string;
        marketing?: string;
        sortBy?: string;
        sortOrder?: string;
    };
}

// Format currency
function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

// Get initials from name
function getInitials(firstName: string | null, lastName: string | null, email: string): string {
    if (firstName && lastName) {
        return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
        return firstName.slice(0, 2).toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
}

// Get display name
function getDisplayName(firstName: string | null, lastName: string | null, email: string): string {
    if (firstName || lastName) {
        return `${firstName || ""} ${lastName || ""}`.trim();
    }
    return email.split("@")[0];
}

export function CustomersClient({
    customers,
    stats,
    totalCount,
    currentPage,
    pageSize,
    currency,
    filters,
}: CustomersClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Local state
    const [searchQuery, setSearchQuery] = useState(filters.search || "");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [customerToDelete, setCustomerToDelete] = useState<CustomerWithStats | null>(null);

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

    // Handle search
    const handleSearch = useCallback(() => {
        updateFilters({ search: searchQuery || undefined });
    }, [searchQuery, updateFilters]);

    // Handle sort
    const handleSort = (column: string) => {
        const currentSort = filters.sortBy;
        const currentOrder = filters.sortOrder;
        
        let newOrder = "desc";
        if (currentSort === column && currentOrder === "desc") {
            newOrder = "asc";
        }
        
        updateFilters({ sortBy: column, sortOrder: newOrder });
    };

    // Selection handlers
    const toggleSelectAll = () => {
        if (selectedIds.size === customers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(customers.map(c => c.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    // Bulk actions
    const handleBulkMarketing = async (subscribe: boolean) => {
        const ids = Array.from(selectedIds);
        const result = await bulkUpdateMarketing(ids, subscribe);
        
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Updated ${result.updated} customers`);
            setSelectedIds(new Set());
            router.refresh();
        }
    };

    // Export
    const handleExport = async () => {
        const result = await exportCustomers(filters);
        
        if (result.error) {
            toast.error(result.error);
            return;
        }

        if (result.csv) {
            const blob = new Blob([result.csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `customers-${format(new Date(), "yyyy-MM-dd")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Customers exported");
        }
    };

    // Delete customer
    const handleDelete = async () => {
        if (!customerToDelete) return;
        
        const result = await deleteCustomer(customerToDelete.id);
        
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Customer deleted");
            router.refresh();
        }
        
        setDeleteDialogOpen(false);
        setCustomerToDelete(null);
    };

    // Sort indicator
    const SortIndicator = ({ column }: { column: string }) => {
        if (filters.sortBy !== column) return null;
        return (
            <HugeiconsIcon
                icon={filters.sortOrder === "asc" ? ArrowUp02Icon : ArrowDown02Icon}
                className="w-3 h-3 ml-1"
            />
        );
    };

    const totalPages = Math.ceil(totalCount / pageSize);

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
                        <p className="text-muted-foreground">
                            Manage your customer relationships and data
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            disabled={isPending}
                        >
                            <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.refresh()}
                            disabled={isPending}
                        >
                            <HugeiconsIcon icon={RefreshIcon} className={cn("w-4 h-4", isPending && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total</p>
                                    <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                    <HugeiconsIcon icon={UserMultipleIcon} className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">New</p>
                                    <p className="text-2xl font-bold text-chart-2">{stats.newThisMonth}</p>
                                    <p className="text-[10px] text-muted-foreground">Last 30 days</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={UserAdd01Icon} className="w-5 h-5 text-chart-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Returning</p>
                                    <p className="text-2xl font-bold text-chart-1">{stats.returningCustomers}</p>
                                    <p className="text-[10px] text-muted-foreground">2+ orders</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={RefreshIcon} className="w-5 h-5 text-chart-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subscribed</p>
                                    <p className="text-2xl font-bold text-chart-5">{stats.subscribedCount}</p>
                                    <p className="text-[10px] text-muted-foreground">Marketing opt-in</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                                    <HugeiconsIcon icon={Mail01Icon} className="w-5 h-5 text-chart-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue, currency)}</p>
                                    <p className="text-[10px] text-muted-foreground">All time</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                    <HugeiconsIcon icon={Money01Icon} className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Avg. Value</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.avgCustomerValue, currency)}</p>
                                    <p className="text-[10px] text-muted-foreground">Per customer</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                    <HugeiconsIcon icon={ShoppingCart01Icon} className="w-5 h-5 text-muted-foreground" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Search */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 items-center gap-2">
                                <div className="relative flex-1 max-w-sm">
                                    <HugeiconsIcon
                                        icon={Search01Icon}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                                    />
                                    <Input
                                        placeholder="Search customers..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={filters.marketing || "all"}
                                    onValueChange={(value) => updateFilters({ marketing: value === "all" ? undefined : value })}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Marketing" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Customers</SelectItem>
                                        <SelectItem value="subscribed">Subscribed</SelectItem>
                                        <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Bulk Actions */}
                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedIds.size} selected
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkMarketing(true)}
                                    >
                                        <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 mr-1" />
                                        Subscribe
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleBulkMarketing(false)}
                                    >
                                        <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-1" />
                                        Unsubscribe
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>


                {/* Customers Table */}
                <Card>
                    <CardContent className="p-0">
                        {customers.length === 0 ? (
                            <EmptyState
                                icon={UserMultipleIcon}
                                title="No customers found"
                                description={filters.search || filters.marketing
                                    ? "Try adjusting your filters to find what you're looking for."
                                    : "Customers will appear here when they make their first purchase."}
                                action={(filters.search || filters.marketing) ? {
                                    label: "Clear Filters",
                                    onClick: () => updateFilters({ search: undefined, marketing: undefined }),
                                } : undefined}
                                size="lg"
                                className="py-16"
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedIds.size === customers.length && customers.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                        <TableHead>
                                            <button
                                                className="flex items-center font-medium hover:text-foreground"
                                                onClick={() => handleSort("email")}
                                            >
                                                Customer
                                                <SortIndicator column="email" />
                                            </button>
                                        </TableHead>
                                        <TableHead className="hidden md:table-cell">
                                            <button
                                                className="flex items-center font-medium hover:text-foreground"
                                                onClick={() => handleSort("created_at")}
                                            >
                                                Joined
                                                <SortIndicator column="created_at" />
                                            </button>
                                        </TableHead>
                                        <TableHead className="hidden lg:table-cell text-center">Orders</TableHead>
                                        <TableHead className="hidden lg:table-cell text-right">Total Spent</TableHead>
                                        <TableHead className="hidden sm:table-cell">Marketing</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {customers.map((customer) => (
                                        <TableRow
                                            key={customer.id}
                                            className={cn(
                                                "group cursor-pointer",
                                                selectedIds.has(customer.id) && "bg-muted/50"
                                            )}
                                            onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={selectedIds.has(customer.id)}
                                                    onCheckedChange={() => toggleSelect(customer.id)}
                                                    aria-label={`Select ${customer.email}`}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9">
                                                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                                                            {getInitials(customer.first_name, customer.last_name, customer.email)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <p className="font-medium truncate">
                                                            {getDisplayName(customer.first_name, customer.last_name, customer.email)}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground truncate">
                                                            {customer.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="text-muted-foreground">
                                                            {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        {format(new Date(customer.created_at), "PPP")}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-center">
                                                <span className={cn(
                                                    "font-medium",
                                                    customer.orders_count > 0 ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {customer.orders_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-right">
                                                <span className={cn(
                                                    "font-medium",
                                                    customer.total_spent > 0 ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {formatCurrency(customer.total_spent, currency)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <Badge
                                                    variant="secondary"
                                                    className={cn(
                                                        "border-0 gap-1.5",
                                                        customer.accepts_marketing
                                                            ? "bg-chart-2/10 text-chart-2"
                                                            : "bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        customer.accepts_marketing ? "bg-chart-2" : "bg-muted-foreground"
                                                    )} />
                                                    {customer.accepts_marketing ? "Subscribed" : "No"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/customers/${customer.id}`}>
                                                                <HugeiconsIcon icon={ViewIcon} className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <a href={`mailto:${customer.email}`}>
                                                                <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 mr-2" />
                                                                Send Email
                                                            </a>
                                                        </DropdownMenuItem>
                                                        {customer.phone && (
                                                            <DropdownMenuItem asChild>
                                                                <a href={`tel:${customer.phone}`}>
                                                                    <HugeiconsIcon icon={SmartPhone01Icon} className="w-4 h-4 mr-2" />
                                                                    Call
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setCustomerToDelete(customer);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {totalCount > pageSize && (
                    <DataTablePagination
                        pageIndex={currentPage - 1}
                        pageCount={totalPages}
                        pageSize={pageSize}
                        totalItems={totalCount}
                        onPageChange={(page) => updateFilters({ page: (page + 1).toString() })}
                        onPageSizeChange={(size) => updateFilters({ pageSize: size.toString(), page: "1" })}
                    />
                )}

                {/* Delete Confirmation Dialog */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to delete {customerToDelete?.email}? This action cannot be undone.
                                {customerToDelete?.orders_count && customerToDelete.orders_count > 0 && (
                                    <span className="block mt-2 text-destructive">
                                        Note: Customers with orders cannot be deleted.
                                    </span>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </TooltipProvider>
    );
}
