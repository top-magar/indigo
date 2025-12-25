"use client";

import { useState, useCallback, useTransition } from "react";
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
    Cancel01Icon,
    Money01Icon,
    Image01Icon,
    Archive01Icon,
    Upload01Icon,
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
    
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [searchValue, setSearchValue] = useState(filters.search || "");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
        if (selectedProducts.size === products.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(products.map(p => p.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedProducts);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedProducts(newSelected);
    };

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
            await bulkDeleteProducts(Array.from(selectedProducts));
            toast.success(`Deleted ${selectedProducts.size} products`);
            setSelectedProducts(new Set());
            router.refresh();
        } catch (error) {
            toast.error("Failed to delete products");
        }
    };

    // Handle bulk status update
    const handleBulkStatusUpdate = async (status: "draft" | "active" | "archived") => {
        try {
            await bulkUpdateProductStatus(Array.from(selectedProducts), status);
            toast.success(`Updated ${selectedProducts.size} products to ${status}`);
            setSelectedProducts(new Set());
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

    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Products</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                                <p className="text-xs text-muted-foreground">In catalog</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center">
                                <HugeiconsIcon icon={PackageIcon} className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</p>
                                <p className="text-2xl font-bold text-chart-2">{stats.active}</p>
                                <p className="text-xs text-muted-foreground">Published</p>
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
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Low Stock</p>
                                <p className="text-2xl font-bold text-chart-4">{stats.lowStock + stats.outOfStock}</p>
                                <p className="text-xs text-muted-foreground">{stats.outOfStock} out of stock</p>
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
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Stock Value</p>
                                <p className="text-2xl font-bold text-primary">{formatCurrency(stats.totalValue, currency)}</p>
                                <p className="text-xs text-muted-foreground">Total inventory</p>
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
                            placeholder="Search products..."
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
                            <SelectTrigger className="w-[130px] bg-background">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="active">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-chart-2" />
                                        Active ({stats.active})
                                    </span>
                                </SelectItem>
                                <SelectItem value="draft">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                                        Draft ({stats.draft})
                                    </span>
                                </SelectItem>
                                <SelectItem value="archived">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-destructive" />
                                        Archived ({stats.archived})
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        <Select
                            value={filters.stock || "all"}
                            onValueChange={(value) => updateFilters({ stock: value === "all" ? undefined : value })}
                        >
                            <SelectTrigger className="w-[130px] bg-background">
                                <SelectValue placeholder="Stock" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stock</SelectItem>
                                <SelectItem value="in">In Stock</SelectItem>
                                <SelectItem value="low">Low Stock ({stats.lowStock})</SelectItem>
                                <SelectItem value="out">Out of Stock ({stats.outOfStock})</SelectItem>
                            </SelectContent>
                        </Select>

                        {categories.length > 0 && (
                            <Select
                                value={filters.category || "all"}
                                onValueChange={(value) => updateFilters({ category: value === "all" ? undefined : value })}
                            >
                                <SelectTrigger className="w-[150px] bg-background">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}

                        {/* Clear Filters */}
                        {(filters.status || filters.stock || filters.category || filters.search) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSearchValue("");
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
                        <Button asChild className="gap-2">
                            <Link href="/dashboard/products/new">
                                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
                                Add Product
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedProducts.size > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">{selectedProducts.size} selected</span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("active")}>
                                Set Active
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("draft")}>
                                Set Draft
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleBulkStatusUpdate("archived")}>
                                Archive
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-destructive hover:text-destructive"
                                onClick={handleBulkDelete}
                            >
                                Delete
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedProducts(new Set())}>
                                Clear
                            </Button>
                        </div>
                    </div>
                )}
            </div>


            {/* Products Table */}
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedProducts.size === products.length && products.length > 0}
                                    onCheckedChange={toggleSelectAll}
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
                                const isSelected = selectedProducts.has(product.id);
                                const hasImage = product.images && product.images.length > 0;

                                return (
                                    <TableRow 
                                        key={product.id} 
                                        className={cn("group", isSelected && "bg-muted/50")}
                                    >
                                        <TableCell>
                                            <Checkbox
                                                checked={isSelected}
                                                onCheckedChange={() => toggleSelect(product.id)}
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
                                                        <Link href={`/store/preview/products/${product.slug}`} target="_blank">
                                                            <HugeiconsIcon icon={ViewIcon} className="w-4 h-4 mr-2" />
                                                            Preview
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    {product.status !== "active" && (
                                                        <DropdownMenuItem
                                                            onClick={async () => {
                                                                await updateProductStatus(product.id, "active");
                                                                router.refresh();
                                                                toast.success("Product published");
                                                            }}
                                                        >
                                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
                                                            Publish
                                                        </DropdownMenuItem>
                                                    )}
                                                    {product.status !== "archived" && (
                                                        <DropdownMenuItem
                                                            onClick={async () => {
                                                                await updateProductStatus(product.id, "archived");
                                                                router.refresh();
                                                                toast.success("Product archived");
                                                            }}
                                                        >
                                                            <HugeiconsIcon icon={Archive01Icon} className="w-4 h-4 mr-2" />
                                                            Archive
                                                        </DropdownMenuItem>
                                                    )}
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
            {products.length > 0 && (
                <DataTablePagination
                    pageIndex={currentPage}
                    pageSize={pageSize}
                    pageCount={pageCount}
                    totalItems={totalCount}
                    selectedCount={selectedProducts.size}
                    onPageChange={(page) => updateFilters({ page: String(page + 1) })}
                    onPageSizeChange={(size) => updateFilters({ per_page: String(size), page: "1" })}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. The product will be permanently removed from your catalog.
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
        </div>
    );
}
