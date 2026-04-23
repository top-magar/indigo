"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
    ImageIcon,
    Upload,
    X,
} from "lucide-react";
import { useBulkActions, useUrlFilters, useConfirmDelete } from "@/hooks";
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
import { EntityListPage } from "@/components/dashboard/templates";
import { ImportDialog } from "./import";
import { deleteProduct, bulkDeleteProducts, bulkUpdateProductStatus, duplicateProduct, exportAllProducts } from "./actions";
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
import { StockBadge } from "./_components/helpers";

export interface ProductsListViewProps {
    products: ProductRow[];
    categories: Category[];
    stats: ProductsClientProps["stats"];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    currency: string;
    // Filter state
    searchValue: string;
    onSearchChange: (value: string) => void;
    getFilter: (key: string) => string | undefined;
    onFilterChange: (key: string, value: string | undefined) => void;
    onClearFilters: () => void;
    hasActiveFilters: boolean;
    isPending: boolean;
    // Bulk actions
    bulkActions: ReturnType<typeof useBulkActions>;
    // Callbacks
    onDelete: (productId: string, productName: string) => void;
    onBulkDelete: () => void;
    onBulkStatusUpdate: (status: "draft" | "active" | "archived") => void;
    onExport: () => void;
    onImportOpen: () => void;
    onRefresh: () => void;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onNavigate: (path: string) => void;
    // Import dialog
    importDialogOpen: boolean;
    onImportDialogChange: (open: boolean) => void;
}

