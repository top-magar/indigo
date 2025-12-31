"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { Product, ProductStatus } from "../types";
import { updateProduct } from "../actions";

interface ProductInfoCardProps {
    product: Product;
    onUpdate?: () => void;
}

export function ProductInfoCard({ product, onUpdate }: ProductInfoCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: product.name,
        description: product.description || "",
        status: product.status,
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const form = new FormData();
            form.append("productId", product.id);
            form.append("name", formData.name);
            form.append("description", formData.description);
            form.append("status", formData.status);

            const result = await updateProduct(form);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Product updated");
                setIsEditing(false);
                onUpdate?.();
            }
        } catch {
            toast.error("Failed to update product");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            name: product.name,
            description: product.description || "",
            status: product.status,
        });
        setIsEditing(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>General Information</CardTitle>
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
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    {isEditing ? (
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    ) : (
                        <p className="text-sm">{product.name}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    {isEditing ? (
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {product.description || "No description"}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    {isEditing ? (
                        <Select
                            value={formData.status}
                            onValueChange={(value: ProductStatus) => setFormData({ ...formData, status: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-sm capitalize">{product.status}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
