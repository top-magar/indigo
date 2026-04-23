"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/features/products/types";
import { addProductMedia, removeProductMedia } from "@/app/dashboard/products/product-actions";
import { cn } from "@/shared/utils";

interface ProductMediaCardProps {
    product: Product;
    onUpdate?: () => void;
}

export function ProductMediaCard({ product, onUpdate }: ProductMediaCardProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleFileUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append("file", file);
                const response = await fetch("/api/media/upload", { method: "POST", body: formData });
                if (!response.ok) throw new Error("Upload failed");
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
            setSelectedIndex(0);
            onUpdate?.();
        } else {
            toast.error(result.error || "Failed to remove");
        }
    };

    const currentMedia = product.media[selectedIndex];

    return (
        <Card>
            <CardContent className="pt-4">
                <input
                    type="file"
                    id="media-upload"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                />

                {product.media.length === 0 ? (
                    <div
                        className="aspect-square rounded-lg border border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => document.getElementById("media-upload")?.click()}
                    >
                        <ImageIcon className="size-8 text-muted-foreground mb-2" />
                        <p className="text-xs text-muted-foreground">
                            {isUploading ? "Uploading..." : "Upload images"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Hero image */}
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
                            <Image
                                src={currentMedia.url}
                                alt={currentMedia.alt || product.name}
                                fill
                                className="object-cover"
                            />
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 size-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRemove(currentMedia.url)}
                            >
                                <Trash2 className="size-3" />
                            </Button>
                        </div>

                        {/* Thumbnail strip */}
                        <div className="flex gap-2">
                            {product.media.map((media, index) => (
                                <button
                                    key={media.id}
                                    onClick={() => setSelectedIndex(index)}
                                    className={cn(
                                        "relative size-14 shrink-0 rounded-md overflow-hidden border-2 transition-colors",
                                        index === selectedIndex ? "border-primary" : "border-transparent hover:border-border"
                                    )}
                                >
                                    <Image
                                        src={media.url}
                                        alt={media.alt || product.name}
                                        fill
                                        className="object-cover"
                                    />
                                </button>
                            ))}
                            <button
                                className="size-14 shrink-0 rounded-md border border-dashed flex items-center justify-center hover:border-primary/50 transition-colors"
                                onClick={() => document.getElementById("media-upload")?.click()}
                            >
                                <Plus className="size-4 text-muted-foreground" />
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
