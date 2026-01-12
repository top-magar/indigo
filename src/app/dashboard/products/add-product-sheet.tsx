"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Plus, Image } from "lucide-react";
import { createProductAction } from "@/infrastructure/services/product";

export function AddProductSheet() {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button className="h-10 gap-2">
                    <Plus className="w-4 h-4" />
                    Add Product
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[50vw] sm:max-w-none">
                <SheetHeader>
                    <SheetTitle>Add New Product</SheetTitle>
                    <SheetDescription>
                        Add a new product to your catalog. Click save when you're done.
                    </SheetDescription>
                </SheetHeader>

                <form action={createProductAction} className="space-y-6 py-6">
                    {/* Image Upload Placeholder */}
                    <div className="flex justify-center">
                        <div className="h-32 w-32 rounded-xl border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-muted-foreground/50 transition-colors">
                            <Image className="w-8 h-8 text-muted-foreground/50" />
                            <span className="text-xs text-muted-foreground">Add image</span>
                        </div>
                    </div>

                    {/* Product Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">Product Name <span className="text-[var(--ds-red-700)]">*</span></Label>
                        <Input
                            name="name"
                            id="name"
                            placeholder="e.g. Goldstar Shoes"
                            required
                            className="h-10"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            name="description"
                            id="description"
                            placeholder="Describe your product..."
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Price & SKU */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price (Rs) <span className="text-[var(--ds-red-700)]">*</span></Label>
                            <Input
                                name="price"
                                id="price"
                                type="number"
                                placeholder="1500"
                                required
                                min="0"
                                step="0.01"
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                name="sku"
                                id="sku"
                                placeholder="GS-001"
                                className="h-10 font-mono"
                            />
                        </div>
                    </div>

                    {/* Stock */}
                    <div className="space-y-2">
                        <Label htmlFor="stock">Initial Stock</Label>
                        <Input
                            name="stock"
                            id="stock"
                            type="number"
                            defaultValue="0"
                            min="0"
                            className="h-10 w-32"
                        />
                        <p className="text-xs text-muted-foreground">
                            You can update stock levels later
                        </p>
                    </div>

                    <SheetFooter className="gap-2 pt-4">
                        <SheetClose asChild>
                            <Button type="button" variant="outline">
                                Cancel
                            </Button>
                        </SheetClose>
                        <Button type="submit">
                            <Plus className="w-4 h-4 mr-2" />
                            Save Product
                        </Button>
                    </SheetFooter>
                </form>
            </SheetContent>
        </Sheet>
    );
}
