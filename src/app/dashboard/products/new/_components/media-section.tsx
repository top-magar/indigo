import Image from "next/image";
import {
    ImageIcon, Plus, X, GripVertical, Loader2, Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/shared/utils";
import type { ProductImage } from "../types";

interface MediaSectionProps {
    images: ProductImage[];
    isUploading: boolean;
    draggedImageIndex: number | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleImageUpload: (files: FileList | null) => void;
    removeImage: (id: string) => void;
    handleDragStart: (index: number) => void;
    handleDragOver: (e: React.DragEvent, index: number) => void;
    handleDragEnd: () => void;
    handleFileDrop: (e: React.DragEvent) => void;
}

export function MediaSection({
    images, isUploading, draggedImageIndex, fileInputRef,
    handleImageUpload, removeImage, handleDragStart, handleDragOver, handleDragEnd, handleFileDrop,
}: MediaSectionProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                        <ImageIcon className="size-4 text-muted-foreground" aria-hidden="true" />
                    </div>
                    <div>
                        <CardTitle className="text-sm font-medium">Media</CardTitle>
                        <CardDescription className="text-xs">Product images</CardDescription>
                    </div>
                    {images.length > 0 && (
                        <Badge variant="secondary" className="text-xs ml-auto">{images.length}/10</Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div
                    className={cn("grid gap-3", images.length === 0 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4")}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                >
                    {images.map((image, index) => (
                        <div
                            key={image.id}
                            draggable={!image.isUploading}
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={cn(
                                "group relative aspect-square rounded-lg border overflow-hidden cursor-move transition-all",
                                index === 0 && "col-span-2 row-span-2",
                                draggedImageIndex === index && "opacity-50 ring-2 ring-primary",
                                image.isUploading && "cursor-wait"
                            )}
                        >
                            <Image src={image.url} alt={image.alt} fill className="object-cover" />
                            {image.isUploading && (
                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                                </div>
                            )}
                            {!image.isUploading && (
                                <>
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="size-4 text-white" aria-hidden="true" />
                                    </div>
                                    {index === 0 && (
                                        <Badge className="absolute top-2 right-10 bg-primary text-primary-foreground text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                                            Main
                                        </Badge>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImage(image.id)}
                                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                                        aria-label="Remove image"
                                    >
                                        <X className="size-3.5" aria-hidden="true" />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                    {images.length < 10 && (
                        <label
                            className={cn(
                                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-primary hover:bg-muted/50",
                                images.length === 0 ? "aspect-video p-6" : "aspect-square",
                                isUploading && "pointer-events-none opacity-50"
                            )}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(e) => handleImageUpload(e.target.files)}
                                className="hidden"
                                disabled={isUploading}
                            />
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                <Plus className="size-4 text-muted-foreground" aria-hidden="true" />
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-medium">{images.length === 0 ? "Add images" : "Add more"}</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                            </div>
                        </label>
                    )}
                </div>
                <div className="mt-3 pt-3 border-t">
                    <Button variant="ghost" className="text-xs gap-1.5 text-muted-foreground" disabled>
                        <Link2 className="size-3.5" aria-hidden="true" />
                        Add from URL
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
