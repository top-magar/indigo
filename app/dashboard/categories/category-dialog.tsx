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
    GridIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createCategory, updateCategory } from "./actions";
import type { CategoryWithCount } from "./actions";
import type { Category } from "@/lib/supabase/types";

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: CategoryWithCount | null;
    categories: CategoryWithCount[];
    onSuccess: (category: Category, isNew: boolean) => void;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function CategoryDialog({ open, onOpenChange, category, categories, onSuccess }: CategoryDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    
    const [name, setName] = useState(category?.name || "");
    const [slug, setSlug] = useState(category?.slug || "");
    const [description, setDescription] = useState(category?.description || "");
    const [imageUrl, setImageUrl] = useState(category?.image_url || "");
    const [parentId, setParentId] = useState<string>(category?.parent_id || "none");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Get available parent categories (exclude self and descendants)
    const getAvailableParents = useCallback(() => {
        if (!category) return categories;
        
        const descendants = new Set<string>();
        const findDescendants = (id: string) => {
            descendants.add(id);
            categories.filter(c => c.parent_id === id).forEach(c => findDescendants(c.id));
        };
        findDescendants(category.id);
        
        return categories.filter(c => !descendants.has(c.id));
    }, [category, categories]);

    const availableParents = getAvailableParents();

    // Build parent path for display
    const getParentPath = (cat: CategoryWithCount): string => {
        const path: string[] = [];
        let current: CategoryWithCount | undefined = cat;
        while (current?.parent_id) {
            const parent = categories.find(c => c.id === current!.parent_id);
            if (parent) {
                path.unshift(parent.name);
                current = parent;
            } else {
                break;
            }
        }
        return path.length > 0 ? path.join(" → ") + " → " : "";
    };

    // Reset form when dialog opens/closes or category changes
    const resetForm = useCallback(() => {
        setName(category?.name || "");
        setSlug(category?.slug || "");
        setDescription(category?.description || "");
        setImageUrl(category?.image_url || "");
        setParentId(category?.parent_id || "none");
        setErrors({});
    }, [category]);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            resetForm();
        } else if (category) {
            // Populate form when opening with existing category
            setName(category.name);
            setSlug(category.slug);
            setDescription(category.description || "");
            setImageUrl(category.image_url || "");
            setParentId(category.parent_id || "none");
        }
        onOpenChange(newOpen);
    };

    const handleNameChange = (value: string) => {
        setName(value);
        if (!category) {
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
            newErrors.name = "Category name is required";
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
        formData.set("parentId", parentId === "none" ? "" : parentId);

        startTransition(async () => {
            try {
                if (category) {
                    formData.set("id", category.id);
                    const result = await updateCategory(formData);
                    if (result.error) {
                        toast.error(result.error);
                        return;
                    }
                    onSuccess(result.category!, false);
                    toast.success("Category updated");
                } else {
                    const result = await createCategory(formData);
                    if (result.error) {
                        toast.error(result.error);
                        return;
                    }
                    onSuccess(result.category!, true);
                    toast.success("Category created");
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
                        <HugeiconsIcon icon={GridIcon} className="w-5 h-5" />
                        {category ? "Edit Category" : "Create Category"}
                    </DialogTitle>
                    <DialogDescription>
                        {category
                            ? "Update category details"
                            : "Create a new category to organize your products"}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Category Image</Label>
                        <div className="flex items-start gap-4">
                            <div className="h-24 w-24 rounded-lg border-2 border-dashed overflow-hidden shrink-0">
                                {imageUrl ? (
                                    <div className="relative w-full h-full group">
                                        <Image
                                            src={imageUrl}
                                            alt="Category"
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
                                <p>Recommended: 400x400px</p>
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
                            placeholder="e.g. Electronics"
                            className={cn(errors.name && "border-destructive")}
                        />
                        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">/categories/</span>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                placeholder="electronics"
                                className={cn("font-mono", errors.slug && "border-destructive")}
                            />
                        </div>
                        {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
                    </div>

                    {/* Parent Category */}
                    <div className="space-y-2">
                        <Label>Parent Category</Label>
                        <Select value={parentId} onValueChange={setParentId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">
                                    <span className="text-muted-foreground">No parent (top-level)</span>
                                </SelectItem>
                                {availableParents.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        <span className="flex items-center gap-1">
                                            {cat.parent_id && (
                                                <span className="text-muted-foreground text-xs">
                                                    {getParentPath(cat)}
                                                </span>
                                            )}
                                            {cat.name}
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Nest this category under another to create a hierarchy
                        </p>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe this category..."
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Stats (edit mode only) */}
                    {category && (
                        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                            <p className="text-sm font-medium">Category Stats</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Products: </span>
                                    <span className="font-medium">{category.products_count}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Subcategories: </span>
                                    <span className="font-medium">{category.children_count}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? (
                            <>
                                <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
                                {category ? "Updating..." : "Creating..."}
                            </>
                        ) : (
                            <>
                                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                                {category ? "Update Category" : "Create Category"}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
