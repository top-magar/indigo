"use client";

import { useState, useCallback, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    Image01Icon,
    Add01Icon,
    Delete02Icon,
    PackageIcon,
    Money01Icon,
    Tag01Icon,
    DeliveryTruck01Icon,
    Search01Icon,
    Calendar03Icon,
    Cancel01Icon,
    Clock01Icon,
    DragDropVerticalIcon,
    CheckmarkCircle02Icon,
    AlertCircleIcon,
    FloppyDiskIcon,
    ViewIcon,
    Copy01Icon,
    Loading01Icon,
    FolderLibraryIcon,
    ArrowDown01Icon,
    ArrowUp01Icon,
    LinkSquare01Icon,
    SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { createProductWithDetails } from "../actions";

// Types
interface ProductImage {
    id: string;
    url: string;
    alt: string;
    position: number;
    isUploading?: boolean;
}

interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: string;
    compareAtPrice: string;
    quantity: string;
    weight: string;
}

interface Category {
    id: string;
    name: string;
    slug: string;
}

interface Collection {
    id: string;
    name: string;
    slug: string;
}

interface FormData {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    collectionIds: string[];
    brand: string;
    tags: string[];
    price: string;
    compareAtPrice: string;
    costPrice: string;
    sku: string;
    barcode: string;
    quantity: string;
    trackQuantity: boolean;
    allowBackorder: boolean;
    lowStockThreshold: string;
    weight: string;
    weightUnit: string;
    length: string;
    width: string;
    height: string;
    requiresShipping: boolean;
    images: ProductImage[];
    hasVariants: boolean;
    variants: ProductVariant[];
    metaTitle: string;
    metaDescription: string;
    status: "draft" | "active" | "archived";
    publishNow: boolean;
    publishDate: Date | undefined;
    publishTime: string;
}

interface FormErrors {
    [key: string]: string;
}

interface NewProductClientProps {
    categories: Category[];
    collections: Collection[];
}

// Collapsible section state
interface SectionState {
    basic: boolean;
    media: boolean;
    pricing: boolean;
    shipping: boolean;
    variants: boolean;
    seo: boolean;
}

const AUTOSAVE_KEY = "product_draft_autosave";
const AUTOSAVE_INTERVAL = 30000;

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

const initialFormData: FormData = {
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    collectionIds: [],
    brand: "",
    tags: [],
    price: "",
    compareAtPrice: "",
    costPrice: "",
    sku: "",
    barcode: "",
    quantity: "0",
    trackQuantity: true,
    allowBackorder: false,
    lowStockThreshold: "5",
    weight: "",
    weightUnit: "g",
    length: "",
    width: "",
    height: "",
    requiresShipping: true,
    images: [],
    hasVariants: false,
    variants: [{ id: generateId(), name: "Default", sku: "", price: "", compareAtPrice: "", quantity: "0", weight: "" }],
    metaTitle: "",
    metaDescription: "",
    status: "draft",
    publishNow: true,
    publishDate: undefined,
    publishTime: "09:00",
};

