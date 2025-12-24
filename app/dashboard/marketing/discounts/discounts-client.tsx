"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    DiscountIcon,
    Add01Icon,
    MoreHorizontalIcon,
    CheckmarkCircle02Icon,
    Copy01Icon,
    Delete01Icon,
    Edit01Icon,
    PercentIcon,
    Money01Icon,
    PauseIcon,
    PlayIcon,
    Search01Icon,
    DeliveryTruck01Icon,
    ArrowLeft01Icon,
    Download01Icon,
    ArrowUp01Icon,
    ArrowDown01Icon,
    Cancel01Icon,
    AnalyticsUpIcon,
    Calendar01Icon,
    UserMultipleIcon,
    Loading01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import { 
    type Discount, 
    toggleDiscountStatus, 
    deleteDiscount, 
    duplicateDiscount,
    bulkDeleteDiscounts,
    bulkToggleDiscounts,
} from "../actions";
import { DiscountDialog } from "../discount-dialog";
import { toast } from "sonner";

interface DiscountsClientProps {
    discounts: Discount[];
    currency: string;
}

type SortField = "code" | "type" | "value" | "used_count" | "expires_at" | "created_at";
type SortDirection = "asc" | "desc";

function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDate(dateString: string | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function getDiscountTypeIcon(type: Discount["type"]) {
    switch (type) {
        case "percentage": return PercentIcon;
        case "fixed": return Money01Icon;
        case "free_shipping": return DeliveryTruck01Icon;
        case "buy_x_get_y": return DiscountIcon;
        default: return DiscountIcon;
    }
}

function getDiscountTypeLabel(type: Discount["type"]) {
    switch (type) {
        case "percentage": return "Percentage";
        case "fixed": return "Fixed Amount";
        case "free_shipping": return "Free Shipping";
        case "buy_x_get_y": return "Buy X Get Y";
        default: return type;
    }
}

function getDiscountValue(discount: Discount, currency: string) {
    switch (discount.type) {
        case "percentage": return `${discount.value}%`;
        case "fixed": return formatCurrency(discount.value, currency);
        case "free_shipping": return "Free";
        case "buy_x_get_y": return "BOGO";
        default: return `${discount.value}`;
    }
}

function getDiscountStatus(discount: Discount): { label: string; variant: string } {
    const now = new Date();
    const expiresAt = discount.expires_at ? new Date(discount.expires_at) : null;
    const startsAt = discount.starts_at ? new Date(discount.starts_at) : null;

    if (!discount.is_active) return { label: "Inactive", variant: "inactive" };
    if (expiresAt && expiresAt < now) return { label: "Expired", variant: "expired" };
    if (startsAt && startsAt > now) return { label: "Scheduled", variant: "scheduled" };
    if (discount.max_uses && discount.used_count >= discount.max_uses) return { label: "Limit Reached", variant: "limit" };
    return { label: "Active", variant: "active" };
}

function getStatusBadgeClass(variant: string) {
    switch (variant) {
        case "active": return "bg-chart-2/10 text-chart-2";
        case "scheduled": return "bg-chart-4/10 text-chart-4";
        case "expired": return "bg-destructive/10 text-destructive";
        case "inactive": return "bg-muted text-muted-foreground";
        case "limit": return "bg-muted text-muted-foreground";
        default: return "bg-muted text-muted-foreground";
    }
}

// Export discounts to CSV
function exportToCSV(discounts: Discount[], currency: string) {
    const headers = ["Code", "Name", "Type", "Value", "Min Order", "Usage", "Max Uses", "Status", "Starts", "Expires", "Created"];
    const rows = discounts.map(d => {
        const status = getDiscountStatus(d);
        return [
            d.code,
            d.name,
            getDiscountTypeLabel(d.type),
            getDiscountValue(d, currency),
            d.min_order_amount ? formatCurrency(d.min_order_amount, currency) : "",
            d.used_count.toString(),
            d.max_uses?.toString() || "Unlimited",
            status.label,
            d.starts_at ? new Date(d.starts_at).toISOString().split("T")[0] : "",
            d.expires_at ? new Date(d.expires_at).toISOString().split("T")[0] : "",
            new Date(d.created_at).toISOString().split("T")[0],
        ];
    });
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `discounts-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export function DiscountsClient({ discounts, currency }: DiscountsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    
    // Dialog states
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [discountToDelete, setDiscountToDelete] = useState<Discount | null>(null);
    const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
    
    // Selection state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    
    // Filter states
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
    const [typeFilter, setTypeFilter] = useState(searchParams.get("type") || "all");
    
    // Sort state
    const [sortField, setSortField] = useState<SortField>("created_at");
    const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
    
    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // Update URL with filters
    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== "all") {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Filter and sort discounts
    const filteredDiscounts = useMemo(() => {
        let result = discounts.filter((discount) => {
            const matchesSearch = discount.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                discount.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            const status = getDiscountStatus(discount);
            const matchesStatus = statusFilter === "all" || status.variant === statusFilter;
            const matchesType = typeFilter === "all" || discount.type === typeFilter;

            return matchesSearch && matchesStatus && matchesType;
        });

        // Sort
        result.sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case "code":
                    comparison = a.code.localeCompare(b.code);
                    break;
                case "type":
                    comparison = a.type.localeCompare(b.type);
                    break;
                case "value":
                    comparison = Number(a.value) - Number(b.value);
                    break;
                case "used_count":
                    comparison = a.used_count - b.used_count;
                    break;
                case "expires_at":
                    const aDate = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
                    const bDate = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
                    comparison = aDate - bDate;
                    break;
                case "created_at":
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
            }
            return sortDirection === "asc" ? comparison : -comparison;
        });

        return result;
    }, [discounts, searchQuery, statusFilter, typeFilter, sortField, sortDirection]);

    // Pagination
    const totalPages = Math.ceil(filteredDiscounts.length / pageSize);
    const paginatedDiscounts = filteredDiscounts.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Stats
    const activeCount = discounts.filter(d => getDiscountStatus(d).variant === "active").length;
    const totalRedemptions = discounts.reduce((sum, d) => sum + d.used_count, 0);
    const scheduledCount = discounts.filter(d => getDiscountStatus(d).variant === "scheduled").length;
    const expiredCount = discounts.filter(d => getDiscountStatus(d).variant === "expired").length;

    // Selection handlers
    const isAllSelected = paginatedDiscounts.length > 0 && paginatedDiscounts.every(d => selectedIds.has(d.id));
    const isSomeSelected = paginatedDiscounts.some(d => selectedIds.has(d.id));

    const toggleSelectAll = () => {
        if (isAllSelected) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(paginatedDiscounts.map(d => d.id)));
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

    // Sort handler
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return null;
        return (
            <HugeiconsIcon 
                icon={sortDirection === "asc" ? ArrowUp01Icon : ArrowDown01Icon} 
                className="h-3 w-3 ml-1" 
            />
        );
    };

    // Action handlers
    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        toast.success("Discount code copied");
    };

    const handleToggleDiscount = async (id: string, currentStatus: boolean) => {
        startTransition(async () => {
            const result = await toggleDiscountStatus(id, !currentStatus);
            if (result.success) {
                toast.success(currentStatus ? "Discount deactivated" : "Discount activated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to update discount");
            }
        });
    };

    const handleDeleteDiscount = async () => {
        if (!discountToDelete) return;
        startTransition(async () => {
            const result = await deleteDiscount(discountToDelete.id);
            if (result.success) {
                toast.success("Discount deleted");
                setDiscountToDelete(null);
                setDeleteDialogOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete discount");
            }
        });
    };

    const handleDuplicateDiscount = async (id: string) => {
        startTransition(async () => {
            const result = await duplicateDiscount(id);
            if (result.success) {
                toast.success("Discount duplicated");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to duplicate discount");
            }
        });
    };

    const handleEditDiscount = (discount: Discount) => {
        setSelectedDiscount(discount);
        setDialogOpen(true);
    };

    // Bulk actions
    const handleBulkActivate = async () => {
        startTransition(async () => {
            const result = await bulkToggleDiscounts(Array.from(selectedIds), true);
            if (result.success) {
                toast.success(`${selectedIds.size} discounts activated`);
                setSelectedIds(new Set());
                router.refresh();
            } else {
                toast.error(result.error || "Failed to activate discounts");
            }
        });
    };

    const handleBulkDeactivate = async () => {
        startTransition(async () => {
            const result = await bulkToggleDiscounts(Array.from(selectedIds), false);
            if (result.success) {
                toast.success(`${selectedIds.size} discounts deactivated`);
                setSelectedIds(new Set());
                router.refresh();
            } else {
                toast.error(result.error || "Failed to deactivate discounts");
            }
        });
    };

    const handleBulkDelete = async () => {
        startTransition(async () => {
            const result = await bulkDeleteDiscounts(Array.from(selectedIds));
            if (result.success) {
                toast.success(`${result.deletedCount} discounts deleted`);
                setSelectedIds(new Set());
                setBulkDeleteDialogOpen(false);
                router.refresh();
            } else {
                toast.error(result.error || "Failed to delete discounts");
            }
        });
    };

    const handleDialogClose = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            setSelectedDiscount(null);
            router.refresh();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <Link href="/dashboard/marketing">
                            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Discounts</h1>
                        <p className="text-sm text-muted-foreground">
                            Create and manage discount codes
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {discounts.length > 0 && (
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button 
                                        variant="outline" 
                                        size="icon" 
                                        onClick={() => exportToCSV(filteredDiscounts, currency)}
                                    >
                                        <HugeiconsIcon icon={Download01Icon} className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Export to CSV</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}
                    <Button size="sm" onClick={() => { setSelectedDiscount(null); setDialogOpen(true); }}>
                        <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                        Create Discount
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-chart-2" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Active</p>
                                <p className="text-xl font-semibold">{activeCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-1/10">
                                <HugeiconsIcon icon={AnalyticsUpIcon} className="h-5 w-5 text-chart-1" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Redemptions</p>
                                <p className="text-xl font-semibold">{totalRedemptions.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
                                <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 text-chart-4" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Scheduled</p>
                                <p className="text-xl font-semibold">{scheduledCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5 text-destructive" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Expired</p>
                                <p className="text-xl font-semibold">{expiredCount}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters & Bulk Actions */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-base">All Discounts</CardTitle>
                            <CardDescription>
                                {discounts.length === 0 
                                    ? "No discounts created yet"
                                    : `${filteredDiscounts.length} discount${filteredDiscounts.length !== 1 ? "s" : ""}`
                                }
                                {selectedIds.size > 0 && ` • ${selectedIds.size} selected`}
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            {selectedIds.size > 0 ? (
                                <>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleBulkActivate}
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <HugeiconsIcon icon={PlayIcon} className="h-4 w-4 mr-1" />
                                        )}
                                        Activate
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={handleBulkDeactivate}
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 mr-1 animate-spin" />
                                        ) : (
                                            <HugeiconsIcon icon={PauseIcon} className="h-4 w-4 mr-1" />
                                        )}
                                        Deactivate
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => setBulkDeleteDialogOpen(true)}
                                        disabled={isPending}
                                    >
                                        <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <div className="relative">
                                        <HugeiconsIcon icon={Search01Icon} className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search codes..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value);
                                                setCurrentPage(1);
                                            }}
                                            className="pl-8 w-full sm:w-[200px]"
                                        />
                                    </div>
                                    <Select 
                                        value={statusFilter} 
                                        onValueChange={(v) => {
                                            setStatusFilter(v);
                                            updateFilters("status", v);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[140px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Status</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="scheduled">Scheduled</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                            <SelectItem value="expired">Expired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Select 
                                        value={typeFilter} 
                                        onValueChange={(v) => {
                                            setTypeFilter(v);
                                            updateFilters("type", v);
                                            setCurrentPage(1);
                                        }}
                                    >
                                        <SelectTrigger className="w-full sm:w-[140px]">
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Types</SelectItem>
                                            <SelectItem value="percentage">Percentage</SelectItem>
                                            <SelectItem value="fixed">Fixed Amount</SelectItem>
                                            <SelectItem value="free_shipping">Free Shipping</SelectItem>
                                            <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {discounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                                <HugeiconsIcon icon={DiscountIcon} className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium mb-2">No discounts yet</h3>
                            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                                Create your first discount code to attract customers and boost sales
                            </p>
                            <Button onClick={() => { setSelectedDiscount(null); setDialogOpen(true); }}>
                                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                                Create Discount
                            </Button>
                        </div>
                    ) : filteredDiscounts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                                <HugeiconsIcon icon={Search01Icon} className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <h3 className="text-sm font-medium mb-1">No discounts found</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Try adjusting your search or filters
                            </p>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                    setSearchQuery("");
                                    setStatusFilter("all");
                                    setTypeFilter("all");
                                }}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[40px]">
                                            <Checkbox
                                                checked={isAllSelected}
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Select all"
                                                className={isSomeSelected && !isAllSelected ? "opacity-50" : ""}
                                            />
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground"
                                            onClick={() => handleSort("code")}
                                        >
                                            <div className="flex items-center">
                                                Code
                                                <SortIcon field="code" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground"
                                            onClick={() => handleSort("type")}
                                        >
                                            <div className="flex items-center">
                                                Type
                                                <SortIcon field="type" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground"
                                            onClick={() => handleSort("value")}
                                        >
                                            <div className="flex items-center">
                                                Value
                                                <SortIcon field="value" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground"
                                            onClick={() => handleSort("used_count")}
                                        >
                                            <div className="flex items-center">
                                                Usage
                                                <SortIcon field="used_count" />
                                            </div>
                                        </TableHead>
                                        <TableHead 
                                            className="cursor-pointer hover:text-foreground hidden md:table-cell"
                                            onClick={() => handleSort("expires_at")}
                                        >
                                            <div className="flex items-center">
                                                Expires
                                                <SortIcon field="expires_at" />
                                            </div>
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="w-[50px]"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedDiscounts.map((discount) => {
                                        const status = getDiscountStatus(discount);
                                        const usagePercent = discount.max_uses 
                                            ? (discount.used_count / discount.max_uses) * 100 
                                            : null;

                                        return (
                                            <TableRow 
                                                key={discount.id}
                                                className={selectedIds.has(discount.id) ? "bg-muted/50" : ""}
                                            >
                                                <TableCell>
                                                    <Checkbox
                                                        checked={selectedIds.has(discount.id)}
                                                        onCheckedChange={() => toggleSelect(discount.id)}
                                                        aria-label={`Select ${discount.code}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <code className="rounded bg-muted px-2 py-1 text-sm font-mono">
                                                            {discount.code}
                                                        </code>
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7"
                                                                        onClick={() => handleCopyCode(discount.code)}
                                                                    >
                                                                        <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Copy code</TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{discount.name}</p>
                                                    {discount.first_time_purchase_only && (
                                                        <Badge variant="outline" className="text-[10px] mt-1">
                                                            <HugeiconsIcon icon={UserMultipleIcon} className="h-2.5 w-2.5 mr-1" />
                                                            First purchase only
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <HugeiconsIcon 
                                                            icon={getDiscountTypeIcon(discount.type)} 
                                                            className="h-4 w-4 text-muted-foreground" 
                                                        />
                                                        <span className="text-sm">{getDiscountTypeLabel(discount.type)}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    {getDiscountValue(discount, currency)}
                                                    {discount.min_order_amount && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Min: {formatCurrency(Number(discount.min_order_amount), currency)}
                                                        </p>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <span className="tabular-nums text-sm">
                                                            {discount.used_count.toLocaleString()}
                                                            {discount.max_uses && (
                                                                <span className="text-muted-foreground"> / {discount.max_uses.toLocaleString()}</span>
                                                            )}
                                                        </span>
                                                        {usagePercent !== null && (
                                                            <Progress value={usagePercent} className="h-1 w-16" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm hidden md:table-cell">
                                                    {formatDate(discount.expires_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className={getStatusBadgeClass(status.variant)}>
                                                        {status.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isPending}>
                                                                <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleCopyCode(discount.code)}>
                                                                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
                                                                Copy Code
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleEditDiscount(discount)}>
                                                                <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDuplicateDiscount(discount.id)}>
                                                                <HugeiconsIcon icon={Copy01Icon} className="h-4 w-4 mr-2" />
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleToggleDiscount(discount.id, discount.is_active)}>
                                                                <HugeiconsIcon icon={discount.is_active ? PauseIcon : PlayIcon} className="h-4 w-4 mr-2" />
                                                                {discount.is_active ? "Deactivate" : "Activate"}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem 
                                                                className="text-destructive focus:text-destructive"
                                                                onClick={() => {
                                                                    setDiscountToDelete(discount);
                                                                    setDeleteDialogOpen(true);
                                                                }}
                                                            >
                                                                <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t">
                                    <p className="text-sm text-muted-foreground">
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredDiscounts.length)} of {filteredDiscounts.length}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                        >
                                            Previous
                                        </Button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let pageNum: number;
                                                if (totalPages <= 5) {
                                                    pageNum = i + 1;
                                                } else if (currentPage <= 3) {
                                                    pageNum = i + 1;
                                                } else if (currentPage >= totalPages - 2) {
                                                    pageNum = totalPages - 4 + i;
                                                } else {
                                                    pageNum = currentPage - 2 + i;
                                                }
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={currentPage === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        className="w-8 h-8 p-0"
                                                        onClick={() => setCurrentPage(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Discount Dialog */}
            <DiscountDialog
                open={dialogOpen}
                onOpenChange={handleDialogClose}
                discount={selectedDiscount}
                currency={currency}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Discount</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete the discount code{" "}
                            <code className="font-mono bg-muted px-1 rounded">{discountToDelete?.code}</code>?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteDiscount}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? (
                                <>
                                    <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Bulk Delete Confirmation Dialog */}
            <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selectedIds.size} Discounts</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedIds.size} selected discount{selectedIds.size !== 1 ? "s" : ""}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? (
                                <>
                                    <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete All"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}