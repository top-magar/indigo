"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Plus, Trash, Package, Search, MoreHorizontal, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/shared/utils";
import type { Collection, CollectionProduct } from "@/app/dashboard/collections/types";
import { unassignProductFromCollection, bulkUnassignProducts, reorderCollectionProducts } from "@/app/dashboard/collections/collection-actions";
import { AssignProductsDialog } from "./assign-products-dialog";

interface CollectionProductsCardProps {
    collection: Collection;
    onUpdate?: (data: Partial<Collection>) => void;
}

export function CollectionProductsCard({ collection, onUpdate }: CollectionProductsCardProps) {
    const [isPending, startTransition] = useTransition();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [products, setProducts] = useState<CollectionProduct[]>(collection.products || []);

    const filteredProducts = products.filter(p =>
        p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.productSku?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const toggleSelect = (productId: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredProducts.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredProducts.map(p => p.productId)));
        }
    };

    const handleRemoveProduct = (productId: string) => {
        startTransition(async () => {
            const result = await unassignProductFromCollection(collection.id, productId);
            if (result.success) {
                setProducts(prev => prev.filter(p => p.productId !== productId));
                toast.success("Product removed");
                onUpdate?.({ productCount: products.length - 1 });
            } else {
                toast.error(result.error || "Failed to remove product");
            }
        });
    };

    const handleBulkRemove = () => {
        startTransition(async () => {
            const result = await bulkUnassignProducts(collection.id, Array.from(selectedIds));
            if (result.success) {
                setProducts(prev => prev.filter(p => !selectedIds.has(p.productId)));
                toast.success(`Removed ${selectedIds.size} products`);
                setSelectedIds(new Set());
                onUpdate?.({ productCount: products.length - selectedIds.size });
            } else {
                toast.error(result.error || "Failed to remove products");
            }
        });
    };

    const handleMoveUp = (index: number) => {
        if (index === 0) return;
        const newProducts = [...products];
        [newProducts[index - 1], newProducts[index]] = [newProducts[index], newProducts[index - 1]];
        setProducts(newProducts);
        
        startTransition(async () => {
            const result = await reorderCollectionProducts(
                collection.id,
                newProducts.map(p => p.productId)
            );
            if (!result.success) {
                toast.error("Failed to reorder");
                setProducts(products);
            }
        });
    };

    const handleMoveDown = (index: number) => {
        if (index === products.length - 1) return;
        const newProducts = [...products];
        [newProducts[index], newProducts[index + 1]] = [newProducts[index + 1], newProducts[index]];
        setProducts(newProducts);
        
        startTransition(async () => {
            const result = await reorderCollectionProducts(
                collection.id,
                newProducts.map(p => p.productId)
            );
            if (!result.success) {
                toast.error("Failed to reorder");
                setProducts(products);
            }
        });
    };

    const handleProductsAssigned = (newProducts: CollectionProduct[]) => {
        setProducts(prev => [...prev, ...newProducts]);
        onUpdate?.({ productCount: products.length + newProducts.length });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        Products ({products.length})
                    </CardTitle>
                    <Button size="sm" onClick={() => setAssignDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Products
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search & Bulk Actions */}
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                            />
                            <Input
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        {selectedIds.size > 0 && (
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleBulkRemove}
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Trash className="h-4 w-4 mr-2" />
                                )}
                                Remove ({selectedIds.size})
                            </Button>
                        )}
                    </div>

                    {/* Products List */}
                    {filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Package className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "No products match your search" : "No products in this collection"}
                            </p>
                            {!searchQuery && (
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => setAssignDialogOpen(true)}
                                >
                                    Add Products
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="border rounded-xl divide-y">
                            {/* Header */}
                            <div className="flex items-center gap-3 px-4 py-2 bg-muted/30">
                                <Checkbox
                                    checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                />
                                <span className="text-sm font-medium flex-1">Product</span>
                                <span className="text-sm font-medium w-20 text-right hidden sm:block">Price</span>
                                <span className="text-sm font-medium w-20 text-center hidden sm:block">Order</span>
                                <span className="w-8"></span>
                            </div>

                            {/* Rows */}
                            {filteredProducts.map((product, index) => (
                                <div
                                    key={product.id}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors",
                                        selectedIds.has(product.productId) && "bg-muted/50"
                                    )}
                                >
                                    <Checkbox
                                        checked={selectedIds.has(product.productId)}
                                        onCheckedChange={() => toggleSelect(product.productId)}
                                    />
                                    
                                    {/* Product Info */}
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="h-10 w-10 rounded-xl bg-muted overflow-hidden shrink-0">
                                            {product.productImage ? (
                                                <Image
                                                    src={product.productImage}
                                                    alt={product.productName}
                                                    width={40}
                                                    height={40}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium truncate">{product.productName}</p>
                                            {product.productSku && (
                                                <p className="text-xs text-muted-foreground">SKU: {product.productSku}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="w-20 text-right hidden sm:block">
                                        <span className="text-sm">{formatPrice(product.productPrice)}</span>
                                    </div>

                                    {/* Reorder */}
                                    <div className="w-20 items-center justify-center gap-1 hidden sm:flex">
                                        <button
                                            onClick={() => handleMoveUp(index)}
                                            disabled={index === 0 || isPending}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                        >
                                            <ArrowUp className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleMoveDown(index)}
                                            disabled={index === filteredProducts.length - 1 || isPending}
                                            className="p-1 rounded hover:bg-muted disabled:opacity-30"
                                        >
                                            <ArrowDown className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Actions */}
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon-sm">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleRemoveProduct(product.productId)}
                                            >
                                                <Trash className="h-4 w-4 mr-2" />
                                                Remove from Collection
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <AssignProductsDialog
                open={assignDialogOpen}
                onOpenChange={setAssignDialogOpen}
                collectionId={collection.id}
                onProductsAssigned={handleProductsAssigned}
            />
        </>
    );
}