// Collapsible Section Component
function CollapsibleSection({
    title,
    icon,
    description,
    isOpen,
    onToggle,
    children,
    badge,
    iconColor = "muted",
}: {
    title: string;
    icon: typeof PackageIcon;
    description?: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    badge?: React.ReactNode;
    iconColor?: "primary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "muted";
}) {
    const colorClasses = {
        primary: "bg-primary/10 text-primary",
        "chart-1": "bg-chart-1/10 text-chart-1",
        "chart-2": "bg-chart-2/10 text-chart-2",
        "chart-3": "bg-chart-3/10 text-chart-3",
        "chart-4": "bg-chart-4/10 text-chart-4",
        "chart-5": "bg-chart-5/10 text-chart-5",
        muted: "bg-muted/50 text-muted-foreground",
    };

    return (
        <Collapsible open={isOpen} onOpenChange={onToggle}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn("h-9 w-9 rounded-lg flex items-center justify-center", colorClasses[iconColor])}>
                                    <HugeiconsIcon icon={icon} className="w-4 h-4" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-medium">{title}</CardTitle>
                                    {description && (
                                        <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {badge}
                                <HugeiconsIcon
                                    icon={isOpen ? ArrowUp01Icon : ArrowDown01Icon}
                                    className="w-4 h-4 text-muted-foreground transition-transform"
                                />
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0">{children}</CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

export function NewProductClient({ categories, collections }: NewProductClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [tagInput, setTagInput] = useState("");
    const [isDirty, setIsDirty] = useState(false);
    const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Collapsible sections state
    const [sections, setSections] = useState<SectionState>({
        basic: true,
        media: true,
        pricing: true,
        shipping: false,
        variants: false,
        seo: false,
    });

    const toggleSection = (section: keyof SectionState) => {
        setSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Load autosaved draft on mount
    useEffect(() => {
        const saved = localStorage.getItem(AUTOSAVE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.publishDate) {
                    parsed.publishDate = new Date(parsed.publishDate);
                }
                setFormData(parsed);
                setLastSaved(new Date());
                toast.info("Draft restored from autosave");
            } catch {
                localStorage.removeItem(AUTOSAVE_KEY);
            }
        }
    }, []);

    // Autosave effect
    useEffect(() => {
        if (!isDirty) return;
        const timer = setTimeout(() => {
            localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(formData));
            setLastSaved(new Date());
        }, AUTOSAVE_INTERVAL);
        return () => clearTimeout(timer);
    }, [formData, isDirty]);

    // Keyboard shortcut for save (Cmd+S / Ctrl+S)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") {
                e.preventDefault();
                handleSubmit(true);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [formData]);

    // Warn before leaving
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const updateField = useCallback(<K extends keyof FormData>(field: K, value: FormData[K]) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === "name" && typeof value === "string") {
                newData.slug = generateSlug(value);
            }
            return newData;
        });
        setIsDirty(true);
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    // Tag management
    const addTag = useCallback(() => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag) && formData.tags.length < 20) {
            updateField("tags", [...formData.tags, tag]);
            setTagInput("");
        }
    }, [tagInput, formData.tags, updateField]);

    const removeTag = useCallback((tagToRemove: string) => {
        updateField("tags", formData.tags.filter(t => t !== tagToRemove));
    }, [formData.tags, updateField]);

    // Collection management
    const toggleCollection = useCallback((collectionId: string) => {
        const newIds = formData.collectionIds.includes(collectionId)
            ? formData.collectionIds.filter(id => id !== collectionId)
            : [...formData.collectionIds, collectionId];
        updateField("collectionIds", newIds);
    }, [formData.collectionIds, updateField]);

    // Variant management
    const addVariant = useCallback(() => {
        if (formData.variants.length >= 100) {
            toast.error("Maximum 100 variants allowed");
            return;
        }
        updateField("variants", [
            ...formData.variants,
            { id: generateId(), name: "", sku: "", price: "", compareAtPrice: "", quantity: "0", weight: "" }
        ]);
    }, [formData.variants, updateField]);

    const removeVariant = useCallback((id: string) => {
        if (formData.variants.length > 1) {
            updateField("variants", formData.variants.filter(v => v.id !== id));
        }
    }, [formData.variants, updateField]);

    const updateVariant = useCallback((id: string, field: keyof ProductVariant, value: string) => {
        updateField("variants", formData.variants.map(v =>
            v.id === id ? { ...v, [field]: value } : v
        ));
    }, [formData.variants, updateField]);

    // Image upload handling
    const handleImageUpload = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const maxImages = 10 - formData.images.length;
        if (maxImages <= 0) {
            toast.error("Maximum 10 images allowed");
            return;
        }

        const filesToUpload = Array.from(files).slice(0, maxImages);
        setIsUploading(true);

        const placeholders: ProductImage[] = filesToUpload.map((file, index) => ({
            id: generateId(),
            url: URL.createObjectURL(file),
            alt: file.name,
            position: formData.images.length + index,
            isUploading: true,
        }));

        updateField("images", [...formData.images, ...placeholders]);

        try {
            const uploadPromises = filesToUpload.map(async (file, index) => {
                const formDataUpload = new FormData();
                formDataUpload.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formDataUpload,
                });

                if (!response.ok) throw new Error("Upload failed");

                const data = await response.json();
                return {
                    id: placeholders[index].id,
                    url: data.url,
                    alt: file.name.replace(/\.[^/.]+$/, ""),
                    position: formData.images.length + index,
                };
            });

            const uploadedImages = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                images: prev.images.map(img => {
                    const uploaded = uploadedImages.find(u => u.id === img.id);
                    return uploaded ? { ...uploaded, isUploading: false } : img;
                }),
            }));

            toast.success(`${uploadedImages.length} image(s) uploaded`);
        } catch {
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter(img => !img.isUploading),
            }));
            toast.error("Failed to upload image(s)");
        } finally {
            setIsUploading(false);
        }
    }, [formData.images, updateField]);

    const removeImage = useCallback((id: string) => {
        updateField("images", formData.images.filter(img => img.id !== id).map((img, index) => ({
            ...img,
            position: index,
        })));
    }, [formData.images, updateField]);

    const handleDragStart = useCallback((index: number) => {
        setDraggedImageIndex(index);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedImageIndex === null || draggedImageIndex === index) return;

        const newImages = [...formData.images];
        const draggedImage = newImages[draggedImageIndex];
        newImages.splice(draggedImageIndex, 1);
        newImages.splice(index, 0, draggedImage);

        const reorderedImages = newImages.map((img, i) => ({ ...img, position: i }));
        updateField("images", reorderedImages);
        setDraggedImageIndex(index);
    }, [draggedImageIndex, formData.images, updateField]);

    const handleDragEnd = useCallback(() => {
        setDraggedImageIndex(null);
    }, []);

    const handleFileDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        handleImageUpload(files);
    }, [handleImageUpload]);

    // Validation
    const validateForm = useCallback((): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Product name is required";
        }

        if (!formData.price || parseFloat(formData.price) < 0) {
            newErrors.price = "Valid price is required";
        }

        if (formData.compareAtPrice && parseFloat(formData.compareAtPrice) <= parseFloat(formData.price)) {
            newErrors.compareAtPrice = "Compare price must be higher than price";
        }

        if (formData.metaTitle && formData.metaTitle.length > 60) {
            newErrors.metaTitle = "Meta title should be under 60 characters";
        }

        if (formData.metaDescription && formData.metaDescription.length > 160) {
            newErrors.metaDescription = "Meta description should be under 160 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Form submission
    const handleSubmit = useCallback(async (asDraft: boolean = false) => {
        if (!validateForm()) {
            toast.error("Please fix the errors before submitting");
            return;
        }

        const status = asDraft ? "draft" : formData.status === "draft" ? "active" : formData.status;

        const submitData = new FormData();
        submitData.set("name", formData.name);
        submitData.set("slug", formData.slug || generateSlug(formData.name));
        submitData.set("description", formData.description);
        submitData.set("categoryId", formData.categoryId);
        submitData.set("collectionIds", JSON.stringify(formData.collectionIds));
        submitData.set("brand", formData.brand);
        submitData.set("tags", JSON.stringify(formData.tags));
        submitData.set("price", formData.price);
        submitData.set("compareAtPrice", formData.compareAtPrice);
        submitData.set("costPrice", formData.costPrice);
        submitData.set("sku", formData.sku);
        submitData.set("barcode", formData.barcode);
        submitData.set("quantity", formData.quantity);
        submitData.set("trackQuantity", String(formData.trackQuantity));
        submitData.set("allowBackorder", String(formData.allowBackorder));
        submitData.set("lowStockThreshold", formData.lowStockThreshold);
        submitData.set("weight", formData.weight);
        submitData.set("weightUnit", formData.weightUnit);
        submitData.set("length", formData.length);
        submitData.set("width", formData.width);
        submitData.set("height", formData.height);
        submitData.set("requiresShipping", String(formData.requiresShipping));
        submitData.set("images", JSON.stringify(formData.images.filter(img => !img.isUploading)));
        submitData.set("hasVariants", String(formData.hasVariants));
        submitData.set("variants", JSON.stringify(formData.variants));
        submitData.set("metaTitle", formData.metaTitle);
        submitData.set("metaDescription", formData.metaDescription);
        submitData.set("status", status);

        if (!formData.publishNow && formData.publishDate) {
            const publishAt = new Date(formData.publishDate);
            const [hours, minutes] = formData.publishTime.split(":").map(Number);
            publishAt.setHours(hours, minutes, 0, 0);
            submitData.set("publishAt", publishAt.toISOString());
        }

        startTransition(async () => {
            try {
                const result = await createProductWithDetails(submitData);
                
                if (result.error) {
                    toast.error(result.error);
                    return;
                }

                localStorage.removeItem(AUTOSAVE_KEY);
                setIsDirty(false);

                toast.success(asDraft ? "Draft saved successfully" : "Product created successfully");
                router.push("/dashboard/products");
            } catch {
                toast.error("Failed to create product");
            }
        });
    }, [formData, validateForm, router]);

    const handleNavigation = useCallback((href: string) => {
        if (isDirty) {
            setPendingNavigation(href);
            setShowUnsavedDialog(true);
        } else {
            router.push(href);
        }
    }, [isDirty, router]);

    const clearDraft = useCallback(() => {
        localStorage.removeItem(AUTOSAVE_KEY);
        setFormData(initialFormData);
        setIsDirty(false);
        setLastSaved(null);
        toast.success("Draft cleared");
    }, []);

    const profitMargin = formData.price && formData.costPrice
        ? (((parseFloat(formData.price) - parseFloat(formData.costPrice)) / parseFloat(formData.price)) * 100).toFixed(1)
        : null;

    const seoPreviewUrl = `yourstore.com/products/${formData.slug || "product-name"}`;

    // Calculate completion percentage
    const completionItems = [
        !!formData.name,
        !!formData.price,
        formData.images.length > 0,
        !!formData.description,
        !!formData.categoryId,
    ];
    const completionPercentage = Math.round((completionItems.filter(Boolean).length / completionItems.length) * 100);

    return (
        <TooltipProvider>
            <>
                {/* Sticky Header with Actions */}
                <div className="sticky top-0 z-40 -mx-6 -mt-6 mb-6 bg-background/95 backdrop-blur-sm border-b">
                    <div className="max-w-6xl mx-auto px-6 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            type="button"
                                            onClick={() => handleNavigation("/dashboard/products")}
                                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                                            aria-label="Back to products"
                                        >
                                            <HugeiconsIcon icon={ArrowLeft01Icon} className="w-5 h-5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Back to products</TooltipContent>
                                </Tooltip>
                                <div>
                                    <h1 className="text-lg font-semibold">Add product</h1>
                                    <div className="flex items-center gap-2">
                                        {lastSaved && (
                                            <span className="text-xs text-muted-foreground">
                                                Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                        {isDirty && !lastSaved && (
                                            <span className="text-xs text-muted-foreground">Unsaved changes</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isDirty && (
                                    <Button variant="ghost" size="sm" onClick={clearDraft} className="text-muted-foreground">
                                        Discard
                                    </Button>
                                )}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleSubmit(true)}
                                            disabled={isPending}
                                        >
                                            <HugeiconsIcon icon={FloppyDiskIcon} className="w-4 h-4 mr-1.5" />
                                            Save draft
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>⌘S</TooltipContent>
                                </Tooltip>
                                <Button
                                    size="sm"
                                    onClick={() => handleSubmit(false)}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-1.5 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create product"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto space-y-6 pb-24">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Basic Information - Always Open */}
                            <Card>
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-chart-1/10 flex items-center justify-center">
                                            <HugeiconsIcon icon={PackageIcon} className="w-4 h-4 text-chart-1" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-medium">Basic information</CardTitle>
                                            <CardDescription className="text-xs">Product title and description</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Title <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => updateField("name", e.target.value)}
                                            placeholder="Short sleeve t-shirt"
                                            className={cn(errors.name && "border-destructive")}
                                            aria-invalid={!!errors.name}
                                        />
                                        {errors.name && (
                                            <p className="text-xs text-destructive flex items-center gap-1">
                                                <HugeiconsIcon icon={AlertCircleIcon} className="w-3 h-3" />
                                                {errors.name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => updateField("description", e.target.value)}
                                            placeholder="Describe your product..."
                                            className="min-h-[100px] resize-none"
                                            maxLength={5000}
                                        />
                                        <div className="flex items-center justify-between">
                                            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground">
                                                <HugeiconsIcon icon={SparklesIcon} className="w-3 h-3" />
                                                Generate with AI
                                            </Button>
                                            <span className="text-xs text-muted-foreground">
                                                {formData.description.length}/5000
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Media Section */}
                            <CollapsibleSection
                                title="Media"
                                icon={Image01Icon}
                                iconColor="chart-5"
                                description="Product images and videos"
                                isOpen={sections.media}
                                onToggle={() => toggleSection("media")}
                                badge={formData.images.length > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                        {formData.images.length} image{formData.images.length !== 1 ? "s" : ""}
                                    </Badge>
                                )}
                            >
                                <div
                                    className={cn(
                                        "grid gap-3",
                                        formData.images.length === 0
                                            ? "grid-cols-1"
                                            : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                                    )}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleFileDrop}
                                >
                                    {formData.images.map((image, index) => (
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
                                            <Image
                                                src={image.url}
                                                alt={image.alt}
                                                fill
                                                className="object-cover"
                                            />
                                            {image.isUploading && (
                                                <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                    <HugeiconsIcon icon={Loading01Icon} className="w-5 h-5 animate-spin" />
                                                </div>
                                            )}
                                            {!image.isUploading && (
                                                <>
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                                                    <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <HugeiconsIcon icon={DragDropVerticalIcon} className="w-4 h-4 text-white" />
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
                                                        <HugeiconsIcon icon={Cancel01Icon} className="w-3 h-3" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    ))}

                                    {formData.images.length < 10 && (
                                        <label
                                            className={cn(
                                                "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-primary hover:bg-muted/50",
                                                formData.images.length === 0
                                                    ? "aspect-video p-6"
                                                    : "aspect-square",
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
                                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                <HugeiconsIcon icon={Add01Icon} className="w-5 h-5 text-muted-foreground" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-medium">
                                                    {formData.images.length === 0 ? "Add images" : "Add more"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    PNG, JPG up to 5MB
                                                </p>
                                            </div>
                                        </label>
                                    )}
                                </div>
                                
                                {/* Add from URL option */}
                                <div className="mt-3 pt-3 border-t">
                                    <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground">
                                        <HugeiconsIcon icon={LinkSquare01Icon} className="w-3 h-3" />
                                        Add from URL
                                    </Button>
                                </div>
                            </CollapsibleSection>

                            {/* Pricing & Inventory Combined */}
                            <CollapsibleSection
                                title="Pricing & inventory"
                                icon={Money01Icon}
                                iconColor="chart-2"
                                description="Set prices and manage stock"
                                isOpen={sections.pricing}
                                onToggle={() => toggleSection("pricing")}
                                badge={formData.price && (
                                    <Badge variant="secondary" className="text-xs font-mono">
                                        Rs {formData.price}
                                    </Badge>
                                )}
                            >
                                <div className="space-y-6">
                                    {/* Pricing */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium">Pricing</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="price">
                                                    Price <span className="text-destructive">*</span>
                                                </Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rs</span>
                                                    <Input
                                                        id="price"
                                                        type="number"
                                                        value={formData.price}
                                                        onChange={(e) => updateField("price", e.target.value)}
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                        className={cn("pl-10", errors.price && "border-destructive")}
                                                    />
                                                </div>
                                                {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="compareAtPrice">Compare at price</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rs</span>
                                                    <Input
                                                        id="compareAtPrice"
                                                        type="number"
                                                        value={formData.compareAtPrice}
                                                        onChange={(e) => updateField("compareAtPrice", e.target.value)}
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                        className={cn("pl-10", errors.compareAtPrice && "border-destructive")}
                                                    />
                                                </div>
                                                {errors.compareAtPrice && <p className="text-xs text-destructive">{errors.compareAtPrice}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="costPrice">Cost per item</Label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rs</span>
                                                    <Input
                                                        id="costPrice"
                                                        type="number"
                                                        value={formData.costPrice}
                                                        onChange={(e) => updateField("costPrice", e.target.value)}
                                                        placeholder="0.00"
                                                        min="0"
                                                        step="0.01"
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {profitMargin && (
                                            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-chart-2/10 border border-chart-2/20">
                                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-chart-2" />
                                                <span className="text-sm">
                                                    Profit margin: <span className="font-semibold text-chart-2">{profitMargin}%</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Inventory */}
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium">Inventory</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sku">SKU</Label>
                                                <Input
                                                    id="sku"
                                                    value={formData.sku}
                                                    onChange={(e) => updateField("sku", e.target.value)}
                                                    placeholder="GS-001"
                                                    className="font-mono"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="barcode">Barcode</Label>
                                                <Input
                                                    id="barcode"
                                                    value={formData.barcode}
                                                    onChange={(e) => updateField("barcode", e.target.value)}
                                                    placeholder="ISBN, UPC, etc."
                                                    className="font-mono"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="quantity">Quantity</Label>
                                                <Input
                                                    id="quantity"
                                                    type="number"
                                                    value={formData.quantity}
                                                    onChange={(e) => updateField("quantity", e.target.value)}
                                                    min="0"
                                                    disabled={!formData.trackQuantity}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                                <div>
                                                    <Label htmlFor="trackQuantity" className="text-sm">Track inventory</Label>
                                                    <p className="text-xs text-muted-foreground">Keep track of stock levels</p>
                                                </div>
                                                <Switch
                                                    id="trackQuantity"
                                                    checked={formData.trackQuantity}
                                                    onCheckedChange={(v) => updateField("trackQuantity", v)}
                                                />
                                            </div>
                                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                                <div>
                                                    <Label htmlFor="allowBackorder" className="text-sm">Continue selling when out of stock</Label>
                                                    <p className="text-xs text-muted-foreground">Allow backorders</p>
                                                </div>
                                                <Switch
                                                    id="allowBackorder"
                                                    checked={formData.allowBackorder}
                                                    onCheckedChange={(v) => updateField("allowBackorder", v)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>

                            {/* Variants Section */}
                            <CollapsibleSection
                                title="Variants"
                                icon={Copy01Icon}
                                iconColor="chart-1"
                                description="Add options like size or color"
                                isOpen={sections.variants}
                                onToggle={() => toggleSection("variants")}
                                badge={
                                    <Switch
                                        checked={formData.hasVariants}
                                        onCheckedChange={(v) => {
                                            updateField("hasVariants", v);
                                            if (v) setSections(prev => ({ ...prev, variants: true }));
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                }
                            >
                                {formData.hasVariants ? (
                                    <div className="space-y-3">
                                        {formData.variants.map((variant, index) => (
                                            <div key={variant.id} className="p-3 rounded-lg border bg-muted/20 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-medium text-muted-foreground">Variant {index + 1}</span>
                                                    {formData.variants.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeVariant(variant.id)}
                                                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                        >
                                                            <HugeiconsIcon icon={Delete02Icon} className="w-3.5 h-3.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Name</Label>
                                                        <Input
                                                            placeholder="e.g. Large, Red"
                                                            value={variant.name}
                                                            onChange={(e) => updateVariant(variant.id, "name", e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">SKU</Label>
                                                        <Input
                                                            placeholder="GS-001-L"
                                                            className="h-8 text-sm font-mono"
                                                            value={variant.sku}
                                                            onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Price (Rs)</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="h-8 text-sm"
                                                            value={variant.price}
                                                            onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Stock</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            className="h-8 text-sm"
                                                            value={variant.quantity}
                                                            onChange={(e) => updateVariant(variant.id, "quantity", e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" onClick={addVariant} className="w-full">
                                            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-1.5" />
                                            Add variant
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Enable variants to add options like size, color, or material.
                                    </p>
                                )}
                            </CollapsibleSection>

                            {/* Shipping Section */}
                            <CollapsibleSection
                                title="Shipping"
                                icon={DeliveryTruck01Icon}
                                iconColor="chart-4"
                                description="Weight and dimensions"
                                isOpen={sections.shipping}
                                onToggle={() => toggleSection("shipping")}
                                badge={
                                    <Badge variant={formData.requiresShipping ? "secondary" : "outline"} className="text-xs">
                                        {formData.requiresShipping ? "Physical" : "Digital"}
                                    </Badge>
                                }
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                        <div>
                                            <Label htmlFor="requiresShipping" className="text-sm">Physical product</Label>
                                            <p className="text-xs text-muted-foreground">This product requires shipping</p>
                                        </div>
                                        <Switch
                                            id="requiresShipping"
                                            checked={formData.requiresShipping}
                                            onCheckedChange={(v) => updateField("requiresShipping", v)}
                                        />
                                    </div>

                                    {formData.requiresShipping && (
                                        <>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="weight">Weight</Label>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            id="weight"
                                                            type="number"
                                                            value={formData.weight}
                                                            onChange={(e) => updateField("weight", e.target.value)}
                                                            placeholder="0"
                                                            min="0"
                                                            className="flex-1"
                                                        />
                                                        <Select value={formData.weightUnit} onValueChange={(v) => updateField("weightUnit", v)}>
                                                            <SelectTrigger className="w-20">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="g">g</SelectItem>
                                                                <SelectItem value="kg">kg</SelectItem>
                                                                <SelectItem value="lb">lb</SelectItem>
                                                                <SelectItem value="oz">oz</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <Label className="mb-2 block text-sm">Dimensions (cm)</Label>
                                                <div className="grid grid-cols-3 gap-3 max-w-md">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Length</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.length}
                                                            onChange={(e) => updateField("length", e.target.value)}
                                                            placeholder="0"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Width</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.width}
                                                            onChange={(e) => updateField("width", e.target.value)}
                                                            placeholder="0"
                                                            min="0"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">Height</Label>
                                                        <Input
                                                            type="number"
                                                            value={formData.height}
                                                            onChange={(e) => updateField("height", e.target.value)}
                                                            placeholder="0"
                                                            min="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CollapsibleSection>

                            {/* SEO Section */}
                            <CollapsibleSection
                                title="Search engine listing"
                                icon={Search01Icon}
                                iconColor="chart-3"
                                description="Optimize for search engines"
                                isOpen={sections.seo}
                                onToggle={() => toggleSection("seo")}
                            >
                                <div className="space-y-4">
                                    {/* SEO Preview */}
                                    <div className="p-3 rounded-lg border bg-white dark:bg-muted/20">
                                        <p className="text-xs text-chart-1 truncate">{seoPreviewUrl}</p>
                                        <p className="text-base text-primary font-medium mt-0.5 truncate">
                                            {formData.metaTitle || formData.name || "Product Name"} - Your Store
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                                            {formData.metaDescription || formData.description || "Product description will appear here."}
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="metaTitle">Page title</Label>
                                            <span className={cn(
                                                "text-xs",
                                                formData.metaTitle.length > 60 ? "text-destructive" : "text-muted-foreground"
                                            )}>
                                                {formData.metaTitle.length}/60
                                            </span>
                                        </div>
                                        <Input
                                            id="metaTitle"
                                            value={formData.metaTitle}
                                            onChange={(e) => updateField("metaTitle", e.target.value)}
                                            placeholder={formData.name || "Product name - Your Store"}
                                            maxLength={70}
                                            className={cn(errors.metaTitle && "border-destructive")}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="metaDescription">Meta description</Label>
                                            <span className={cn(
                                                "text-xs",
                                                formData.metaDescription.length > 160 ? "text-destructive" : "text-muted-foreground"
                                            )}>
                                                {formData.metaDescription.length}/160
                                            </span>
                                        </div>
                                        <Textarea
                                            id="metaDescription"
                                            value={formData.metaDescription}
                                            onChange={(e) => updateField("metaDescription", e.target.value)}
                                            placeholder="A brief description for search engines..."
                                            className={cn("min-h-[80px] resize-none", errors.metaDescription && "border-destructive")}
                                            maxLength={170}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="slug">URL handle</Label>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-6 text-xs"
                                                onClick={() => updateField("slug", generateSlug(formData.name))}
                                            >
                                                Generate
                                            </Button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-sm text-muted-foreground shrink-0">/products/</span>
                                            <Input
                                                id="slug"
                                                value={formData.slug}
                                                onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                                                placeholder="product-name"
                                                className="font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CollapsibleSection>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-4">
                            {/* Status Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Select
                                        value={formData.status}
                                        onValueChange={(v: "draft" | "active" | "archived") => updateField("status", v)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                                                    Draft
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="active">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-chart-2" />
                                                    Active
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="archived">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-destructive" />
                                                    Archived
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Separator />

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-sm">Publish immediately</Label>
                                            <Switch
                                                checked={formData.publishNow}
                                                onCheckedChange={(checked) => {
                                                    updateField("publishNow", checked);
                                                    if (checked) updateField("publishDate", undefined);
                                                }}
                                            />
                                        </div>

                                        {!formData.publishNow && (
                                            <div className="space-y-2 pt-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Date</Label>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="outline" size="sm" className="w-full justify-start text-left font-normal h-8">
                                                                    <HugeiconsIcon icon={Calendar03Icon} className="w-3.5 h-3.5 mr-1.5" />
                                                                    {formData.publishDate ? (
                                                                        formData.publishDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                                                    ) : (
                                                                        <span className="text-muted-foreground">Pick</span>
                                                                    )}
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={formData.publishDate}
                                                                    onSelect={(date) => updateField("publishDate", date)}
                                                                    disabled={(date) => date < new Date()}
                                                                    initialFocus
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Time</Label>
                                                        <Input
                                                            type="time"
                                                            value={formData.publishTime}
                                                            onChange={(e) => updateField("publishTime", e.target.value)}
                                                            className="h-8"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Organization Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-medium">Organization</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={formData.categoryId} onValueChange={(v) => updateField("categoryId", v)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.length === 0 ? (
                                                    <div className="p-3 text-center">
                                                        <p className="text-xs text-muted-foreground mb-2">No categories</p>
                                                        <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                                                            <Link href="/dashboard/categories/new">Create</Link>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    categories.map(cat => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="brand">Brand</Label>
                                        <Input
                                            id="brand"
                                            value={formData.brand}
                                            onChange={(e) => updateField("brand", e.target.value)}
                                            placeholder="e.g. Nike"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Collections Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">Collections</CardTitle>
                                        {formData.collectionIds.length > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {formData.collectionIds.length}
                                            </Badge>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {collections.length === 0 ? (
                                        <div className="text-center py-3">
                                            <p className="text-xs text-muted-foreground mb-2">No collections</p>
                                            <Button size="sm" variant="outline" asChild className="h-7 text-xs">
                                                <Link href="/dashboard/collections/new">Create</Link>
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-1 max-h-[160px] overflow-y-auto">
                                            {collections.map(collection => (
                                                <label
                                                    key={collection.id}
                                                    className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors"
                                                >
                                                    <Checkbox
                                                        checked={formData.collectionIds.includes(collection.id)}
                                                        onCheckedChange={() => toggleCollection(collection.id)}
                                                    />
                                                    <span className="text-sm">{collection.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Tags Card */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">Tags</CardTitle>
                                        <span className="text-xs text-muted-foreground">{formData.tags.length}/20</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex gap-2">
                                        <Input
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            placeholder="Add tag..."
                                            className="h-8"
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    e.preventDefault();
                                                    addTag();
                                                }
                                            }}
                                        />
                                        <Button type="button" variant="outline" size="sm" onClick={addTag} className="h-8 w-8 p-0">
                                            <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    {formData.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {formData.tags.map(tag => (
                                                <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-0.5 p-0.5 rounded hover:bg-muted"
                                                    >
                                                        <HugeiconsIcon icon={Cancel01Icon} className="w-2.5 h-2.5" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Preview Card */}
                            {formData.name && (
                                <Card className="bg-muted/30 border-dashed">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                                            <HugeiconsIcon icon={ViewIcon} className="w-3.5 h-3.5" />
                                            Preview
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        {formData.images[0] && (
                                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                                                <Image
                                                    src={formData.images[0].url}
                                                    alt={formData.images[0].alt}
                                                    width={200}
                                                    height={200}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-medium text-sm truncate">{formData.name}</p>
                                            {formData.categoryId && (
                                                <p className="text-xs text-muted-foreground">
                                                    {categories.find(c => c.id === formData.categoryId)?.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="font-bold">Rs {formData.price || "0"}</span>
                                            {formData.compareAtPrice && (
                                                <span className="text-xs text-muted-foreground line-through">
                                                    Rs {formData.compareAtPrice}
                                                </span>
                                            )}
                                        </div>
                                        {formData.trackQuantity && (
                                            <p className="text-xs text-muted-foreground">{formData.quantity} in stock</p>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Completion Progress */}
                            <Card className="bg-muted/30">
                                <CardContent className="pt-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium">Completion</span>
                                        <span className="text-xs text-muted-foreground">{completionPercentage}%</span>
                                    </div>
                                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-300"
                                            style={{ width: `${completionPercentage}%` }}
                                        />
                                    </div>
                                    <div className="mt-2 space-y-1">
                                        {[
                                            { done: !!formData.name, label: "Add title" },
                                            { done: !!formData.price, label: "Set price" },
                                            { done: formData.images.length > 0, label: "Add images" },
                                            { done: !!formData.description, label: "Add description" },
                                            { done: !!formData.categoryId, label: "Select category" },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs">
                                                <HugeiconsIcon
                                                    icon={item.done ? CheckmarkCircle02Icon : AlertCircleIcon}
                                                    className={cn("w-3 h-3", item.done ? "text-chart-2" : "text-muted-foreground")}
                                                />
                                                <span className={item.done ? "text-muted-foreground line-through" : ""}>
                                                    {item.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Mobile Footer */}
                <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-3 lg:hidden z-50">
                    <div className="flex gap-2 max-w-6xl mx-auto">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleNavigation("/dashboard/products")}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            className="flex-1"
                            onClick={() => handleSubmit(false)}
                            disabled={isPending}
                        >
                            {isPending ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </div>

                {/* Unsaved Changes Dialog */}
                <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
                            <AlertDialogDescription>
                                You have unsaved changes. Do you want to save them as a draft before leaving?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => {
                                setShowUnsavedDialog(false);
                                setPendingNavigation(null);
                            }}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                variant="outline"
                                onClick={() => {
                                    localStorage.removeItem(AUTOSAVE_KEY);
                                    if (pendingNavigation) router.push(pendingNavigation);
                                }}
                            >
                                Discard
                            </AlertDialogAction>
                            <AlertDialogAction onClick={() => {
                                handleSubmit(true);
                                if (pendingNavigation) router.push(pendingNavigation);
                            }}>
                                Save Draft
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        </TooltipProvider>
    );
}
