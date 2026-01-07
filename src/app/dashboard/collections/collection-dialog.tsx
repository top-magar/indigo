"use client";

import { useState, useCallback, useTransition, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Image01Icon,
    Cancel01Icon,
    Loading01Icon,
    FolderLibraryIcon,
    ArrowRight01Icon,
    ArrowLeft01Icon,
    CheckmarkCircle02Icon,
    InformationCircleIcon,
    TextIcon,
    Settings02Icon,
    Tick01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/shared/utils";
import { createCollection, updateCollection } from "./actions";
import type { Collection } from "@/infrastructure/supabase/types";

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

const STEPS = [
    { id: 1, title: "Basic Info", description: "Name and type" },
    { id: 2, title: "Details", description: "Image and settings" },
];

const COLLECTION_TYPES = [
    {
        value: "manual" as const,
        label: "Manual Collection",
        description: "Add products manually to this collection",
        icon: Tick01Icon,
    },
    {
        value: "automatic" as const,
        label: "Automatic Collection",
        description: "Products are added based on conditions",
        icon: Settings02Icon,
    },
];

export function CollectionDialog({ open, onOpenChange, collection, onSuccess }: CollectionDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);
    const [step, setStep] = useState(1);
    
    // Form state
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [type, setType] = useState<"manual" | "automatic">("manual");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Initialize form when dialog opens
    useEffect(() => {
        if (open) {
            if (collection) {
                setName(collection.name);
                setSlug(collection.slug);
                setDescription(collection.description || "");
                setImageUrl(collection.image_url || "");
                setIsActive(collection.is_active ?? true);
                setType(collection.type || "manual");
            } else {
                resetForm();
            }
        }
    }, [open, collection]);

    const resetForm = useCallback(() => {
        setStep(1);
        setName("");
        setSlug("");
        setDescription("");
        setImageUrl("");
        setIsActive(true);
        setType("manual");
        setErrors({});
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onOpenChange(false);
    }, [resetForm, onOpenChange]);

    const handleNameChange = (value: string) => {
        setName(value);
        if (!collection && !slug) {
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
        if (!validate()) {
            setStep(1);
            return;
        }

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
                handleClose();
            } catch {
                toast.error("Something went wrong");
            }
        });
    };

    const canProceed = step === 1 ? name.trim() && slug.trim() : true;
    const selectedType = COLLECTION_TYPES.find(t => t.value === type);

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
                                    <HugeiconsIcon icon={FolderLibraryIcon} className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {collection ? "Edit Collection" : "Create Collection"}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Step {step} of {STEPS.length}: {STEPS[step - 1].description}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleClose}>
                                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
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
                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
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
                                        Collection Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => handleNameChange(e.target.value)}
                                        placeholder="e.g., Summer Sale, New Arrivals, Best Sellers"
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
                                        <span className="text-sm text-muted-foreground shrink-0">/collections/</span>
                                        <Input
                                            id="slug"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                            placeholder="summer-sale"
                                            className={cn("h-11 font-mono text-sm", errors.slug && "border-destructive")}
                                        />
                                    </div>
                                    {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
                                </div>

                                {/* Collection Type */}
                                <div className="space-y-3">
                                    <Label>Collection Type</Label>
                                    <div className="grid gap-3">
                                        {COLLECTION_TYPES.map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => setType(t.value)}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-lg border text-left transition-all",
                                                    "hover:border-primary/50 hover:bg-accent/50",
                                                    type === t.value
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                        : "border-border"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                                                        type === t.value ? "bg-primary text-primary-foreground" : "bg-muted"
                                                    )}
                                                >
                                                    <HugeiconsIcon icon={t.icon} className="h-5 w-5" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className={cn("font-medium", type === t.value && "text-primary")}>
                                                        {t.label}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{t.description}</p>
                                                </div>
                                                {type === t.value && (
                                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-primary shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="rounded-lg border p-4 space-y-3">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 text-muted-foreground" />
                                        Summary
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Name</p>
                                            <p className="font-medium">{name}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Type</p>
                                            <p className="font-medium">{selectedType?.label}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-muted-foreground">Slug</p>
                                            <p className="font-mono text-xs">/collections/{slug}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-3">
                                    <Label>Collection Image</Label>
                                    <div className="flex items-start gap-4">
                                        <div className="h-32 w-32 rounded-xl border-2 border-dashed overflow-hidden shrink-0 bg-muted/30">
                                            {imageUrl ? (
                                                <div className="relative w-full h-full group">
                                                    <Image
                                                        src={imageUrl}
                                                        alt="Collection"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => setImageUrl("")}
                                                        >
                                                            <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-1" />
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
                                                        <HugeiconsIcon icon={Loading01Icon} className="w-8 h-8 animate-spin text-muted-foreground" />
                                                    ) : (
                                                        <>
                                                            <HugeiconsIcon icon={Image01Icon} className="w-8 h-8 text-muted-foreground" />
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
                                        placeholder="Describe this collection to help customers understand what products they'll find here..."
                                        className="resize-none min-h-[100px]"
                                        rows={4}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This description may be shown on collection pages in your store
                                    </p>
                                </div>

                                {/* Settings */}
                                <div className="space-y-4 pt-4 border-t">
                                    <h3 className="font-medium">Settings</h3>
                                    
                                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Active</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Show this collection on your store
                                            </p>
                                        </div>
                                        <Switch checked={isActive} onCheckedChange={setIsActive} />
                                    </div>
                                </div>

                                {/* Info about next steps */}
                                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                                    <p className="font-medium mb-1">Next Steps</p>
                                    <p className="text-muted-foreground">
                                        After creating this collection, you&apos;ll be able to add products
                                        {type === "automatic" && " and set up automatic rules"}.
                                    </p>
                                </div>
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
                                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                                {step > 1 ? "Back" : "Cancel"}
                            </Button>
                            
                            {step < 2 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!canProceed}
                                >
                                    Continue
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isPending || !name.trim()}
                                >
                                    {isPending ? (
                                        <>
                                            <HugeiconsIcon icon={Loading01Icon} className="h-4 w-4 mr-2 animate-spin" />
                                            {collection ? "Updating..." : "Creating..."}
                                        </>
                                    ) : (
                                        <>
                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 mr-2" />
                                            {collection ? "Update Collection" : "Create Collection"}
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
