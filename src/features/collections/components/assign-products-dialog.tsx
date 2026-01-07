"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Search01Icon,
    Package01Icon,
    Loading01Icon,
    Add01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/shared/utils";
import type { CollectionProduct } from "@/app/dashboard/collections/types";
import { getAvailableProducts, assignProductsToCollection } from "@/app/dashboard/collections/collection-actions";

interface AvailableProduct {
    id: string;
    name: string;
    slug: string;
    sku?: string | null;
    price: number;
    image?: string | null;
    status: string;
}

interface AssignProductsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collectionId: string;
    onProductsAssigned: (products: CollectionProduct[]) => void;
}

export function AssignProductsDialog({
    open,
    onOpenChange,
    collectionId,
    onProductsAssigned,
}: AssignProductsDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [products, setProducts] = useState<AvailableProduct[]>([]);
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // Load products when dialog opens
    useEffect(() => {
        if (open) {
            loadProducts();
        } else {
            setSearchQuery("");
            setSelectedIds(new Set());
        }
    }, [open, collectionId]);

    // Search with debounce
    useEffect(() => {
        if (!open) return;
        
        const timer = setTimeout(() => {
            loadProducts(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, open]);

    const loadProducts = async (search?: string) => {
        setIsLoading(true);
        const result = await getAvailableProducts(collectionId, search);
        if (result.success) {
            setProducts(result.data);
        }
        setIsLoading(false);
    };

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

    const handleAssign = () => {
        if (selectedIds.size === 0) return;

        startTransition(async () => {
            const result = await assignProductsToCollection(collectionId, Array.from(selectedIds));
            if (result.success) {
                // Create CollectionProduct objects for the assigned products
                const assignedProducts: CollectionProduct[] = products
                    .filter(p => selectedIds.has(p.id))
                    .map((p, index) => ({
                        id: `temp-${p.id}`,
                        productId: p.id,
                        productName: p.name,
                        productSlug: p.slug,
                        productSku: p.sku || null,
                        productPrice: p.price,
                        productImage: p.image || null,
                        productStatus: p.status as "draft" | "active" | "archived",
                        position: index,
                        addedAt: new Date().toISOString(),
                    }));

                toast.success(`Added ${selectedIds.size} products`);
                onProductsAssigned(assignedProducts);
                onOpenChange(false);
            } else {
                toast.error(result.error || "Failed to add products");
            }
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(price);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Add Products to Collection</DialogTitle>
                    <DialogDescription>
                        Select products to add to this collection
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <HugeiconsIcon
                        icon={Search01Icon}
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                    />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Products List */}
                <div className="flex-1 overflow-y-auto min-h-[300px] border rounded-lg">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                            <HugeiconsIcon icon={Package01Icon} className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                                {searchQuery ? "No products match your search" : "All products are already in this collection"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {products.map((product) => (
                                <div
                                    key={product.id}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors",
                                        selectedIds.has(product.id) && "bg-muted/50"
                                    )}
                                    onClick={() => toggleSelect(product.id)}
                                >
                                    <Checkbox
                                        checked={selectedIds.has(product.id)}
                                        onCheckedChange={() => toggleSelect(product.id)}
                                    />
                                    
                                    <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                                        {product.image ? (
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                width={40}
                                                height={40}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <HugeiconsIcon icon={Package01Icon} className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{product.name}</p>
                                        {product.sku && (
                                            <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                        )}
                                    </div>
                                    
                                    <span className="text-sm font-medium">{formatPrice(product.price)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected Count */}
                {selectedIds.size > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{selectedIds.size} selected</Badge>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAssign} disabled={selectedIds.size === 0 || isPending}>
                        {isPending ? (
                            <>
                                <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                                Add {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
