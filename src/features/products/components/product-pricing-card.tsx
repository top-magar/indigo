"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Product } from "@/features/products/types";
import { updateProduct } from "@/app/dashboard/products/actions";

interface ProductPricingCardProps {
    product: Product;
    onUpdate?: () => void;
}

export function ProductPricingCard({ product, onUpdate }: ProductPricingCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        price: product.price.toString(),
        compareAtPrice: product.compareAtPrice?.toString() || "",
        costPrice: product.costPrice?.toString() || "",
    });

    const formatCurrency = (value: number | null | undefined) => {
        if (value === null || value === undefined) return "—";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: product.currency || "USD",
        }).format(value);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const form = new FormData();
            form.append("productId", product.id);
            form.append("price", formData.price);
            if (formData.compareAtPrice) {
                form.append("compareAtPrice", formData.compareAtPrice);
            }
            if (formData.costPrice) {
                form.append("costPrice", formData.costPrice);
            }

            const result = await updateProduct(form);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Pricing updated");
                setIsEditing(false);
                onUpdate?.();
            }
        } catch {
            toast.error("Failed to update pricing");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            price: product.price.toString(),
            compareAtPrice: product.compareAtPrice?.toString() || "",
            costPrice: product.costPrice?.toString() || "",
        });
        setIsEditing(false);
    };

    const profit = product.costPrice
        ? product.price - product.costPrice
        : null;
    const margin = profit && product.price > 0
        ? (profit / product.price) * 100
        : null;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pricing</CardTitle>
                {!isEditing ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Price</Label>
                        {isEditing ? (
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        ) : (
                            <p className="text-lg font-semibold">{formatCurrency(product.price)}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="compareAtPrice">Compare at Price</Label>
                        {isEditing ? (
                            <Input
                                id="compareAtPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Optional"
                                value={formData.compareAtPrice}
                                onChange={(e) => setFormData({ ...formData, compareAtPrice: e.target.value })}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {formatCurrency(product.compareAtPrice)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="costPrice">Cost per Item</Label>
                        {isEditing ? (
                            <Input
                                id="costPrice"
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="Optional"
                                value={formData.costPrice}
                                onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                            />
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                {formatCurrency(product.costPrice)}
                            </p>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="space-y-2">
                            <Label>Profit / Margin</Label>
                            <p className="text-sm text-muted-foreground">
                                {profit !== null ? (
                                    <>
                                        {formatCurrency(profit)}
                                        {margin !== null && (
                                            <span className="ml-2 text-chart-2">
                                                ({margin.toFixed(1)}%)
                                            </span>
                                        )}
                                    </>
                                ) : (
                                    "—"
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
