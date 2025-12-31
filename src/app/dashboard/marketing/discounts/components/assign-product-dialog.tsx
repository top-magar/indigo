"use client";

import { useState } from "react";
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
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import Image from "next/image";

interface Product {
    id: string;
    name: string;
    thumbnail: string | null;
    productType: string;
}

interface AssignProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    excludeIds: string[];
    onAssign: (productIds: string[]) => void;
}

// Mock products - replace with actual data fetching
const mockProducts: Product[] = [
    { id: "p1", name: "Classic T-Shirt", thumbnail: null, productType: "Apparel" },
    { id: "p2", name: "Denim Jeans", thumbnail: null, productType: "Apparel" },
    { id: "p3", name: "Running Shoes", thumbnail: null, productType: "Footwear" },
    { id: "p4", name: "Leather Wallet", thumbnail: null, productType: "Accessories" },
    { id: "p5", name: "Sunglasses", thumbnail: null, productType: "Accessories" },
    { id: "p6", name: "Watch", thumbnail: null, productType: "Accessories" },
    { id: "p7", name: "Backpack", thumbnail: null, productType: "Bags" },
    { id: "p8", name: "Hoodie", thumbnail: null, productType: "Apparel" },
];

export function AssignProductDialog({
    open,
    onOpenChange,
    excludeIds,
    onAssign,
}: AssignProductDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const availableProducts = mockProducts.filter(
        (p) => !excludeIds.includes(p.id)
    );

    const filteredProducts = availableProducts.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                        <HugeiconsIcon
                            icon={Search01Icon}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
                        />
                        <Input
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <ScrollArea className="h-[300px] border rounded-lg">
                        {filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                No products found
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
                                            {product.thumbnail ? (
                                                <Image
                                                    src={product.thumbnail}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <HugeiconsIcon
                                                    icon={Image01Icon}
                                                    className="w-4 h-4 text-muted-foreground"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{product.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {product.productType}
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
                    <Button onClick={handleSubmit} disabled={selectedIds.length === 0}>
                        Assign {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Products
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
