"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete01Icon, Loading01Icon, Upload04Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { Category } from "@/app/dashboard/categories/types";
import { updateCategoryImage, deleteCategoryImage } from "@/app/dashboard/categories/category-actions";

interface CategoryImageCardProps {
    category: Category;
    onUpdate?: (data: Partial<Category>) => void;
}

export function CategoryImageCard({ category, onUpdate }: CategoryImageCardProps) {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [imageAlt, setImageAlt] = useState(category.backgroundImageAlt || "");

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            
            startTransition(async () => {
                const result = await updateCategoryImage(category.id, data.url, imageAlt);
                if (result.success) {
                    toast.success("Image uploaded");
                    onUpdate?.({ backgroundImage: data.url });
                } else {
                    toast.error(result.error || "Failed to update image");
                }
            });
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteImage = () => {
        startTransition(async () => {
            const result = await deleteCategoryImage(category.id);
            if (result.success) {
                toast.success("Image removed");
                onUpdate?.({ backgroundImage: null, backgroundImageAlt: null });
            } else {
                toast.error(result.error || "Failed to remove image");
            }
        });
    };

    const handleAltUpdate = () => {
        if (!category.backgroundImage) return;
        
        startTransition(async () => {
            const result = await updateCategoryImage(category.id, category.backgroundImage!, imageAlt);
            if (result.success) {
                toast.success("Alt text updated");
                onUpdate?.({ backgroundImageAlt: imageAlt });
            } else {
                toast.error(result.error || "Failed to update");
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base font-medium">Background Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {category.backgroundImage ? (
                    <div className="space-y-4">
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                            <Image
                                src={category.backgroundImage}
                                alt={category.backgroundImageAlt || category.name}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute top-2 right-2">
                                <Button
                                    variant="secondary"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={handleDeleteImage}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="imageAlt">Alt Text</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="imageAlt"
                                    value={imageAlt}
                                    onChange={(e) => setImageAlt(e.target.value)}
                                    placeholder="Describe the image..."
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleAltUpdate}
                                    disabled={isPending || imageAlt === category.backgroundImageAlt}
                                >
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <HugeiconsIcon icon={Loading01Icon} className="h-10 w-10 text-muted-foreground animate-spin" />
                        ) : (
                            <>
                                <HugeiconsIcon icon={Upload04Icon} className="h-10 w-10 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground">Click to upload</p>
                                <p className="text-xs text-muted-foreground mt-1">Recommended: 800x400px</p>
                            </>
                        )}
                    </label>
                )}
            </CardContent>
        </Card>
    );
}
