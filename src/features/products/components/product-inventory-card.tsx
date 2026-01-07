"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import type { Product } from "@/features/products/types";
import { updateProductStock } from "@/app/dashboard/products/actions";
import { cn } from "@/shared/utils";

interface ProductInventoryCardProps {
    product: Product;
    onUpdate?: () => void;
}

export function ProductInventoryCard({ product, onUpdate }: ProductInventoryCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        sku: product.sku || "",
        barcode: product.barcode || "",
        quantity: product.quantity.toString(),
        trackQuantity: product.trackQuantity,
        allowBackorder: product.allowBackorder,
    });

    const getStockStatus = () => {
        if (product.quantity === 0) {
            return { label: "Out of Stock", color: "text-destructive", bgColor: "bg-destructive/10" };
        }
        if (product.quantity <= 10) {
            return { label: "Low Stock", color: "text-chart-4", bgColor: "bg-chart-4/10" };
        }
        return { label: "In Stock", color: "text-chart-2", bgColor: "bg-chart-2/10" };
    };

    const stockStatus = getStockStatus();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const form = new FormData();
            form.append("productId", product.id);
            form.append("action", "set");
            form.append("adjustment", formData.quantity);

            const result = await updateProductStock(form);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Inventory updated");
                setIsEditing(false);
                onUpdate?.();
            }
        } catch {
            toast.error("Failed to update inventory");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            sku: product.sku || "",
            barcode: product.barcode || "",
            quantity: product.quantity.toString(),
            trackQuantity: product.trackQuantity,
            allowBackorder: product.allowBackorder,
        });
        setIsEditing(false);
    };

    const handleQuickAdjust = async (adjustment: number) => {
        const form = new FormData();
        form.append("productId", product.id);
        form.append("action", adjustment > 0 ? "add" : "remove");
        form.append("adjustment", Math.abs(adjustment).toString());

        const result = await updateProductStock(form);
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Stock ${adjustment > 0 ? "added" : "removed"}`);
            onUpdate?.();
        }
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    <CardTitle>Inventory</CardTitle>
                    <Badge variant="secondary" className={cn("border-0", stockStatus.bgColor, stockStatus.color)}>
                        {stockStatus.label}
                    </Badge>
                </div>
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
                        <Label htmlFor="sku">SKU</Label>
                        {isEditing ? (
                            <Input
                                id="sku"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="Stock Keeping Unit"
                            />
                        ) : (
                            <p className="text-sm">{product.sku || "—"}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="barcode">Barcode</Label>
                        {isEditing ? (
                            <Input
                                id="barcode"
                                value={formData.barcode}
                                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                placeholder="ISBN, UPC, GTIN, etc."
                            />
                        ) : (
                            <p className="text-sm">{product.barcode || "—"}</p>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
                    {isEditing ? (
                        <Input
                            id="quantity"
                            type="number"
                            min="0"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        />
                    ) : (
                        <div className="flex items-center gap-4">
                            <p className="text-2xl font-semibold">{product.quantity}</p>
                            <div className="flex gap-1">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickAdjust(-1)}
                                    disabled={product.quantity === 0}
                                >
                                    -1
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickAdjust(1)}
                                >
                                    +1
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickAdjust(10)}
                                >
                                    +10
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Track Quantity</Label>
                            <p className="text-sm text-muted-foreground">
                                Track inventory levels for this product
                            </p>
                        </div>
                        <Switch
                            checked={formData.trackQuantity}
                            onCheckedChange={(checked) => setFormData({ ...formData, trackQuantity: checked })}
                            disabled={!isEditing}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Allow Backorders</Label>
                            <p className="text-sm text-muted-foreground">
                                Continue selling when out of stock
                            </p>
                        </div>
                        <Switch
                            checked={formData.allowBackorder}
                            onCheckedChange={(checked) => setFormData({ ...formData, allowBackorder: checked })}
                            disabled={!isEditing}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
