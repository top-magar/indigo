"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import {
    Package,
    Plus,
    Search,
    Download,
    RefreshCw,
    MoreHorizontal,
    Pencil,
    Trash2,
    Copy,
    Eye,
    CheckCircle,
    AlertTriangle,
    DollarSign,
    ImageIcon,
    Upload,
    X,
} from "lucide-react";
import { useBulkActions, useUrlFilters, useConfirmDelete } from "@/shared/hooks";
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { DataTablePagination } from "@/components/dashboard/data-table/pagination";
import { ImportDialog } from "./import";
import { deleteProduct, bulkDeleteProducts, bulkUpdateProductStatus } from "./actions";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/shared/utils";
import { EmptyState } from "@/components/ui/empty-state";

// Types
interface ProductRow {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    cost_price: number | null;
    sku: string | null;
    barcode: string | null;
    quantity: number;
    track_quantity: boolean;
    status: "draft" | "active" | "archived";
    images: { url: string; alt: string }[];
    category_id: string | null;
    category_name: string | null;
    created_at: string;
    updated_at: string;
}

interface Category {
    id: string;
    name: string;
}

interface ProductsClientProps {
    products: ProductRow[];
    categories: Category[];
    stats: {
        total: number;
        active: number;
        draft: number;
        archived: number;
        lowStock: number;
        outOfStock: number;
        totalValue: number;
    };
    totalCount: number;
    currentPage: number;
    pageSize: number;
    currency: string;
    filters: {
        status?: string;
        stock?: string;
        category?: string;
        search?: string;
    };
}

// Import centralized status configuration
import { productStatusConfig } from "@/config/status";

// Stock badge component
function StockBadge({ quantity }: { quantity: number }) {
    if (quantity === 0) {
        return (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Out of Stock
            </Badge>
        );
    }
    if (quantity <= 10) {
        return (
            <Badge variant="secondary" className="bg-chart-4/10 text-chart-4 border-0 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-chart-4" />
                Low ({quantity})
            </Badge>
        );
    }
    return (
        <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-chart-2" />
            In Stock ({quantity})
        </Badge>
    );
}


