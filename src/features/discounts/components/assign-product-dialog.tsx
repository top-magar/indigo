"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Image as ImageIcon, Loader2 } from "lucide-react";
import { getProductsForDiscount } from "@/app/dashboard/marketing/actions";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    image_url: string | null;
}

interface AssignProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    excludeIds: string[];
    onAssign: (productIds: string[]) => void;
}

export function AssignProductDialog({
    open,
    onOpenChange,
    excludeIds,
    onAssign,
}: AssignProductDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch products when dialog opens
    useEffect(() => {
        if (open) {
            setIsLoading(true);
            startTransition(async () => {
                const result = await getProductsForDiscount();
                if (result.products) {
                    setProducts(result.products);
                }
                setIsLoading(false);
            });
        }
    }, [open]);

    const availableProducts = products.filter(
        (p) => !excludeIds.includes(p.id)
    );

    const filteredProducts = availableProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        onAssign(selectedIds);
        setSelectedIds([]);
        setSearchQuery("");
    };

    const handleClose = () => {
        onOpenChange(false);
        setSelectedIds([]);
        setSearchQuery("");
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Assign Products</DialogTitle>
                    <DialogDescription>
                        Select products to apply this discount to
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
                        />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <ScrollArea className="h-[300px] border rounded-xl">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                {availableProducts.length === 0 ? "No products available" : "No products found"}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredProducts.map((product) => (
                                    <label
                                        key={product.id}
                                        className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(product.id)}
                                            onCheckedChange={() => toggleSelect(product.id)}
                                        />
                                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0 relative">
                                            {product.image_url ? (
                                                <Image
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <ImageIcon
                                                    className="w-4 h-4 text-muted-foreground"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{product.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {product.sku || "No SKU"} · ${product.price.toFixed(2)}
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {selectedIds.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {selectedIds.length} products selected
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={selectedIds.length === 0 || isPending}>
                        Assign {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Products
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
