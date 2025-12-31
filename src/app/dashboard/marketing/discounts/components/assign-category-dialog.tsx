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
import { Search01Icon, GridIcon } from "@hugeicons/core-free-icons";

interface Category {
    id: string;
    name: string;
    productsCount: number;
    parentName: string | null;
}

interface AssignCategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    excludeIds: string[];
    onAssign: (categoryIds: string[]) => void;
}

// Mock categories - replace with actual data fetching
const mockCategories: Category[] = [
    { id: "cat1", name: "Clothing", productsCount: 150, parentName: null },
    { id: "cat2", name: "T-Shirts", productsCount: 45, parentName: "Clothing" },
    { id: "cat3", name: "Pants", productsCount: 32, parentName: "Clothing" },
    { id: "cat4", name: "Accessories", productsCount: 80, parentName: null },
    { id: "cat5", name: "Bags", productsCount: 25, parentName: "Accessories" },
    { id: "cat6", name: "Jewelry", productsCount: 40, parentName: "Accessories" },
    { id: "cat7", name: "Footwear", productsCount: 60, parentName: null },
    { id: "cat8", name: "Sneakers", productsCount: 35, parentName: "Footwear" },
];

export function AssignCategoryDialog({
    open,
    onOpenChange,
    excludeIds,
    onAssign,
}: AssignCategoryDialogProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const availableCategories = mockCategories.filter(
        (c) => !excludeIds.includes(c.id)
    );

    const filteredCategories = availableCategories.filter((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <DialogTitle>Assign Categories</DialogTitle>
                    <DialogDescription>
                        Select categories to apply this discount to all their products
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="relative">
                        <HugeiconsIcon
                            icon={Search01Icon}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4"
                        />
                        <Input
                            placeholder="Search categories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <ScrollArea className="h-[300px] border rounded-lg">
                        {filteredCategories.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                No categories found
                            </div>
                        ) : (
                            <div className="divide-y">
                                {filteredCategories.map((category) => (
                                    <label
                                        key={category.id}
                                        className="flex items-center gap-3 p-3 hover:bg-muted cursor-pointer"
                                    >
                                        <Checkbox
                                            checked={selectedIds.includes(category.id)}
                                            onCheckedChange={() => toggleSelect(category.id)}
                                        />
                                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                            <HugeiconsIcon
                                                icon={GridIcon}
                                                className="w-4 h-4 text-muted-foreground"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{category.name}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {category.parentName ? `${category.parentName} › ` : ""}
                                                {category.productsCount} products
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </ScrollArea>

                    {selectedIds.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            {selectedIds.length} categories selected
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={selectedIds.length === 0}>
                        Assign {selectedIds.length > 0 ? `${selectedIds.length} ` : ""}Categories
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
