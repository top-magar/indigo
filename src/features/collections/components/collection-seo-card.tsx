"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X, Loader2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Collection } from "@/app/dashboard/collections/types";
import { updateCollectionSeo } from "@/app/dashboard/collections/collection-actions";

interface CollectionSeoCardProps {
    collection: Collection;
    onUpdate?: (data: Partial<Collection>) => void;
}

export function CollectionSeoCard({ collection, onUpdate }: CollectionSeoCardProps) {
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [metaTitle, setMetaTitle] = useState(collection.seo.metaTitle || "");
    const [metaDescription, setMetaDescription] = useState(collection.seo.metaDescription || "");
    const [slug, setSlug] = useState(collection.slug);

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateCollectionSeo(collection.id, {
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
        setMetaTitle(collection.seo.metaTitle || "");
        setMetaDescription(collection.seo.metaDescription || "");
        setSlug(collection.slug);
        setIsEditing(false);
    };

    // Preview URL
    const previewUrl = `yourstore.com/collections/${slug}`;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    SEO Settings
                </CardTitle>
                {!isEditing ? (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                    </Button>
                ) : (
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancel} disabled={isPending}>
                            <X className="h-4 w-4" />
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={isPending}>
                            {isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Search Preview */}
                <div className="p-4 bg-muted/50 rounded-xl space-y-1">
                    <p className="text-sm font-medium text-chart-1 truncate">
                        {metaTitle || collection.name}
                    </p>
                    <p className="text-xs text-chart-2 truncate">{previewUrl}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {metaDescription || collection.description || "No description available"}
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">/collections/</span>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                placeholder="collection-slug"
                                className="font-mono"
                            />
                        </div>
                    ) : (
                        <p className="text-sm font-mono">/collections/{collection.slug}</p>
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
                            placeholder={collection.name}
                            maxLength={60}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            {collection.seo.metaTitle || "Using collection name"}
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
                            {collection.seo.metaDescription || "Using collection description"}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
