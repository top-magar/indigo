"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { Product } from "@/features/products/types";
import { updateProductSeo } from "@/app/dashboard/products/product-actions";

interface ProductSeoCardProps {
    product: Product;
    onUpdate?: () => void;
}

export function ProductSeoCard({ product, onUpdate }: ProductSeoCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        metaTitle: product.seo.metaTitle || "",
        metaDescription: product.seo.metaDescription || "",
        slug: product.seo.slug,
    });

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateProductSeo(product.id, {
                metaTitle: formData.metaTitle || undefined,
                metaDescription: formData.metaDescription || undefined,
                slug: formData.slug,
            });

            if (result.success) {
                toast.success("SEO updated");
                setIsEditing(false);
                onUpdate?.();
            } else {
                toast.error(result.error || "Failed to update");
            }
        } catch {
            toast.error("Failed to update SEO");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            metaTitle: product.seo.metaTitle || "",
            metaDescription: product.seo.metaDescription || "",
            slug: product.seo.slug,
        });
        setIsEditing(false);
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const previewTitle = formData.metaTitle || product.name;
    const previewDescription = formData.metaDescription || product.description || "";
    const previewUrl = `yourstore.com/products/${formData.slug}`;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Search Engine Listing</CardTitle>
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
                {/* Preview */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-sm text-muted-foreground">{previewUrl}</p>
                    <p className="text-blue-600 font-medium">{previewTitle}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {previewDescription || "No description"}
                    </p>
                </div>

                {isEditing && (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="metaTitle">
                                Page Title
                                <span className="text-muted-foreground ml-2">
                                    ({formData.metaTitle.length}/70)
                                </span>
                            </Label>
                            <Input
                                id="metaTitle"
                                value={formData.metaTitle}
                                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                                placeholder={product.name}
                                maxLength={70}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="metaDescription">
                                Meta Description
                                <span className="text-muted-foreground ml-2">
                                    ({formData.metaDescription.length}/160)
                                </span>
                            </Label>
                            <Textarea
                                id="metaDescription"
                                value={formData.metaDescription}
                                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                                placeholder="Enter a description for search engines"
                                maxLength={160}
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slug">URL Handle</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="product-url-handle"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setFormData({ ...formData, slug: generateSlug(product.name) })}
                                >
                                    Generate
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                yourstore.com/products/{formData.slug || "..."}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
