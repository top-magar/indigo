"use client";

import { useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PencilEdit01Icon, Tick01Icon, Cancel01Icon, Loading01Icon, Globe02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Category } from "@/app/dashboard/categories/types";
import { updateCategorySeo } from "@/app/dashboard/categories/category-actions";

interface CategorySeoCardProps {
    category: Category;
    onUpdate?: (data: Partial<Category>) => void;
}

export function CategorySeoCard({ category, onUpdate }: CategorySeoCardProps) {
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [metaTitle, setMetaTitle] = useState(category.seo.metaTitle || "");
    const [metaDescription, setMetaDescription] = useState(category.seo.metaDescription || "");
    const [slug, setSlug] = useState(category.slug);

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateCategorySeo(category.id, {
                metaTitle: metaTitle || undefined,
                metaDescription: metaDescription || undefined,
                slug,
            });
            if (result.success) {
                toast.success("SEO settings updated");
                onUpdate?.({
                    slug,
                    seo: { metaTitle, metaDescription, slug },
                });
                setIsEditing(false);
            } else {
                toast.error(result.error || "Failed to update");
            }
        });
    };

    const handleCancel = () => {
        setMetaTitle(category.seo.metaTitle || "");
        setMetaDescription(category.seo.metaDescription || "");
        setSlug(category.slug);
        setIsEditing(false);
    };

    const previewUrl = `yourstore.com/categories/${slug}`;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <HugeiconsIcon icon={Globe02Icon} className="h-4 w-4" />
                    SEO Settings
                </CardTitle>
                {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <HugeiconsIcon icon={PencilEdit01Icon} className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
                            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                            {isPending ? (
                                <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" />
                            ) : (
                                <HugeiconsIcon icon={Tick01Icon} className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search Preview */}
                <div className="p-4 bg-muted/50 rounded-lg space-y-1">
                    <p className="text-sm font-medium text-chart-1 truncate">
                        {metaTitle || category.name}
                    </p>
                    <p className="text-xs text-chart-2 truncate">{previewUrl}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {metaDescription || category.description || "No description available"}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">/categories/</span>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                placeholder="category-slug"
                                className="font-mono"
                            />
                        </div>
                    ) : (
                        <p className="text-sm font-mono">/categories/{category.slug}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="metaTitle">
                        Meta Title
                        <span className="text-muted-foreground font-normal ml-2">
                            ({metaTitle.length}/60)
                        </span>
                    </Label>
                    {isEditing ? (
                        <Input
                            id="metaTitle"
                            value={metaTitle}
                            onChange={(e) => setMetaTitle(e.target.value)}
                            placeholder={category.name}
                            maxLength={60}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {category.seo.metaTitle || "Using category name"}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="metaDescription">
                        Meta Description
                        <span className="text-muted-foreground font-normal ml-2">
                            ({metaDescription.length}/160)
                        </span>
                    </Label>
                    {isEditing ? (
                        <Textarea
                            id="metaDescription"
                            value={metaDescription}
                            onChange={(e) => setMetaDescription(e.target.value)}
                            placeholder="Brief description for search engines..."
                            rows={3}
                            maxLength={160}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {category.seo.metaDescription || "Using category description"}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
