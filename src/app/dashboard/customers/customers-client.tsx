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
    MoreHorizontal,
    Eye,
    Mail,
    X,
    ShoppingCart,
    ChevronUp,
    ChevronDown,
    Phone,
    Trash2,
} from "lucide-react";
import { useBulkActions, useUrlFilters, useConfirmDelete } from "@/hooks";
import { StickyBulkActionsBar } from "@/components/dashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { createCustomer } from "./actions";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import { EntityListPage } from "@/components/dashboard/templates";
import { bulkUpdateMarketing, exportCustomers, deleteCustomer } from "./actions";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/shared/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { CustomerWithStats, CustomerListStats as CustomerStats } from "./types";
import { getInitials, getDisplayName } from "./_components/helpers";

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
    const [createOpen, setCreateOpen] = useState(false);
    const [creating, setCreating] = useState(false);

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
            <ChevronUp className="size-3.5 ml-1" />
        ) : (
            <ChevronDown className="size-3.5 ml-1" />
        );
    };

    const totalPages = Math.ceil(totalCount / pageSize);
    const customerNodes = customers.map(c => ({ id: c.id }));

    return (
        <TooltipProvider>
            <EntityListPage
                title="Customers"
                actions={
                    <>
                        <Button
                            variant="outline"
                            onClick={handleExport}
                            disabled={isPending}
                        >
                            <Download className="size-3.5" />
                            Export
                        </Button>
                        <Button className="gap-2" onClick={() => setCreateOpen(true)}>
                            <UserPlus className="size-4" />
                            Add Customer
                        </Button>
                    </>
                }
            >

                {/* Filters & Search */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 items-center gap-2">
                                <div className="relative flex-1 w-full sm:max-w-sm">
                                    <Search
                                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                                    />
                                    <Input
                                        aria-label="Search customers" placeholder="Search customers..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={filters.marketing || "all"}
                                    onValueChange={(value) => setFilter("marketing", value === "all" ? undefined : value)}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px]" aria-label="Filter by marketing status">
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
                                   
                                    onClick={() => handleBulkMarketing(true)}
                                >
                                    <Mail className="size-4" />
                                    Subscribe
                                </Button>
                                <Button
                                    variant="secondary"
                                   
                                    onClick={() => handleBulkMarketing(false)}
                                >
                                    <X className="size-4" />
                                    Unsubscribe
                                </Button>
                            </StickyBulkActionsBar>
                </div>


                {/* Customers Table */}
                <div className="rounded-lg border">
                        {customers.length === 0 ? (
                            <EmptyState
                                icon={Users}
                                title="No customers found"
                                description={filters.search || filters.marketing
                                    ? "Try adjusting your filters to find what you're looking for."
                                    : "Customers will appear here when they make their first purchase."}
                                hint={!(filters.search || filters.marketing)
                                    ? "Press ⌘K to search across your store"
                                    : undefined}
                                action={(filters.search || filters.marketing) ? {
                                    label: "Clear Filters",
                                    onClick: () => clearAll(),
                                } : undefined}
                                
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
                                                    <Avatar className="size-9">
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
                                                    "font-medium tabular-nums",
                                                    customer.orders_count > 0 ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {customer.orders_count}
                                                </span>
                                            </TableCell>
                                            <TableCell className="hidden lg:table-cell text-right">
                                                <span className={cn(
                                                    "font-medium tabular-nums",
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
                                                            ? "bg-success/10 text-success"
                                                            : "bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    <span className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        customer.accepts_marketing ? "bg-success" : "bg-muted-foreground"
                                                    )} />
                                                    {customer.accepts_marketing ? "Subscribed" : "No"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm" aria-label="More actions"
                                                            className="size-8 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/customers/${customer.id}`}>
                                                                <Eye className="size-3.5" />
                                                                View Details
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <a href={`mailto:${customer.email}`}>
                                                                <Mail className="size-3.5" />
                                                                Send Email
                                                            </a>
                                                        </DropdownMenuItem>
                                                        {customer.phone && (
                                                            <DropdownMenuItem asChild>
                                                                <a href={`tel:${customer.phone}`}>
                                                                    <Phone className="size-3.5" />
                                                                    Call
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDelete(customer)}
                                                        >
                                                            <Trash2 className="size-3.5" />
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
                    
                </div>

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

            </EntityListPage>

            {/* Create Customer Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Customer</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setCreating(true);
                        const fd = new FormData(e.currentTarget);
                        const result = await createCustomer(fd);
                        setCreating(false);
                        if (result.error) { toast.error(result.error); return; }
                        toast.success("Customer created");
                        setCreateOpen(false);
                        if (result.id) router.push(`/dashboard/customers/${result.id}`);
                    }}>
                        <div className="space-y-3 py-4">
                            <div className="space-y-1">
                                <Label htmlFor="email" className="text-xs">Email *</Label>
                                <Input id="email" name="email" type="email" required placeholder="customer@example.com" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label htmlFor="firstName" className="text-xs">First name</Label>
                                    <Input id="firstName" name="firstName" placeholder="Ram" />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="lastName" className="text-xs">Last name</Label>
                                    <Input id="lastName" name="lastName" placeholder="Bahadur" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="phone" className="text-xs">Phone</Label>
                                <Input id="phone" name="phone" type="tel" placeholder="9841234567" />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={creating}>{creating ? "Creating…" : "Add Customer"}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}
