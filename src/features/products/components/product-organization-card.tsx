"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import type { Product } from "@/features/products/types";
import { updateProductOrganization } from "@/app/dashboard/products/product-actions";
import { createClient } from "@/infrastructure/supabase/client";

interface ProductOrganizationCardProps {
    product: Product;
    onUpdate?: () => void;
}

interface Category {
    id: string;
    name: string;
}

interface Collection {
    id: string;
    name: string;
}

export function ProductOrganizationCard({ product, onUpdate }: ProductOrganizationCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [collections, setCollections] = useState<Collection[]>([]);
    const [formData, setFormData] = useState({
        categoryId: product.categoryId || "",
        collectionIds: product.collectionIds || [],
    });

    useEffect(() => {
        const fetchData = async () => {
            const supabase = createClient();
            
            const [categoriesRes, collectionsRes] = await Promise.all([
                supabase.from("categories").select("id, name").order("name"),
                supabase.from("collections").select("id, name").order("name"),
            ]);

            if (categoriesRes.data) setCategories(categoriesRes.data);
            if (collectionsRes.data) setCollections(collectionsRes.data);
        };

        if (isEditing) {
            fetchData();
        }
    }, [isEditing]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateProductOrganization(product.id, {
                categoryId: formData.categoryId || null,
                collectionIds: formData.collectionIds,
            });

            if (result.success) {
                toast.success("Organization updated");
                setIsEditing(false);
                onUpdate?.();
            } else {
                toast.error(result.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update organization");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            categoryId: product.categoryId || "",
            collectionIds: product.collectionIds || [],
        });
        setIsEditing(false);
    };

    const toggleCollection = (collectionId: string) => {
        setFormData(prev => ({
            ...prev,
            collectionIds: prev.collectionIds.includes(collectionId)
                ? prev.collectionIds.filter(id => id !== collectionId)
                : [...prev.collectionIds, collectionId],
        }));
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Organization</CardTitle>
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
                    <Label>Category</Label>
                    {isEditing ? (
                        <Select
                            value={formData.categoryId}
                            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">No category</SelectItem>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                        <p className="text-sm">{product.categoryName || "No category"}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label>Collections</Label>
                    {isEditing ? (
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-2">
                                {formData.collectionIds.map((collectionId) => {
                                    const collection = collections.find(c => c.id === collectionId);
                                    return (
                                        <Badge
                                            key={collectionId}
                                            variant="secondary"
                                            className="cursor-pointer"
                                            onClick={() => toggleCollection(collectionId)}
                                        >
                                            {collection?.name || collectionId}
                                            <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3 ml-1" />
                                        </Badge>
                                    );
                                })}
                            </div>
                            <Select
                                value=""
                                onValueChange={(value) => {
                                    if (value && !formData.collectionIds.includes(value)) {
                                        toggleCollection(value);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Add to collection" />
                                </SelectTrigger>
                                <SelectContent>
                                    {collections
                                        .filter(c => !formData.collectionIds.includes(c.id))
                                        .map((collection) => (
                                            <SelectItem key={collection.id} value={collection.id}>
                                                {collection.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {product.collectionNames.length > 0 ? (
                                product.collectionNames.map((name, index) => (
                                    <Badge key={index} variant="secondary">
                                        {name}
                                    </Badge>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">No collections</p>
                            )}
                        </div>
                    )}
                </div>

                {product.brand && (
                    <div className="space-y-2">
                        <Label>Brand</Label>
                        <p className="text-sm">{product.brand}</p>
                    </div>
                )}

                {product.tags.length > 0 && (
                    <div className="space-y-2">
                        <Label>Tags</Label>
                        <div className="flex flex-wrap gap-2">
                            {product.tags.map((tag, index) => (
                                <Badge key={index} variant="outline">
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
