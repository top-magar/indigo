import Image from "next/image";
import { ImagePlus, X, GripVertical, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
        <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">Photos</h2>
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
                            "group relative aspect-square rounded-lg border overflow-hidden cursor-move transition-colors",
                            index === 0 && "col-span-2 row-span-2",
                            draggedImageIndex === index && "opacity-50 ring-2 ring-primary",
                            image.isUploading && "cursor-wait"
                        )}
                    >
                        <Image src={image.url} alt={image.alt} fill className="object-cover" />
                        {image.isUploading && (
                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Loader2 className="size-5 animate-spin" />
                            </div>
                        )}
                        {!image.isUploading && (
                            <>
                                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors" />
                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripVertical className="size-4 text-primary-foreground" />
                                </div>
                                {index === 0 && (
                                    <Badge className="absolute top-2 right-10 bg-primary text-primary-foreground text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">Main</Badge>
                                )}
                                <button type="button" onClick={() => removeImage(image.id)} className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90" aria-label="Remove image">
                                    <X className="size-3.5" />
                                </button>
                            </>
                        )}
                    </div>
                ))}
                {images.length < 10 && (
                    <label className={cn(
                        "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-all hover:border-primary/50 hover:bg-muted/30",
                        images.length === 0 ? "h-52" : "aspect-square",
                        isUploading && "pointer-events-none opacity-50"
                    )}>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={(e) => handleImageUpload(e.target.files)} className="hidden" disabled={isUploading} />
                        <ImagePlus className="size-8 text-muted-foreground/50" strokeWidth={1.5} />
                        <div className="text-center">
                            <p className="text-sm font-medium">{images.length === 0 ? "Drop photos here" : "Add more"}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{images.length === 0 ? "or click to browse · PNG, JPG up to 5MB" : "PNG, JPG up to 5MB"}</p>
                        </div>
                        {images.length > 0 && <span className="text-[10px] text-muted-foreground">{images.length}/10</span>}
                    </label>
                )}
            </div>
        </div>
    );
}
