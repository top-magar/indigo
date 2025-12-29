"use client";

import { useState, useCallback, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Image01Icon,
    Add01Icon,
    Cancel01Icon,
    Loading01Icon,
    FolderLibraryIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { createCollection, updateCollection } from "./actions";
import type { Collection } from "@/lib/supabase/types";

interface CollectionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    collection: Collection | null;
    onSuccess: (collection: Collection, isNew: boolean) => void;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function CollectionDialog({ open, onOpenChange, collection, onSuccess }: CollectionDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    
    const [name, setName] = useState(collection?.name || "");
    const [slug, setSlug] = useState(collection?.slug || "");
    const [description, setDescription] = useState(collection?.description || "");
    const [imageUrl, setImageUrl] = useState(collection?.image_url || "");
    const [isActive, setIsActive] = useState(collection?.is_active ?? true);
    const [type, setType] = useState<"manual" | "automatic">(collection?.type || "manual");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when dialog opens/closes or collection changes
    const resetForm = useCallback(() => {
        setName(collection?.name || "");
        setSlug(collection?.slug || "");
        setDescription(collection?.description || "");
        setImageUrl(collection?.image_url || "");
        setIsActive(collection?.is_active ?? true);
        setType(collection?.type || "manual");
        setErrors({});
    }, [collection]);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetForm();
        }
        onOpenChange(newOpen);
    };

    const handleNameChange = (value: string) => {
        setName(value);
        if (!collection) {
            setSlug(generateSlug(value));
        }
        if (errors.name) {
            setErrors(prev => ({ ...prev, name: "" }));
        }
    };

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
            setImageUrl(data.url);
            toast.success("Image uploaded");
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        
        if (!name.trim()) {
            newErrors.name = "Collection name is required";
        }
        
        if (!slug.trim()) {
            newErrors.slug = "URL slug is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const formData = new FormData();
        formData.set("name", name);
        formData.set("slug", slug);
        formData.set("description", description);
        formData.set("imageUrl", imageUrl);
        formData.set("isActive", String(isActive));
        formData.set("type", type);

        startTransition(async () => {
            try {
                if (collection) {
                    formData.set("id", collection.id);
                    const result = await updateCollection(formData);
                    if (result.error) {
                        toast.error(result.error);
                        return;
                    }
                    onSuccess(result.collection!, false);
                    toast.success("Collection updated");
                } else {
                    const result = await createCollection(formData);
                    if (result.error) {
                        toast.error(result.error);
                        return;
                    }
                    onSuccess(result.collection!, true);
                    toast.success("Collection created");
                }
                handleOpenChange(false);
            } catch {
                toast.error("Something went wrong");
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={FolderLibraryIcon} className="w-5 h-5" />
                        {collection ? "Edit Collection" : "Create Collection"}
                    </DialogTitle>
                    <DialogDescription>
                        {collection
                            ? "Update collection details"
                            : "Create a new collection to organize your products"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Collection Image</Label>
                        <div className="flex items-start gap-4">
                            <div className="h-24 w-24 rounded-lg border-2 border-dashed overflow-hidden flex-shrink-0">
                                {imageUrl ? (
                                    <div className="relative w-full h-full group">
                                        <Image
                                            src={imageUrl}
                                            alt="Collection"
                                            fill
                                            className="object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setImageUrl("")}
                                            className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            disabled={isUploading}
                                        />
                                        {isUploading ? (
                                            <HugeiconsIcon icon={Loading01Icon} className="w-6 h-6 animate-spin text-muted-foreground" />
                                        ) : (
                                            <>
                                                <HugeiconsIcon icon={Image01Icon} className="w-6 h-6 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground mt-1">Upload</span>
                                            </>
                                        )}
                                    </label>
                                )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                <p>Recommended: 800x800px</p>
                                <p>Max size: 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="e.g. Summer Sale"
                            className={cn(errors.name && "border-destructive")}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">/collections/</span>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                placeholder="summer-sale"
                                className={cn("font-mono", errors.slug && "border-destructive")}
                            />
                        </div>
                        {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe this collection..."
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Type */}
                    <div className="space-y-2">
                        <Label>Collection Type</Label>
                        <Select value={type} onValueChange={(v: "manual" | "automatic") => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="manual">Manual - Add products manually</SelectItem>
                                <SelectItem value="automatic">Automatic - Based on conditions</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                            <Label htmlFor="isActive">Active</Label>
                            <p className="text-sm text-muted-foreground">Show this collection on your store</p>
                        </div>
                        <Switch
                            id="isActive"
                            checked={isActive}
                            onCheckedChange={setIsActive}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? (
                            <>
                                <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
                                {collection ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            <>
                                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                                {collection ? "Update Collection" : "Create Collection"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
