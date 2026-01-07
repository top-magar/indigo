"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Delete01Icon, Image01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import type { Product } from "@/features/products/types";
import { addProductMedia, removeProductMedia, reorderProductMedia } from "@/app/dashboard/products/product-actions";
import { cn } from "@/shared/utils";

interface ProductMediaCardProps {
    product: Product;
    onUpdate?: () => void;
}

export function ProductMediaCard({ product, onUpdate }: ProductMediaCardProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

    const handleFileUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/media/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("Upload failed");
                }

                const data = await response.json();
                await addProductMedia(product.id, data.url, file.name);
            }
            toast.success("Media uploaded");
            onUpdate?.();
        } catch {
            toast.error("Failed to upload media");
        } finally {
            setIsUploading(false);
        }
    }, [product.id, onUpdate]);

    const handleRemove = async (mediaUrl: string) => {
        const result = await removeProductMedia(product.id, mediaUrl);
        if (result.success) {
            toast.success("Media removed");
            onUpdate?.();
        } else {
            toast.error(result.error || "Failed to remove media");
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newOrder = [...product.media.map(m => m.url)];
        const [removed] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(index, 0, removed);

        // Update order immediately for visual feedback
        setDraggedIndex(index);
    };

    const handleDragEnd = async () => {
        if (draggedIndex === null) return;

        const newOrder = product.media.map(m => m.url);
        await reorderProductMedia(product.id, newOrder);
        setDraggedIndex(null);
        onUpdate?.();
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Media</CardTitle>
                <div>
                    <input
                        type="file"
                        id="media-upload"
                        className="hidden"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById("media-upload")?.click()}
                        disabled={isUploading}
                    >
                        <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Add Media"}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {product.media.length === 0 ? (
                    <div
                        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => document.getElementById("media-upload")?.click()}
                    >
                        <HugeiconsIcon icon={Image01Icon} className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-sm text-muted-foreground">
                            Click to upload or drag and drop images
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {product.media.map((media, index) => (
                            <div
                                key={media.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDragEnd={handleDragEnd}
                                className={cn(
                                    "relative aspect-square rounded-lg overflow-hidden border group cursor-move",
                                    draggedIndex === index && "opacity-50"
                                )}
                            >
                                <Image
                                    src={media.url}
                                    alt={media.alt || product.name}
                                    fill
                                    className="object-cover"
                                />
                                {index === 0 && (
                                    <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                                        Main
                                    </span>
                                )}
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleRemove(media.url)}
                                >
                                    <HugeiconsIcon icon={Delete01Icon} className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