// Stock badge component
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
    const bulkActions = useBulkActions();

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

    const handleBulkDelete = async () => {
        if (!confirm(`Delete ${bulkActions.selectedCount} products? This cannot be undone.`)) return;
        try {
            await bulkDeleteProducts(bulkActions.selectedArray);
            toast.success(`Deleted ${bulkActions.selectedCount} products`);
            bulkActions.reset();
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete products");
        }
    };

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

    const handleExport = async () => {
        try {
            const csvContent = await exportAllProducts();
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `products-${format(new Date(), "yyyy-MM-dd")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("All products exported");
        } catch { toast.error("Failed to export"); }
    };

    return (
        <ProductsListView
            products={products}
            categories={categories}
            stats={stats}
            totalCount={totalCount}
            currentPage={currentPage}
            pageSize={pageSize}
            currency={currency}
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            getFilter={getFilter}
            onFilterChange={setFilter}
            onClearFilters={clearAll}
            hasActiveFilters={hasActiveFilters}
            isPending={isPending}
            bulkActions={bulkActions}
            onDelete={handleDelete}
            onBulkDelete={handleBulkDelete}
            onBulkStatusUpdate={handleBulkStatusUpdate}
            onExport={handleExport}
            onImportOpen={() => setImportDialogOpen(true)}
            onRefresh={() => router.refresh()}
            onPageChange={(p) => setPage(p)}
            onPageSizeChange={(s) => setUrlPageSize(s)}
            onNavigate={(path) => router.push(path)}
            importDialogOpen={importDialogOpen}
            onImportDialogChange={setImportDialogOpen}
        />
    );
}

// Pure presentational view — no useRouter, no server actions
export function ProductsListView({
    products,
    categories,
    stats,
    totalCount,
    currentPage,
    pageSize,
    currency,
    searchValue,
    onSearchChange,
    getFilter,
    onFilterChange,
    onClearFilters,
    hasActiveFilters,
    isPending,
    bulkActions,
    onDelete,
    onBulkDelete,
    onBulkStatusUpdate,
    onExport,
    onImportOpen,
    onRefresh,
    onPageChange,
    onPageSizeChange,
    onNavigate,
    importDialogOpen,
    onImportDialogChange,
}: ProductsListViewProps) {

    // Filter options for inline selects
    const statusOptions: DataTableFilterOption[] = useMemo(() => [
        { value: "active", label: "Active", count: stats.active, color: "bg-success" },
        { value: "draft", label: "Draft", count: stats.draft, color: "bg-muted-foreground" },
        { value: "archived", label: "Archived", count: stats.archived, color: "bg-destructive" },
    ], [stats]);

    const stockOptions: DataTableFilterOption[] = useMemo(() => [
        { value: "in", label: "In Stock", color: "bg-success" },
        { value: "low", label: "Low Stock", count: stats.lowStock, color: "bg-warning" },
        { value: "out", label: "Out of Stock", count: stats.outOfStock, color: "bg-destructive" },
    ], [stats]);

    const categoryOptions: DataTableFilterOption[] = useMemo(() => 
        categories.filter(cat => cat.id).map(cat => ({ value: cat.id, label: cat.name })),
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

    const pageCount = Math.ceil(totalCount / pageSize);
    const productNodes = products.map(p => ({ id: p.id }));

    return (
        <EntityListPage
            title="Products"
        >

            {/* Toolbar */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full sm:max-w-sm">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                        />
                        <Input
                            aria-label="Search products" placeholder="Search products..."
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Inline Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Filter */}
                        <Select
                            value={getFilter("status") || "all"}
                            onValueChange={(value) => onFilterChange("status", value === "all" ? undefined : value)}
                        >
                            <SelectTrigger className="w-[140px]" aria-label="Filter by status">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                {statusOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">
                                            {opt.color && <span className={cn("size-2 rounded-full", opt.color)} />}
                                            {opt.label}
                                            {opt.count !== undefined && (
                                                <span className="text-muted-foreground">({opt.count})</span>
                                            )}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Stock Filter */}
                        <Select
                            value={getFilter("stock") || "all"}
                            onValueChange={(value) => onFilterChange("stock", value === "all" ? undefined : value)}
                        >
                            <SelectTrigger className="w-[140px]" aria-label="Filter by stock">
                                <SelectValue placeholder="Stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stock</SelectItem>
                                {stockOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        <span className="flex items-center gap-2">
                                            {opt.color && <span className={cn("size-2 rounded-full", opt.color)} />}
                                            {opt.label}
                                            {opt.count !== undefined && (
                                                <span className="text-muted-foreground">({opt.count})</span>
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
                                onValueChange={(value) => onFilterChange("category", value === "all" ? undefined : value)}
                            >
                                <SelectTrigger className="w-[160px]" aria-label="Filter by category">
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
                            <Button variant="ghost" onClick={onClearFilters}>
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                        <Button
                            variant="outline"
                            onClick={onExport}
                        >
                            <Download className="size-4" />
                            <span className="hidden sm:inline">Export</span>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onImportOpen()}
                        >
                            <Upload className="size-4" />
                            <span className="hidden sm:inline">Import</span>
                        </Button>
                        <Button asChild>
                            <Link href="/dashboard/products/new">
                                <Plus className="size-4" />
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
                                <span className="text-muted-foreground">{chip.label}:</span>
                                <span>{chip.displayValue}</span>
                                <Button
                                    variant="ghost"
                            size="icon-sm" aria-label="Remove filter"
                                    className="size-4 p-0 hover:bg-transparent"
                                    onClick={() => onFilterChange(chip.key, undefined)}
                                >
                                    <X className="size-3.5" />
                                </Button>
                            </Badge>
                        ))}
                        <Button
                            variant="ghost"
                            className="h-6 px-2 text-xs text-muted-foreground"
                            onClick={onClearFilters}
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
                    <Button variant="secondary" onClick={() => onBulkStatusUpdate("active")}>
                        Set Active
                    </Button>
                    <Button variant="secondary" onClick={() => onBulkStatusUpdate("draft")}>
                        Set Draft
                    </Button>
                    <Button variant="secondary" onClick={() => onBulkStatusUpdate("archived")}>
                        Archive
                    </Button>
                    <Button 
                        
                        variant="secondary" 
                        className="text-destructive hover:text-destructive"
                        onClick={onBulkDelete}
                    >
                        Delete
                    </Button>
                </StickyBulkActionsBar>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto">
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
                            <TableHead className="w-16 hidden sm:table-cell"></TableHead>
                            <TableHead className="whitespace-nowrap">Product</TableHead>
                            <TableHead className="hidden lg:table-cell whitespace-nowrap">Category</TableHead>
                            <TableHead className="whitespace-nowrap">Status</TableHead>
                            <TableHead className="hidden md:table-cell whitespace-nowrap">Stock</TableHead>
                            <TableHead className="text-right whitespace-nowrap">Price</TableHead>
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
                                        hint={!(searchValue || getFilter("status") || getFilter("stock") || getFilter("category"))
                                            ? "Press C to create a product"
                                            : undefined}
                                        action={searchValue || getFilter("status") || getFilter("stock") || getFilter("category") ? {
                                            label: "Clear Filters",
                                            onClick: () => onClearFilters(),
                                        } : {
                                            label: "Add Product",
                                            onClick: () => onNavigate("/dashboard/products/new"),
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => {
                                const status = productStatusConfig[product.status];
                                const isSelected = bulkActions.isSelected(product.id);
                                const hasImage = product.images?.length > 0 && product.images[0]?.url;

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
                                        <TableCell className="hidden sm:table-cell">
                                            {hasImage ? (
                                                <div className="relative size-10 overflow-hidden rounded-lg border bg-muted">
                                                    <Image
                                                        src={product.images[0].url}
                                                        alt={product.images[0].alt || product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex size-10 items-center justify-center rounded-lg border bg-muted">
                                                    <ImageIcon className="size-4 text-muted-foreground" />
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
                                                    <p className="text-xs text-muted-foreground font-mono">
                                                        SKU: {product.sku}
                                                    </p>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-muted-foreground">
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
                                        <TableCell className="text-right whitespace-nowrap">
                                            <div>
                                                <span className="font-semibold tabular-nums">
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
                            size="icon-sm" aria-label="More actions"
                                                        className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreHorizontal className="size-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/products/${product.id}`}>
                                                            <Pencil className="size-3.5" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={async () => {
                                                        try {
                                                            const { id } = await duplicateProduct(product.id);
                                                            toast.success("Product duplicated");
                                                            window.location.href = `/dashboard/products/${id}`;
                                                        } catch { toast.error("Failed to duplicate"); }
                                                    }}>
                                                        <Copy className="size-3.5" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/store/products/${product.slug}`} target="_blank">
                                                            <Eye className="size-3.5" />
                                                            View in Store
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => onDelete(product.id, product.name)}
                                                    >
                                                        <Trash2 className="size-3.5" />
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
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
                <DataTablePagination
                    pageIndex={currentPage - 1}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalItems={totalCount}
                    onPageChange={(page) => onPageChange(page + 1)}
                    onPageSizeChange={(size) => onPageSizeChange(size)}
                />
            )}

            <ImportDialog
                open={importDialogOpen}
                onOpenChange={onImportDialogChange}
                categories={categories}
            />
        </EntityListPage>
    );
}
