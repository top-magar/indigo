"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useUrlFilters } from "@/shared/hooks";
import { format } from "date-fns";
import {
    Package,
    Search,
    Download,
    Upload,
    RefreshCw,
    MoreHorizontal,
    Pencil,
    Plus,
    Minus,
    AlertTriangle,
    CheckCircle,
    XCircle,
    DollarSign,
    Image as ImageIcon,
    Barcode,
    Clock,
    ArrowUp,
    ArrowDown,
    Filter,
    Settings,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
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
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import { bulkAdjustStock, exportInventory } from "./actions";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/shared/utils";
import type { InventoryProduct, StockMovement } from "./actions";

interface Category {
    id: string;
    name: string;
}

interface InventoryStats {
    totalProducts: number;
    totalUnits: number;
    totalValue: number;
    costValue: number;
    lowStockCount: number;
    outOfStockCount: number;
    healthyStockCount: number;
}

interface InventoryClientProps {
    products: InventoryProduct[];
    categories: Category[];
    stats: InventoryStats;
    recentMovements: StockMovement[];
    totalCount: number;
    currentPage: number;
    pageSize: number;
    currency: string;
    filters: {
        stock?: string;
        category?: string;
        search?: string;
    };
}

// Stock level indicator
function StockLevelIndicator({ quantity, reorderPoint }: { quantity: number; reorderPoint: number }) {
    const percentage = reorderPoint > 0 ? Math.min(100, (quantity / (reorderPoint * 3)) * 100) : 100;
    
    let color = "bg-chart-2";
    let status = "Healthy";
    
    if (quantity === 0) {
        color = "bg-destructive";
        status = "Out of Stock";
    } else if (quantity <= reorderPoint) {
        color = "bg-chart-4";
        status = "Low Stock";
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="w-full max-w-[100px]">
                        <Progress value={percentage} className={cn("h-2", `[&>div]:${color}`)} />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{status}: {quantity} units</p>
                    {reorderPoint > 0 && <p className="text-xs text-muted-foreground">Reorder at: {reorderPoint}</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Stock badge component
function StockBadge({ quantity, reorderPoint = 10 }: { quantity: number; reorderPoint?: number }) {
    if (quantity === 0) {
        return (
            <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Out of Stock
            </Badge>
        );
    }
    if (quantity <= reorderPoint) {
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


export function InventoryClient({
    products,
    categories,
    stats,
    recentMovements,
    totalCount,
    currentPage,
    pageSize,
    currency,
    filters,
}: InventoryClientProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isActionPending, startTransition] = useTransition();
    
    // URL-based filter state management
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
    } = useUrlFilters({ defaultPageSize: pageSize });
    
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
    const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
    const [bulkAdjustDialogOpen, setBulkAdjustDialogOpen] = useState(false);
    const [bulkAdjustType, setBulkAdjustType] = useState<"add" | "remove">("add");
    const [bulkQuantity, setBulkQuantity] = useState("");
    const [bulkReason, setBulkReason] = useState("");
    const [localProducts, setLocalProducts] = useState(products);

    // Update local products when props change
    useMemo(() => {
        setLocalProducts(products);
    }, [products]);

    // Handle bulk selection
    const toggleSelectAll = () => {
        if (selectedProducts.size === localProducts.length) {
            setSelectedProducts(new Set());
        } else {
            setSelectedProducts(new Set(localProducts.map(p => p.id)));
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

    // Handle stock adjustment success
    const handleAdjustSuccess = (productId: string, newQuantity: number) => {
        setLocalProducts(prev => prev.map(p => 
            p.id === productId ? { ...p, quantity: newQuantity } : p
        ));
        router.refresh();
    };

    // Handle bulk adjustment
    const handleBulkAdjust = async () => {
        const qty = parseInt(bulkQuantity);
        if (isNaN(qty) || qty <= 0) {
            toast.error("Please enter a valid quantity");
            return;
        }

        if (!bulkReason) {
            toast.error("Please enter a reason");
            return;
        }

        startTransition(async () => {
            const adjustments = Array.from(selectedProducts).map(id => ({
                productId: id,
                quantity: qty,
            }));

            const result = await bulkAdjustStock(adjustments, bulkAdjustType, bulkReason);
            
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(`Updated ${result.successCount} products`);
                setSelectedProducts(new Set());
                setBulkAdjustDialogOpen(false);
                setBulkQuantity("");
                setBulkReason("");
                router.refresh();
            }
        });
    };

    // Export inventory
    const handleExport = async () => {
        startTransition(async () => {
            const result = await exportInventory();
            
            if (result.error) {
                toast.error(result.error);
                return;
            }

            const blob = new Blob([result.csv!], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `inventory-${format(new Date(), "yyyy-MM-dd")}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Inventory exported successfully");
        });
    };

    const pageCount = Math.ceil(totalCount / pageSize);
    const stockHealthPercentage = stats.totalProducts > 0 
        ? Math.round((stats.healthyStockCount / stats.totalProducts) * 100) 
        : 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Inventory</h1>
                    <p className="text-muted-foreground">
                        Track stock levels, manage adjustments, and monitor inventory health
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport} disabled={isPending}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Total SKUs</p>
                                <p className="text-2xl font-semibold">{stats.totalProducts}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <Package className="w-5 h-5 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Total Units</p>
                                <p className="text-2xl font-semibold">{stats.totalUnits.toLocaleString()}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <Barcode className="w-5 h-5 text-chart-1" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Stock Value</p>
                                <p className="text-2xl font-semibold">{formatCurrency(stats.totalValue, currency)}</p>
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
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Healthy</p>
                                <p className="text-2xl font-semibold text-chart-2">{stats.healthyStockCount}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-chart-2" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Low Stock</p>
                                <p className="text-2xl font-semibold text-chart-4">{stats.lowStockCount}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5 text-chart-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-label text-muted-foreground">Out of Stock</p>
                                <p className="text-2xl font-semibold text-destructive">{stats.outOfStockCount}</p>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-destructive" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Stock Health Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">Stock Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Overall Health</span>
                                <span className="text-sm font-medium">{stockHealthPercentage}%</span>
                            </div>
                            <Progress value={stockHealthPercentage} className="h-3" />
                            <div className="grid grid-cols-3 gap-4 pt-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-chart-2" />
                                    <span className="text-sm">Healthy ({stats.healthyStockCount})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-chart-4" />
                                    <span className="text-sm">Low ({stats.lowStockCount})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-full bg-destructive" />
                                    <span className="text-sm">Out ({stats.outOfStockCount})</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentMovements.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                        ) : (
                            <div className="space-y-3">
                                {recentMovements.slice(0, 5).map((movement) => (
                                    <div key={movement.id} className="flex items-center gap-3">
                                        <div className={cn(
                                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                                            movement.quantity_change > 0 ? "bg-chart-2/10" : "bg-destructive/10"
                                        )}>
                                            {movement.quantity_change > 0 ? (
                                                <ArrowUp className={cn("w-4 h-4", "text-chart-2")} />
                                            ) : (
                                                <ArrowDown className={cn("w-4 h-4", "text-destructive")} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{movement.product_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {movement.quantity_change > 0 ? "+" : ""}{movement.quantity_change} • {movement.reason}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {format(new Date(movement.created_at), "MMM d")}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 w-full sm:max-w-sm">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                        />
                        <Input
                            placeholder="Search by name, SKU, or barcode..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-9 bg-background"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Select
                            value={filters.stock || "all"}
                            onValueChange={(value) => setFilter("stock", value === "all" ? undefined : value)}
                        >
                            <SelectTrigger className="w-[140px] bg-background">
                                <SelectValue placeholder="Stock Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Levels</SelectItem>
                                <SelectItem value="healthy">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-chart-2" />
                                        Healthy ({stats.healthyStockCount})
                                    </span>
                                </SelectItem>
                                <SelectItem value="low">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-chart-4" />
                                        Low Stock ({stats.lowStockCount})
                                    </span>
                                </SelectItem>
                                <SelectItem value="out">
                                    <span className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-destructive" />
                                        Out of Stock ({stats.outOfStockCount})
                                    </span>
                                </SelectItem>
                            </SelectContent>
                        </Select>

                        {categories.length > 0 && (
                            <Select
                                value={filters.category || "all"}
                                onValueChange={(value) => setFilter("category", value === "all" ? undefined : value)}
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
                        {(filters.stock || filters.category || filters.search) && (
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

                    {/* Refresh */}
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 ml-auto"
                        onClick={() => router.refresh()}
                        disabled={isPending}
                    >
                        <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
                    </Button>
                </div>

                {/* Bulk Actions */}
                {selectedProducts.size > 0 && (
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <span className="text-sm font-medium">{selectedProducts.size} selected</span>
                        <div className="flex items-center gap-2">
                            <Button 
                                size="sm" 
                                variant="outline"
                                className="gap-1"
                                onClick={() => {
                                    setBulkAdjustType("add");
                                    setBulkAdjustDialogOpen(true);
                                }}
                            >
                                <Plus className="w-3 h-3" />
                                Add Stock
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline"
                                className="gap-1"
                                onClick={() => {
                                    setBulkAdjustType("remove");
                                    setBulkAdjustDialogOpen(true);
                                }}
                            >
                                <Minus className="w-3 h-3" />
                                Remove Stock
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setSelectedProducts(new Set())}>
                                Clear
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Inventory Table */}
            <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedProducts.size === localProducts.length && localProducts.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                    aria-label="Select all"
                                />
                            </TableHead>
                            <TableHead className="w-14"></TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead className="hidden lg:table-cell">SKU</TableHead>
                            <TableHead className="text-center">Stock</TableHead>
                            <TableHead className="hidden md:table-cell">Level</TableHead>
                            <TableHead className="hidden lg:table-cell text-right">Value</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {localProducts.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={8} className="h-[300px]">
                                    <div className="flex flex-col items-center justify-center text-center py-12">
                                        <div className="rounded-full bg-muted flex items-center justify-center mb-4 h-12 w-12">
                                            <Package className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                        <h3 className="font-semibold text-foreground text-base">
                                            {filters.search || filters.stock || filters.category
                                                ? "No products match your filters"
                                                : "No products in inventory"}
                                        </h3>
                                        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                                            {filters.search || filters.stock || filters.category
                                                ? "Try adjusting your search or filters"
                                                : "Add products to start tracking inventory"}
                                        </p>
                                        {(filters.search || filters.stock || filters.category) && (
                                            <div className="mt-4">
                                                <Button size="sm" onClick={() => router.push(pathname)}>
                                                    Clear Filters
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            localProducts.map((product) => {
                                const isSelected = selectedProducts.has(product.id);
                                const hasImage = product.images && product.images.length > 0;
                                const stockValue = product.quantity * (product.cost_price || product.price);

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
                                                <div className="relative h-10 w-10 overflow-hidden rounded-lg border bg-muted">
                                                    <Image
                                                        src={product.images[0].url}
                                                        alt={product.images[0].alt || product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
                                                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
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
                                                <p className="text-xs text-muted-foreground">
                                                    {product.category_name || "Uncategorized"}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {product.sku ? (
                                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                                                    {product.sku}
                                                </code>
                                            ) : (
                                                <span className="text-muted-foreground">—</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={cn(
                                                    "text-lg font-bold",
                                                    product.quantity === 0 && "text-destructive",
                                                    product.quantity > 0 && product.quantity <= product.reorder_point && "text-chart-4"
                                                )}>
                                                    {product.quantity}
                                                </span>
                                                <StockBadge quantity={product.quantity} reorderPoint={product.reorder_point} />
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <StockLevelIndicator quantity={product.quantity} reorderPoint={product.reorder_point} />
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-right">
                                            <span className="font-medium">{formatCurrency(stockValue, currency)}</span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon-sm">
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setSelectedProduct(product);
                                                        setAdjustDialogOpen(true);
                                                    }}>
                                                        <Pencil className="w-4 h-4 mr-2" />
                                                        Adjust Stock
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/products/${product.id}`}>
                                                            <Settings className="w-4 h-4 mr-2" />
                                                            Edit Product
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/dashboard/inventory/history/${product.id}`}>
                                                            <Clock className="w-4 h-4 mr-2" />
                                                            View History
                                                        </Link>
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
                    pageIndex={currentPage}
                    pageCount={pageCount}
                    pageSize={pageSize}
                    totalItems={totalCount}
                    onPageChange={(page) => setPage(page + 1)}
                    onPageSizeChange={(size) => setPageSize(size)}
                />
            )}

            {/* Stock Adjustment Dialog */}
            <StockAdjustmentDialog
                open={adjustDialogOpen}
                onOpenChange={setAdjustDialogOpen}
                product={selectedProduct}
                onSuccess={handleAdjustSuccess}
            />

            {/* Bulk Adjustment Dialog */}
            <AlertDialog open={bulkAdjustDialogOpen} onOpenChange={setBulkAdjustDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {bulkAdjustType === "add" ? "Add Stock" : "Remove Stock"} - {selectedProducts.size} Products
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will {bulkAdjustType === "add" ? "add" : "remove"} the specified quantity {bulkAdjustType === "add" ? "to" : "from"} all selected products.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity</label>
                            <Input
                                type="number"
                                min="1"
                                value={bulkQuantity}
                                onChange={(e) => setBulkQuantity(e.target.value)}
                                placeholder="Enter quantity"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Reason</label>
                            <Input
                                value={bulkReason}
                                onChange={(e) => setBulkReason(e.target.value)}
                                placeholder="e.g., Received shipment, Inventory count"
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkAdjust}
                            disabled={!bulkQuantity || !bulkReason || isPending}
                            className={cn(
                                bulkAdjustType === "add" && "bg-chart-2 hover:bg-chart-2/90",
                                bulkAdjustType === "remove" && "bg-destructive hover:bg-destructive/90"
                            )}
                        >
                            {isPending ? "Updating..." : bulkAdjustType === "add" ? "Add Stock" : "Remove Stock"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}