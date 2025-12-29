"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
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
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { generateSlug } from "@/lib/validations/index";
import { createCategory, updateCategory } from "./actions";
import type { CategoryWithCount } from "./actions";
import type { Category } from "@/lib/supabase/types";

interface CategoryFormData {
    name: string;
    slug: string;
    description: string;
    parent_id: string | null;
    image_url: string | null;
}

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: CategoryWithCount | null;
    categories: CategoryWithCount[];
    onSuccess: (category: Category, isNew: boolean) => void;
}

export function CategoryDialogV2({
    open,
    onOpenChange,
    category,
    categories,
    onSuccess,
}: CategoryDialogProps) {
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<CategoryFormData>({
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            parent_id: null,
            image_url: null,
        },
    });

    const { isSubmitting, isDirty } = form.formState;

    // Reset form when dialog opens with category data
    useEffect(() => {
        if (open) {
            if (category) {
                form.reset({
                    name: category.name,
                    slug: category.slug,
                    description: category.description || "",
                    parent_id: category.parent_id || null,
                    image_url: category.image_url || null,
                });
            } else {
                form.reset({
                    name: "",
                    slug: "",
                    description: "",
                    parent_id: null,
                    image_url: null,
                });
            }
        }
    }, [open, category, form]);

    // Get available parent categories (exclude self and descendants)
    const getAvailableParents = useCallback(() => {
        if (!category) return categories;

        const descendants = new Set<string>();
        const findDescendants = (id: string) => {
            descendants.add(id);
            categories.filter((c) => c.parent_id === id).forEach((c) => findDescendants(c.id));
        };
        findDescendants(category.id);

        return categories.filter((c) => !descendants.has(c.id));
    }, [category, categories]);

    const availableParents = getAvailableParents();

    // Build parent path for display
    const getParentPath = (cat: CategoryWithCount): string => {
        const path: string[] = [];
        let current: CategoryWithCount | undefined = cat;
        while (current?.parent_id) {
            const parent = categories.find((c) => c.id === current!.parent_id);
            if (parent) {
                path.unshift(parent.name);
                current = parent;
            } else {
                break;
            }
        }
        return path.length > 0 ? path.join(" → ") + " → " : "";
    };

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        form.setValue("name", value);
        if (!category) {
            form.setValue("slug", generateSlug(value));
        }
    };

    // Handle image upload
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
            form.setValue("image_url", data.url);
            toast.success("Image uploaded");
        } catch {
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    // Handle form submission
    const onSubmit = async (data: CategoryFormData) => {
        const formData = new FormData();
        formData.set("name", data.name);
        formData.set("slug", data.slug);
        formData.set("description", data.description || "");
        formData.set("imageUrl", data.image_url || "");
        formData.set("parentId", data.parent_id || "");

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
            onOpenChange(false);
        } catch {
            toast.error("Something went wrong");
        }
    };

    const imageUrl = form.watch("image_url");

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                        {/* Image Upload */}
                        <FormField
                            control={form.control}
                            name="image_url"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category Image</FormLabel>
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
                                                        onClick={() => field.onChange(null)}
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
                                                        <HugeiconsIcon
                                                            icon={Loading01Icon}
                                                            className="w-6 h-6 animate-spin text-muted-foreground"
                                                        />
                                                    ) : (
                                                        <>
                                                            <HugeiconsIcon
                                                                icon={Image01Icon}
                                                                className="w-6 h-6 text-muted-foreground"
                                                            />
                                                            <span className="text-xs text-muted-foreground mt-1">
                                                                Upload
                                                            </span>
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
                                </FormItem>
                            )}
                        />

                        {/* Name */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name <span className="text-destructive">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g. Electronics"
                                            {...field}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Slug */}
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>URL Slug</FormLabel>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground">/categories/</span>
                                        <FormControl>
                                            <Input
                                                placeholder="electronics"
                                                className="font-mono"
                                                {...field}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-")
                                                    )
                                                }
                                            />
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Parent Category */}
                        <FormField
                            control={form.control}
                            name="parent_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Category</FormLabel>
                                    <Select
                                        value={field.value || "none"}
                                        onValueChange={(value) =>
                                            field.onChange(value === "none" ? null : value)
                                        }
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select parent category" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                <span className="text-muted-foreground">
                                                    No parent (top-level)
                                                </span>
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
                                    <FormDescription>
                                        Nest this category under another to create a hierarchy
                                    </FormDescription>
                                </FormItem>
                            )}
                        />

                        {/* Description */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe this category..."
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

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

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <HugeiconsIcon
                                            icon={Loading01Icon}
                                            className="w-4 h-4 mr-2 animate-spin"
                                        />
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
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
