"use client";

import { useState, useCallback, useTransition, useEffect, useMemo } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    PackageIcon,
    Add01Icon,
    Search01Icon,
    Download01Icon,
    RefreshIcon,
    MoreHorizontalIcon,
    PencilEdit01Icon,
    Delete02Icon,
    Copy01Icon,
    ViewIcon,
    CheckmarkCircle02Icon,
    Alert02Icon,
    Money01Icon,
    Image01Icon,
    Archive01Icon,
    Upload01Icon,
} from "@hugeicons/core-free-icons";
import { useBulkActions, useDebouncedCallback } from "@/hooks";
import { StickyBulkActionsBar, FilterPopover } from "@/components/dashboard";
import type { FilterConfig } from "@/components/dashboard";
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
import { DataTablePagination } from "@/components/dashboard/data-table/pagination";
import { ImportDialog } from "./import";
import { deleteProduct, updateProductStatus, bulkDeleteProducts, bulkUpdateProductStatus } from "./actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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

// Status configuration
const statusConfig = {
    draft: { color: "text-muted-foreground", bgColor: "bg-muted", label: "Draft", icon: PencilEdit01Icon },
    active: { color: "text-chart-2", bgColor: "bg-chart-2/10", label: "Active", icon: CheckmarkCircle02Icon },
    archived: { color: "text-destructive", bgColor: "bg-destructive/10", label: "Archived", icon: Archive01Icon },
};

// Format currency
function formatCurrency(value: number, currency: string) {
    return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

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
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    
    const [searchValue, setSearchValue] = useState(filters.search || "");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [importDialogOpen, setImportDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Use Saleor-inspired bulk actions hook
    const bulkActions = useBulkActions();

    // Filter configuration for FilterPopover
    const filterConfig: FilterConfig[] = useMemo(() => {
        const configs: FilterConfig[] = [
            {
                key: "status",
                label: "Status",
                type: "select",
                options: [
                    { value: "active", label: "Active", count: stats.active, color: "bg-chart-2" },
                    { value: "draft", label: "Draft", count: stats.draft, color: "bg-muted-foreground" },
                    { value: "archived", label: "Archived", count: stats.archived, color: "bg-destructive" },
                ],
            },
            {
                key: "stock",
                label: "Stock",
                type: "select",
                options: [
                    { value: "in", label: "In Stock", color: "bg-chart-2" },
                    { value: "low", label: "Low Stock", count: stats.lowStock, color: "bg-chart-4" },
                    { value: "out", label: "Out of Stock", count: stats.outOfStock, color: "bg-destructive" },
                ],
            },
        ];

        // Add category filter if categories exist
        if (categories.length > 0) {
            configs.push({
                key: "category",
                label: "Category",
                type: "select",
                options: categories.map(cat => ({
                    value: cat.id,
                    label: cat.name,
                })),
            });
        }

        return configs;
    }, [stats, categories]);

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

        if (!updates.page) {
            params.delete("page");
        }

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    }, [pathname, router, searchParams]);

    // Use Saleor-inspired debounced callback for search
    const debouncedSearch = useDebouncedCallback((value: string) => {
        updateFilters({ search: value || undefined });
    }, 300);

    // Handle search with debounce
    const handleSearch = useCallback((value: string) => {
        setSearchValue(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    // Handle filter change from FilterPopover
    const handleFilterChange = useCallback((key: string, value: string | undefined) => {
        updateFilters({ [key]: value });
    }, [updateFilters]);

    // Clear all filters
    const handleClearAll = useCallback(() => {
        setSearchValue("");
        router.push(pathname);
    }, [pathname, router]);

    // Clear bulk selection when products change (e.g., page change)
    useEffect(() => {
        bulkActions.reset();
    }, [currentPage]);

    // Handle single delete
    const handleDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        
        try {
            const formData = new FormData();
            formData.set("productId", productToDelete);
            await deleteProduct(formData);
            toast.success("Product deleted");
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete product");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setProductToDelete(null);
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
                                <p className="text-label text-muted-foreground">Total Products</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-caption text-muted-foreground">In catalog</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <HugeiconsIcon icon={PackageIcon} className="w-5 h-5 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Active</p>
                                <p className="text-2xl font-bold text-chart-2">{stats.active}</p>
                                <p className="text-caption text-muted-foreground">Published</p>
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
                                <p className="text-label text-muted-foreground">Low Stock</p>
                                <p className="text-2xl font-bold text-chart-4">{stats.lowStock + stats.outOfStock}</p>
                                <p className="text-caption text-muted-foreground">{stats.outOfStock} out of stock</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Alert02Icon} className="w-5 h-5 text-chart-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Stock Value</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalValue, currency)}</p>
                                <p className="text-caption text-muted-foreground">Total inventory</p>
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
                            placeholder="Search products..."
                            value={searchValue}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>

                    {/* Filter Popover */}
                    <FilterPopover
                        filters={filterConfig}
                        values={{ status: filters.status, stock: filters.stock, category: filters.category }}
                        onFilterChange={handleFilterChange}
                        onClearAll={handleClearAll}
                    />

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
                            size="sm"
                            onClick={() => setImportDialogOpen(true)}
                            className="gap-2"
                        >
                            <HugeiconsIcon icon={Upload01Icon} className="w-4 h-4" />
                            <span className="hidden sm:inline">Import</span>
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
                        <Button asChild className="gap-2">
                            <Link href="/dashboard/products/new">
                                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                </div>

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
            <Card>
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
                                        icon={PackageIcon}
                                        title={filters.search || filters.status || filters.stock || filters.category
                                            ? "No products match your filters"
                                            : "No products yet"}
                                        description={filters.search || filters.status || filters.stock || filters.category
                                            ? "Try adjusting your search or filters"
                                            : "Add your first product to start selling"}
                                        action={filters.search || filters.status || filters.stock || filters.category ? {
                                            label: "Clear Filters",
                                            onClick: () => router.push(pathname),
                                        } : {
                                            label: "Add Product",
                                            onClick: () => router.push("/dashboard/products/new"),
                                        }}
                                    />
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map((product) => {
                                const status = statusConfig[product.status];
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
                                                <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                                                    <HugeiconsIcon icon={Image01Icon} className="h-5 w-5 text-muted-foreground" />
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
                                                        <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/products/${product.id}`}>
                                                            <HugeiconsIcon icon={PencilEdit01Icon} className="w-4 h-4 mr-2" />
                                                            Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        <HugeiconsIcon icon={Copy01Icon} className="w-4 h-4 mr-2" />
                                                        Duplicate
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/store/products/${product.slug}`} target="_blank">
                                                            <HugeiconsIcon icon={ViewIcon} className="w-4 h-4 mr-2" />
                                                            View in Store
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            setProductToDelete(product.id);
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
                    onPageChange={(page) => updateFilters({ page: String(page + 1) })}
                    onPageSizeChange={(size) => updateFilters({ pageSize: String(size) })}
                />
            )}

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this product? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Import Dialog */}
            <ImportDialog
                open={importDialogOpen}
                onOpenChange={setImportDialogOpen}
                categories={categories}
            />
        </div>
    );
}
