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
import type { ProductVariant } from "@/features/products/types";
import { updateVariant, updateVariantStock } from "@/app/dashboard/products/product-actions";

interface EditVariantDialogProps {
    variant: ProductVariant;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

export function EditVariantDialog({
    variant,
    open,
    onOpenChange,
    onSuccess,
}: EditVariantDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: variant.title,
        sku: variant.sku || "",
        price: variant.price?.toString() || "",
        quantity: variant.quantity.toString(),
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title.trim()) {
            toast.error("Variant name is required");
            return;
        }

        setIsSubmitting(true);
        try {
            // Update variant details
            const variantResult = await updateVariant({
                id: variant.id,
                title: formData.title,
                sku: formData.sku || undefined,
                price: formData.price ? parseFloat(formData.price) : undefined,
            });

            if (!variantResult.success) {
                toast.error(variantResult.error || "Failed to update variant");
                return;
            }

            // Update stock if changed
            const newQuantity = parseInt(formData.quantity) || 0;
            if (newQuantity !== variant.quantity) {
                await updateVariantStock(variant.id, newQuantity, "set");
            }

            toast.success("Variant updated");
            onOpenChange(false);
            onSuccess?.();
        } catch {
            toast.error("Failed to update variant");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Variant</DialogTitle>
                    <DialogDescription>
                        Update the variant details.
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

                    {variant.options.length > 0 && (
                        <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-medium mb-2">Options</p>
                            <div className="flex flex-wrap gap-2">
                                {variant.options.map((opt, i) => (
                                    <span key={i} className="text-sm">
                                        {opt.name}: <strong>{opt.value}</strong>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

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
                            <Label htmlFor="quantity">Stock Quantity</Label>
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
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
