"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
    Image as ImageIcon,
    X,
    Loader2,
    Grid3x3,
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    FolderOpen,
    Layers,
    Info,
    Search,
    Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/shared/utils";
import { createCategory, updateCategory } from "./actions";
import type { CategoryWithCount } from "./actions";
import type { Category } from "@/infrastructure/supabase/types";

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

const STEPS = [
    { id: 1, title: "Basic Info", description: "Name and hierarchy" },
    { id: 2, title: "Details", description: "Image and description" },
];

export function CategoryDialog({ open, onOpenChange, category, categories, onSuccess }: CategoryDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState(1);
    
    // Form state
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [parentId, setParentId] = useState<string | null>(null);
    const [parentSearch, setParentSearch] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form when dialog opens
    useEffect(() => {
        if (open) {
            if (category) {
                setName(category.name);
                setSlug(category.slug);
                setDescription(category.description || "");
                setImageUrl(category.image_url || "");
                setParentId(category.parent_id);
            } else {
                resetForm();
            }
        }
    }, [open, category]);

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

    // Filter parents by search
    const filteredParents = parentSearch
        ? availableParents.filter(c => 
            c.name.toLowerCase().includes(parentSearch.toLowerCase()) ||
            c.slug.toLowerCase().includes(parentSearch.toLowerCase())
          )
        : availableParents;

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
        return path.length > 0 ? path.join(" → ") : "";
    };

    const getParentLevel = (cat: CategoryWithCount): number => {
        let level = 0;
        let current: CategoryWithCount | undefined = cat;
        while (current?.parent_id) {
            level++;
            current = categories.find(c => c.id === current!.parent_id);
        }
        return level;
    };

    const resetForm = useCallback(() => {
        setStep(1);
        setName("");
        setSlug("");
        setDescription("");
        setImageUrl("");
        setParentId(null);
        setParentSearch("");
        setErrors({});
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onOpenChange(false);
    }, [resetForm, onOpenChange]);

    const handleNameChange = (value: string) => {
        setName(value);
        if (!category && !slug) {
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
        if (!validate()) {
            setStep(1);
            return;
        }

        const formData = new FormData();
        formData.set("name", name);
        formData.set("slug", slug);
        formData.set("description", description);
        formData.set("imageUrl", imageUrl);
        formData.set("parentId", parentId || "");

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
                handleClose();
            } catch {
                toast.error("Something went wrong");
            }
        });
    };

    const canProceed = step === 1 ? name.trim() && slug.trim() : true;
    const selectedParent = parentId ? categories.find(c => c.id === parentId) : null;

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                onClick={handleClose}
            />
            
            {/* Slide-over Panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl animate-in slide-in-from-right duration-300">
                <div className="flex h-full flex-col bg-background shadow-2xl">
                    {/* Header */}
                    <div className="border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Grid3x3 className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {category ? "Edit Category" : "Create Category"}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Step {step} of {STEPS.length}: {STEPS[step - 1].description}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleClose}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        {/* Progress Steps */}
                        <div className="mt-4 flex items-center gap-2">
                            {STEPS.map((s, i) => (
                                <div key={s.id} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => s.id < step && setStep(s.id)}
                                        disabled={s.id > step}
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                                            step > s.id
                                                ? "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90"
                                                : step === s.id
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        {step > s.id ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            s.id
                                        )}
                                    </button>
                                    {i < STEPS.length - 1 && (
                                        <div
                                            className={cn(
                                                "mx-2 h-0.5 w-12 transition-colors",
                                                step > s.id ? "bg-primary" : "bg-muted"
                                            )}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Step 1: Basic Info */}
                        {step === 1 && (
                            <div className="space-y-6">
                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Category Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="e.g., Electronics, Clothing, Home & Garden"
                                        className={cn("h-11", errors.name && "border-destructive")}
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                                    <p className="text-xs text-muted-foreground">
                                        This will be displayed to customers in your store
                                    </p>
                                </div>

                                {/* Slug */}
                                <div className="space-y-2">
                                    <Label htmlFor="slug">
                                        URL Slug <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground shrink-0">/categories/</span>
                                        <Input
                                            id="slug"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                            placeholder="electronics"
                                            className={cn("h-11 font-mono text-sm", errors.slug && "border-destructive")}
                                        />
                                    </div>
                                    {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
                                </div>

                                {/* Parent Category */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <Label>Parent Category</Label>
                                        {selectedParent && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setParentId(null)}
                                                className="h-7 text-xs"
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </div>
                                    
                                    {/* Selected Parent Preview */}
                                    {selectedParent ? (
                                        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted overflow-hidden shrink-0">
                                                {selectedParent.image_url ? (
                                                    <Image
                                                        src={selectedParent.image_url}
                                                        alt={selectedParent.name}
                                                        width={40}
                                                        height={40}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FolderOpen className="h-5 w-5 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium truncate">{selectedParent.name}</p>
                                                {getParentPath(selectedParent) && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {getParentPath(selectedParent)}
                                                    </p>
                                                )}
                                            </div>
                                            <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                                                <Layers className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-muted-foreground">No parent (top-level)</p>
                                                <p className="text-xs text-muted-foreground">
                                                    This will be a root category
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Parent Search */}
                                    {availableParents.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="relative">
                                                <Search
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                                                />
                                                <Input
                                                    value={parentSearch}
                                                    onChange={(e) => setParentSearch(e.target.value)}
                                                    placeholder="Search categories..."
                                                    className="pl-9 h-10"
                                                />
                                            </div>
                                            
                                            {/* Parent List */}
                                            <div className="max-h-48 overflow-y-auto rounded-lg border divide-y">
                                                {filteredParents.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        No categories found
                                                    </div>
                                                ) : (
                                                    filteredParents.map((cat) => {
                                                        const level = getParentLevel(cat);
                                                        const isSelected = parentId === cat.id;
                                                        return (
                                                            <button
                                                                key={cat.id}
                                                                type="button"
                                                                onClick={() => setParentId(isSelected ? null : cat.id)}
                                                                className={cn(
                                                                    "w-full flex items-center gap-3 p-3 text-left transition-colors",
                                                                    "hover:bg-accent/50",
                                                                    isSelected && "bg-primary/5"
                                                                )}
                                                                style={{ paddingLeft: `${12 + level * 16}px` }}
                                                            >
                                                                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted overflow-hidden shrink-0">
                                                                    {cat.image_url ? (
                                                                        <Image
                                                                            src={cat.image_url}
                                                                            alt={cat.name}
                                                                            width={32}
                                                                            height={32}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <FolderOpen className="h-4 w-4 text-muted-foreground" />
                                                                    )}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className={cn("text-sm font-medium truncate", isSelected && "text-primary")}>
                                                                        {cat.name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        {cat.products_count} products
                                                                    </p>
                                                                </div>
                                                                {isSelected && (
                                                                    <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="rounded-lg border p-4 space-y-3">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        Summary
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Name</p>
                                            <p className="font-medium">{name}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Slug</p>
                                            <p className="font-mono text-xs">{slug}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground">Parent</p>
                                            <p className="font-medium">
                                                {selectedParent ? selectedParent.name : "None (top-level)"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-3">
                                    <Label>Category Image</Label>
                                    <div className="flex items-start gap-4">
                                        <div className="h-32 w-32 rounded-xl border-2 border-dashed overflow-hidden shrink-0 bg-muted/30">
                                            {imageUrl ? (
                                                <div className="relative w-full h-full group">
                                                    <Image
                                                        src={imageUrl}
                                                        alt="Category"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setImageUrl("")}
                                                        >
                                                            <X className="w-4 h-4 mr-1" />
                                                            Remove
                                                        </Button>
                                                    </div>
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
                                                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <>
                                                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                                                            <span className="text-sm text-muted-foreground mt-2">Upload image</span>
                                                        </>
                                                    )}
                                                </label>
                                            )}
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-1">
                                            <p>Recommended: 800x800px</p>
                                            <p>Max size: 5MB</p>
                                            <p>Formats: JPG, PNG, WebP</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe this category to help customers understand what products they'll find here..."
                                        className="resize-none min-h-[100px]"
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This description may be shown on category pages in your store
                                    </p>
                                </div>

                                {/* Stats (edit mode only) */}
                                {category && (
                                    <div className="rounded-lg bg-muted/50 p-4 space-y-3">
                                        <h3 className="font-medium flex items-center gap-2">
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                            Category Stats
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-chart-2/10 flex items-center justify-center">
                                                    <Package className="h-4 w-4 text-chart-2" />
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Products</p>
                                                    <p className="font-semibold">{category.products_count}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-lg bg-chart-4/10 flex items-center justify-center">
                                                    <Layers className="h-4 w-4 text-chart-4" />
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground text-xs">Subcategories</p>
                                                    <p className="font-semibold">{category.children_count}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-6 py-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                {step > 1 ? "Back" : "Cancel"}
                            </Button>
                            
                            {step < 2 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!canProceed}
                                >
                                    Continue
                                    <ChevronRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isPending || !name.trim()}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            {category ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            {category ? "Update Category" : "Create Category"}
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