export function ProductsClient({
    products,
    categories,
    stats,
    totalCount,
    currentPage,
    pageSize,
    currency,
    filters,
}: ProductsClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    
    // Use the useUrlFilters hook for URL state management
    const {
        searchValue,
        setSearchValue,
        setFilter,
        clearAll,
        hasActiveFilters,
        page,
        setPage,
        setPageSize: setUrlPageSize,
        isPending,
        getFilter,
    } = useUrlFilters({ defaultPageSize: pageSize });
    
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const confirmDelete = useConfirmDelete();

    // Use Saleor-inspired bulk actions hook
    const bulkActions = useBulkActions();

    // Filter options for inline selects
    const statusOptions: DataTableFilterOption[] = useMemo(() => [
        { value: "active", label: "Active", count: stats.active, color: "bg-chart-2" },
        { value: "draft", label: "Draft", count: stats.draft, color: "bg-muted-foreground" },
        { value: "archived", label: "Archived", count: stats.archived, color: "bg-destructive" },
    ], [stats]);

    const stockOptions: DataTableFilterOption[] = useMemo(() => [
        { value: "in", label: "In Stock", color: "bg-chart-2" },
        { value: "low", label: "Low Stock", count: stats.lowStock, color: "bg-chart-4" },
        { value: "out", label: "Out of Stock", count: stats.outOfStock, color: "bg-destructive" },
    ], [stats]);

    const categoryOptions: DataTableFilterOption[] = useMemo(() => 
        categories.map(cat => ({ value: cat.id, label: cat.name })),
    [categories]);

    // Calculate active filter chips
    const activeFilterChips = useMemo(() => {
        const chips: { key: string; label: string; displayValue: string }[] = [];
        
        const statusFilter = getFilter("status");
        const stockFilter = getFilter("stock");
        const categoryFilter = getFilter("category");
        
        if (statusFilter) {
            const option = statusOptions.find(o => o.value === statusFilter);
            chips.push({ key: "status", label: "Status", displayValue: option?.label || statusFilter });
        }
        if (stockFilter) {
            const option = stockOptions.find(o => o.value === stockFilter);
            chips.push({ key: "stock", label: "Stock", displayValue: option?.label || stockFilter });
        }
        if (categoryFilter) {
            const option = categoryOptions.find(o => o.value === categoryFilter);
            chips.push({ key: "category", label: "Category", displayValue: option?.label || categoryFilter });
        }
        
        return chips;
    }, [getFilter, statusOptions, stockOptions, categoryOptions]);

    // Clear bulk selection when products change (e.g., page change)
    useEffect(() => {
        bulkActions.reset();
    }, [currentPage]);

    // Handle single delete
    const handleDelete = async (productId: string, productName: string) => {
        const confirmed = await confirmDelete(productName, "product");
        if (!confirmed) return;
        
        setIsDeleting(true);
        try {
            const formData = new FormData();
            formData.set("productId", productId);
            await deleteProduct(formData);
            toast.success("Product deleted");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete product");
        } finally {
            setIsDeleting(false);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = async () => {
        try {
            await bulkDeleteProducts(bulkActions.selectedArray);
            toast.success(`Deleted ${bulkActions.selectedCount} products`);
            bulkActions.reset();
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete products");
        }
    };

    // Handle bulk status update
    const handleBulkStatusUpdate = async (status: "draft" | "active" | "archived") => {
        try {
            await bulkUpdateProductStatus(bulkActions.selectedArray, status);
            toast.success(`Updated ${bulkActions.selectedCount} products to ${status}`);
            bulkActions.reset();
            router.refresh();
        } catch (error) {
            toast.error("Failed to update products");
        }
    };

    // Export products
    const handleExport = () => {
        const csvContent = [
            ["Name", "SKU", "Price", "Stock", "Status", "Category"].join(","),
            ...products.map(p => [
                `"${p.name}"`,
                p.sku || "",
                p.price,
                p.quantity,
                p.status,
                p.category_name || "Uncategorized",
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `products-${format(new Date(), "yyyy-MM-dd")}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Products exported successfully");
    };

    const pageCount = Math.ceil(totalCount / pageSize);
    const productNodes = products.map(p => ({ id: p.id }));

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-[var(--ds-gray-600)]">Total Products</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-caption text-[var(--ds-gray-600)]">In catalog</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-[var(--ds-blue-100)] flex items-center justify-center">
                                <Package className="w-5 h-5 text-[var(--ds-blue-700)]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-[var(--ds-gray-600)]">Active</p>
                                <p className="text-2xl font-bold text-[var(--ds-green-700)]">{stats.active}</p>
                                <p className="text-caption text-[var(--ds-gray-600)]">Published</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-[var(--ds-green-100)] flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-[var(--ds-green-700)]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-[var(--ds-gray-600)]">Low Stock</p>
                                <p className="text-2xl font-bold text-[var(--ds-amber-700)]">{stats.lowStock + stats.outOfStock}</p>
                                <p className="text-caption text-[var(--ds-gray-600)]">{stats.outOfStock} out of stock</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-[var(--ds-amber-100)] flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-[var(--ds-amber-700)]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-[var(--ds-gray-600)]">Stock Value</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalValue, currency)}</p>
                                <p className="text-caption text-[var(--ds-gray-600)]">Total inventory</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-[var(--ds-green-100)] flex items-center justify-center">
                                <DollarSign className="w-5 h-5 text-[var(--ds-green-700)]" />
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
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ds-gray-500)]"
                        />
                        <Input
                            placeholder="Search products..."
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
                                                <span className="text-[var(--ds-gray-600)]">({opt.count})</span>
                                            )}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Stock Filter */}
                        <Select
                            value={getFilter("stock") || "all"}
                            onValueChange={(value) => setFilter("stock", value === "all" ? undefined : value)}
                        >
                            <SelectTrigger className="w-[140px] bg-background">
                                <SelectValue placeholder="Stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stock</SelectItem>
                                {stockOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">
                                            {opt.color && <span className={cn("h-2 w-2 rounded-full", opt.color)} />}
                                            {opt.label}
                                            {opt.count !== undefined && (
                                                <span className="text-[var(--ds-gray-600)]">({opt.count})</span>
                                            )}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Category Filter */}
                        {categories.length > 0 && (
                            <Select
                                value={getFilter("category") || "all"}
                                onValueChange={(value) => setFilter("category", value === "all" ? undefined : value)}
                            >
                                <SelectTrigger className="w-[160px] bg-background">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categoryOptions.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

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
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setImportDialogOpen(true)}
                            className="gap-2"
                        >
                            <Upload className="w-4 h-4" />
                            <span className="hidden sm:inline">Import</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon-sm"
                            onClick={() => router.refresh()}
                            disabled={isPending}
                        >
                            <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
                        </Button>
                        <Button asChild size="sm" className="gap-2">
                            <Link href="/dashboard/products/new">
                                <Plus className="w-4 h-4" />
                                Add Product
                            </Link>
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
                                <span className="text-[var(--ds-gray-600)]">{chip.label}:</span>
                                <span>{chip.displayValue}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 p-0 hover:bg-transparent"
                                    onClick={() => setFilter(chip.key, undefined)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        ))}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-[var(--ds-gray-600)]"
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
                    itemLabel="product"
                >
                    <Button size="sm" variant="secondary" onClick={() => handleBulkStatusUpdate("active")}>
                        Set Active
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleBulkStatusUpdate("draft")}>
                        Set Draft
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleBulkStatusUpdate("archived")}>
                        Archive
                    </Button>
                    <Button 
                        size="sm" 
                        variant="secondary" 
                        className="text-destructive hover:text-destructive"
                        onClick={handleBulkDelete}
                    >
                        Delete
                    </Button>
                </StickyBulkActionsBar>
            </div>

            {/* Products Table */}
            <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={bulkActions.isAllSelected(productNodes)}
                                    onCheckedChange={() => bulkActions.toggleAll(productNodes)}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead className="w-16"></TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead className="hidden lg:table-cell">Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Stock</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={8} className="h-[300px]">
                                    <EmptyState
                                        icon={Package}
                                        title={searchValue || getFilter("status") || getFilter("stock") || getFilter("category")
                                            ? "No products match your filters"
                                            : "No products yet"}
                                        description={searchValue || getFilter("status") || getFilter("stock") || getFilter("category")
                                            ? "Try adjusting your search or filters"
                                            : "Add your first product to start selling"}
                                        action={searchValue || getFilter("status") || getFilter("stock") || getFilter("category") ? {
                                            label: "Clear Filters",
                                            onClick: () => clearAll(),
                                        } : {
                                            label: "Add Product",
                                            onClick: () => router.push("/dashboard/products/new"),
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => {
                                const status = productStatusConfig[product.status];
                                const isSelected = bulkActions.isSelected(product.id);
                                const hasImage = product.images && product.images.length > 0;

                                return (
                                    <TableRow 
                                        key={product.id} 
                                        className={cn("group", isSelected && "bg-muted/50")}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => bulkActions.toggle(product.id)}
                                                aria-label={`Select ${product.name}`}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {hasImage ? (
                                                <div className="relative h-12 w-12 overflow-hidden rounded-lg border bg-muted">
                                                    <Image
                                                        src={product.images[0].url}
                                                        alt={product.images[0].alt || product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-[var(--ds-gray-100)]">
                                                    <ImageIcon className="h-5 w-5 text-[var(--ds-gray-600)]" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="min-w-0">
                                                <Link 
                                                    href={`/dashboard/products/${product.id}`}
                                                    className="font-medium hover:text-primary transition-colors line-clamp-1"
                                                >
                                                    {product.name}
                                                </Link>
                                                {product.sku && (
                                                    <p className="text-xs text-[var(--ds-gray-600)] font-mono">
                                                        SKU: {product.sku}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-[var(--ds-gray-600)]">
                                            {product.category_name || "Uncategorized"}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant="secondary"
                                                className={cn("border-0 gap-1 font-medium", status.bgColor, status.color)}
                                            >
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <StockBadge quantity={product.quantity} />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div>
                                                <span className="font-semibold">
                                                    {formatCurrency(Number(product.price), currency)}
                                                </span>
                                                {product.compare_at_price && product.compare_at_price > product.price && (
                                                    <span className="text-xs text-muted-foreground line-through ml-2">
                                                        {formatCurrency(Number(product.compare_at_price), currency)}
                                                    </span>
                                                )}
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
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/products/${product.id}`}>
                                                            <Pencil className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <Copy className="w-4 h-4 mr-2" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/store/products/${product.slug}`} target="_blank">
                                                            <Eye className="w-4 h-4 mr-2" />
                                                            View in Store
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(product.id, product.name)}
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Delete
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

            {/* Pagination */}
            {pageCount > 1 && (
                <DataTablePagination
                    pageIndex={currentPage - 1}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalItems={totalCount}
                    onPageChange={(page) => setPage(page + 1)}
                    onPageSizeChange={(size) => setUrlPageSize(size)}
                />
            )}

            {/* Import Dialog */}
            <ImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                categories={categories}
            />
        </div>
    );
}
