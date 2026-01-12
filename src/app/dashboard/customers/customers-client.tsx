"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import {
    Users,
    UserPlus,
    Search,
    Download,
    RefreshCw,
    MoreHorizontal,
    Eye,
    Mail,
    X,
    DollarSign,
    ShoppingCart,
    ChevronUp,
    ChevronDown,
    Phone,
    Trash2,
} from "lucide-react";
import { useBulkActions, useUrlFilters, useConfirmDelete } from "@/shared/hooks";
import { StickyBulkActionsBar } from "@/components/dashboard";
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DataTablePagination } from "@/components/dashboard/data-table/pagination";
import { bulkUpdateMarketing, exportCustomers, deleteCustomer } from "./actions";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/shared/utils";
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

    // Use URL filters hook for state management
    const {
        searchValue,
        setSearchValue,
        setFilter,
        clearAll,
        hasActiveFilters,
        page,
        pageSize: urlPageSize,
        setPage,
        setPageSize,
        isPending,
        getFilter,
        sort,
        sortDir,
        setSort,
    } = useUrlFilters({ defaultPageSize: pageSize });

    // Local state for dialogs
    const confirmDelete = useConfirmDelete();

    // Use Saleor-inspired bulk actions hook
    const bulkActions = useBulkActions();

    // Clear bulk selection when customers change (e.g., page change)
    useEffect(() => {
        bulkActions.reset();
    }, [currentPage]);

    // Handle sort
    const handleSort = (column: string) => {
        setSort(column);
    };

    // Bulk actions
    const handleBulkMarketing = async (subscribe: boolean) => {
        const ids = bulkActions.selectedArray;
        const result = await bulkUpdateMarketing(ids, subscribe);
        
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Updated ${result.updated} customers`);
            bulkActions.reset();
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
    const handleDelete = async (customer: CustomerWithStats) => {
        // Check if customer has orders
        if (customer.orders_count && customer.orders_count > 0) {
            toast.error("Customers with orders cannot be deleted");
            return;
        }
        
        const confirmed = await confirmDelete(customer.email, "customer");
        if (!confirmed) return;
        
        const result = await deleteCustomer(customer.id);
        
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Customer deleted");
            router.refresh();
        }
    };

    const SortIndicator = ({ column }: { column: string }) => {
        if (filters.sortBy !== column) return null;
        return filters.sortOrder === "asc" ? (
            <ChevronUp className="w-3 h-3 ml-1" />
        ) : (
            <ChevronDown className="w-3 h-3 ml-1" />
        );
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const customerNodes = customers.map(c => ({ id: c.id }));

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
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.refresh()}
                            disabled={isPending}
                        >
                            <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-label text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.totalCustomers.toLocaleString()}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                    <Users className="w-5 h-5 text-chart-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-label text-muted-foreground">New</p>
                                    <p className="text-2xl font-bold text-chart-2">{stats.newThisMonth}</p>
                                    <p className="text-caption text-muted-foreground">Last 30 days</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                    <UserPlus className="w-5 h-5 text-chart-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-label text-muted-foreground">Returning</p>
                                    <p className="text-2xl font-bold text-chart-1">{stats.returningCustomers}</p>
                                    <p className="text-caption text-muted-foreground">2+ orders</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                    <RefreshCw className="w-5 h-5 text-chart-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-label text-muted-foreground">Subscribed</p>
                                    <p className="text-2xl font-bold text-chart-5">{stats.subscribedCount}</p>
                                    <p className="text-caption text-muted-foreground">Marketing opt-in</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-chart-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-label text-muted-foreground">Revenue</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue, currency)}</p>
                                    <p className="text-caption text-muted-foreground">All time</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-chart-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-label text-muted-foreground">Avg. Value</p>
                                    <p className="text-2xl font-bold">{formatCurrency(stats.avgCustomerValue, currency)}</p>
                                    <p className="text-caption text-muted-foreground">Per customer</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-chart-4" />
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
                                    <Search
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                                    />
                                    <Input
                                        placeholder="Search customers..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={filters.marketing || "all"}
                                    onValueChange={(value) => setFilter("marketing", value === "all" ? undefined : value)}
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

                            {/* Bulk Actions - Using Saleor-inspired StickyBulkActionsBar */}
                            <StickyBulkActionsBar
                                selectedCount={bulkActions.selectedCount}
                                onClear={bulkActions.reset}
                                itemLabel="customer"
                            >
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleBulkMarketing(true)}
                                >
                                    <Mail className="w-4 h-4 mr-1" />
                                    Subscribe
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleBulkMarketing(false)}
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Unsubscribe
                                </Button>
                            </StickyBulkActionsBar>
                        </div>
                    </CardContent>
                </Card>


                {/* Customers Table */}
                <Card>
                    <CardContent className="p-0">
                        {customers.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="No customers found"
                                description={filters.search || filters.marketing
                                    ? "Try adjusting your filters to find what you're looking for."
                                    : "Customers will appear here when they make their first purchase."}
                                action={(filters.search || filters.marketing) ? {
                                    label: "Clear Filters",
                                    onClick: () => clearAll(),
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
                                                checked={bulkActions.isAllSelected(customerNodes)}
                                                onCheckedChange={() => bulkActions.toggleAll(customerNodes)}
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
                                                bulkActions.isSelected(customer.id) && "bg-muted/50"
                                            )}
                                            onClick={() => router.push(`/dashboard/customers/${customer.id}`)}
                                        >
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    checked={bulkActions.isSelected(customer.id)}
                                                    onCheckedChange={() => bulkActions.toggle(customer.id)}
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
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/customers/${customer.id}`}>
                                                                <Eye className="w-4 h-4 mr-2" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <a href={`mailto:${customer.email}`}>
                                                                <Mail className="w-4 h-4 mr-2" />
                                                                Send Email
                                                            </a>
                                                        </DropdownMenuItem>
                                                        {customer.phone && (
                                                            <DropdownMenuItem asChild>
                                                                <a href={`tel:${customer.phone}`}>
                                                                    <Phone className="w-4 h-4 mr-2" />
                                                                    Call
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDelete(customer)}
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
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
                        onPageChange={(page) => setPage(page + 1)}
                        onPageSizeChange={(size) => setPageSize(size)}
                    />
                )}

            </div>
        </TooltipProvider>
    );
}
