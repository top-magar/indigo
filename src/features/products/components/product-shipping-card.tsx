"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Product } from "@/features/products/types";
import { updateProductShipping } from "@/app/dashboard/products/product-actions";

interface ProductShippingCardProps {
    product: Product;
    onUpdate?: () => void;
}

export function ProductShippingCard({ product, onUpdate }: ProductShippingCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<{
        requiresShipping: boolean;
        weight: string;
        weightUnit: "g" | "kg" | "lb" | "oz";
        length: string;
        width: string;
        height: string;
    }>({
        requiresShipping: product.shipping.requiresShipping,
        weight: product.shipping.weight?.toString() || "",
        weightUnit: product.shipping.weightUnit || "g",
        length: product.shipping.dimensions?.length?.toString() || "",
        width: product.shipping.dimensions?.width?.toString() || "",
        height: product.shipping.dimensions?.height?.toString() || "",
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateProductShipping(product.id, {
                requiresShipping: formData.requiresShipping,
                weight: formData.weight ? parseFloat(formData.weight) : undefined,
                weightUnit: formData.weightUnit as "g" | "kg" | "lb" | "oz",
                dimensions: {
                    length: formData.length ? parseFloat(formData.length) : undefined,
                    width: formData.width ? parseFloat(formData.width) : undefined,
                    height: formData.height ? parseFloat(formData.height) : undefined,
                },
            });

            if (result.success) {
                toast.success("Shipping updated");
                setIsEditing(false);
                onUpdate?.();
            } else {
                toast.error(result.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update shipping");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            requiresShipping: product.shipping.requiresShipping,
            weight: product.shipping.weight?.toString() || "",
            weightUnit: product.shipping.weightUnit || "g",
            length: product.shipping.dimensions?.length?.toString() || "",
            width: product.shipping.dimensions?.width?.toString() || "",
            height: product.shipping.dimensions?.height?.toString() || "",
        });
        setIsEditing(false);
    };

    const formatWeight = () => {
        if (!product.shipping.weight) return "—";
        return `${product.shipping.weight} ${product.shipping.weightUnit}`;
    };

    const formatDimensions = () => {
        const { length, width, height } = product.shipping.dimensions || {};
        if (!length && !width && !height) return "—";
        return `${length || 0} × ${width || 0} × ${height || 0} cm`;
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Shipping</CardTitle>
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
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Physical Product</Label>
                        <p className="text-sm text-muted-foreground">
                            This product requires shipping
                        </p>
                    </div>
                    <Switch
                        checked={formData.requiresShipping}
                        onCheckedChange={(checked) => setFormData({ ...formData, requiresShipping: checked })}
                        disabled={!isEditing}
                    />
                </div>

                {formData.requiresShipping && (
                    <>
                        <div className="space-y-2">
                            <Label>Weight</Label>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        placeholder="0.00"
                                        className="flex-1"
                                    />
                                    <Select
                                        value={formData.weightUnit}
                                        onValueChange={(value: "g" | "kg" | "lb" | "oz") => setFormData({ ...formData, weightUnit: value })}
                                    >
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="g">g</SelectItem>
                                            <SelectItem value="kg">kg</SelectItem>
                                            <SelectItem value="lb">lb</SelectItem>
                                            <SelectItem value="oz">oz</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ) : (
                                <p className="text-sm">{formatWeight()}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Dimensions (L × W × H)</Label>
                            {isEditing ? (
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.length}
                                        onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                                        placeholder="Length"
                                    />
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.width}
                                        onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                                        placeholder="Width"
                                    />
                                    <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        value={formData.height}
                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                        placeholder="Height"
                                    />
                                </div>
                            ) : (
                                <p className="text-sm">{formatDimensions()}</p>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
