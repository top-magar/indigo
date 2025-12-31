"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createVariant } from "../product-actions";

interface CreateVariantDialogProps {
    productId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function CreateVariantDialog({
    productId,
    open,
    onOpenChange,
    onSuccess,
}: CreateVariantDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        sku: "",
        price: "",
        quantity: "0",
        optionName: "",
        optionValue: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            toast.error("Variant name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            const options = formData.optionName && formData.optionValue
                ? [{ name: formData.optionName, value: formData.optionValue }]
                : [];

            const result = await createVariant({
                productId,
                title: formData.title,
                sku: formData.sku || undefined,
                price: formData.price ? parseFloat(formData.price) : undefined,
                quantity: parseInt(formData.quantity) || 0,
                options,
            });

            if (result.success) {
                toast.success("Variant created");
                setFormData({
                    title: "",
                    sku: "",
                    price: "",
                    quantity: "0",
                    optionName: "",
                    optionValue: "",
                });
                onOpenChange(false);
                onSuccess?.();
            } else {
                toast.error(result.error || "Failed to create variant");
            }
        } catch {
            toast.error("Failed to create variant");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Variant</DialogTitle>
                    <DialogDescription>
                        Create a new product variant with different options.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Variant Name *</Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g., Large / Red"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="optionName">Option Name</Label>
                            <Input
                                id="optionName"
                                value={formData.optionName}
                                onChange={(e) => setFormData({ ...formData, optionName: e.target.value })}
                                placeholder="e.g., Size"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="optionValue">Option Value</Label>
                            <Input
                                id="optionValue"
                                value={formData.optionValue}
                                onChange={(e) => setFormData({ ...formData, optionValue: e.target.value })}
                                placeholder="e.g., Large"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            placeholder="Stock Keeping Unit"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price">Price Override</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="Leave empty to use base price"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="quantity">Initial Stock</Label>
                            <Input
                                id="quantity"
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Creating..." : "Create Variant"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
