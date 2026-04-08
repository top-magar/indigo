"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    ImageIcon,
    Plus,
    Trash2,
    Package,
    Search,
    X,
    GripVertical,
    CheckCircle,
    AlertCircle,
    Save,
    Eye,
    Loader2,
    Link2,
    ChevronRight,
    ChevronLeft,
    FolderOpen,
    Layers,
    Truck,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Stepper,
    StepperItem,
    StepperTrigger,
    StepperIndicator,
    StepperTitle,
    StepperSeparator,
} from "@/components/ui/stepper";
import { cn } from "@/shared/utils";
import type { Category, Collection, WizardStep } from "./types";
import { ProductSidebar } from "./_components/product-sidebar";
import { generateSlug, STEP_LABELS, AUTOSAVE_KEY } from "./types";
import { useProductForm } from "./use-product-form";

export function NewProductClient({ categories, collections }: { categories: Category[]; collections: Collection[] }) {
    const {
        formData, errors, tagInput, isDirty, showUnsavedDialog, pendingNavigation,
        lastSaved, isUploading, draggedImageIndex, fileInputRef,
        isPending, seoPreviewUrl, completionPercentage,
        currentStep,
        setFormData, setTagInput, setShowUnsavedDialog, setPendingNavigation,
        updateField, addTag, removeTag, toggleCollection,
        addOption, removeOption, updateOptionTitle, updateOptionValues,
        updateVariant, toggleAllVariants,
        handleImageUpload, removeImage, handleDragStart, handleDragOver, handleDragEnd, handleFileDrop,
        handleSubmit, handleNavigation, clearDraft,
        goToNextStep, goToPrevStep, goToStep,
        router,
    } = useProductForm();

    const [optionValueInputs, setOptionValueInputs] = useState<Record<string, string>>({});

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
    }, [handleSubmit]);

    const errorEntries = Object.entries(errors).filter(([, v]) => v);
    const errorSummaryRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (errorEntries.length > 0 && errorSummaryRef.current) {
            errorSummaryRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [errorEntries.length]);

    const isLastStep = currentStep === 2;

    const addOptionValue = (optionId: string) => {
        const raw = optionValueInputs[optionId]?.trim();
        if (!raw) return;
        const option = formData.options.find(o => o.id === optionId);
        if (!option) return;
        const newValues = raw.split(",").map(v => v.trim()).filter(v => v && !option.values.includes(v));
        if (newValues.length > 0) {
            updateOptionValues(optionId, [...option.values, ...newValues]);
        }
        setOptionValueInputs(prev => ({ ...prev, [optionId]: "" }));
    };

    const removeOptionValue = (optionId: string, value: string) => {
        const option = formData.options.find(o => o.id === optionId);
        if (!option) return;
        updateOptionValues(optionId, option.values.filter(v => v !== value));
    };

    return (
        <TooltipProvider>
            <>
                {/* Sticky Header */}
                <div className="sticky top-0 z-40 -mx-6 -mt-6 mb-6 bg-background border-b">
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
                                            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Back to products</TooltipContent>
                                </Tooltip>
                                <div>
                                    <h1 className="text-xl font-semibold tracking-[-0.4px]">Add product</h1>
                                    <div className="flex items-center gap-2" aria-live="polite">
                                        {lastSaved && (
                                            <span className="text-xs text-muted-foreground">
                                                Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                                    <Button variant="ghost" onClick={clearDraft} className="text-muted-foreground">
                                        Discard
                                    </Button>
                                )}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isPending}>
                                            <Save className="w-4 h-4 mr-1.5" aria-hidden="true" />
                                            Save draft
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>⌘S</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto space-y-3 pb-4">
                    {/* Step Indicator */}
                    <Stepper value={currentStep} onValueChange={(v) => goToStep(v as WizardStep)} className="mb-2">
                        {STEP_LABELS.map((label, index) => (
                            <StepperItem key={label} step={index} completed={index < currentStep}>
                                <StepperTrigger>
                                    <StepperIndicator />
                                    <StepperTitle className="hidden sm:block">{label}</StepperTitle>
                                </StepperTrigger>
                                {index < STEP_LABELS.length - 1 && <StepperSeparator />}
                            </StepperItem>
                        ))}
                    </Stepper>

                    {/* Error Summary */}
                    {errorEntries.length > 0 && (
                        <div
                            ref={errorSummaryRef}
                            className="p-3 rounded-lg border border-destructive/30 bg-destructive/5"
                            role="alert"
                            aria-live="assertive"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-destructive" aria-hidden="true" />
                                <span className="text-sm font-medium text-destructive">
                                    {errorEntries.length} {errorEntries.length === 1 ? "error" : "errors"} found
                                </span>
                            </div>
                            <ul className="space-y-0.5 ml-6">
                                {errorEntries.map(([key, msg]) => (
                                    <li key={key} className="text-xs text-destructive">{msg}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-4">

                            {/* ===== STEP 0: Details ===== */}
                            {currentStep === 0 && (
                                <>
                                    {/* Basic Information */}
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                                    <Package className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-medium">General information</CardTitle>
                                                    <CardDescription className="text-xs">Title, subtitle, and description</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                        autoFocus
                                                    />
                                                    {errors.name && (
                                                        <p className="text-xs text-destructive flex items-center gap-1">
                                                            <AlertCircle className="w-3 h-3" aria-hidden="true" />
                                                            {errors.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="subtitle">Subtitle</Label>
                                                    <Input
                                                        id="subtitle"
                                                        value={formData.subtitle}
                                                        onChange={(e) => updateField("subtitle", e.target.value)}
                                                        placeholder="Comfortable everyday wear"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="slug">Handle</Label>
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
                                                        placeholder="short-sleeve-t-shirt"
                                                        className="font-mono"
                                                    />
                                                </div>
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
                                                    <span className="text-xs text-muted-foreground">
                                                        {formData.description.length}/5000
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Media */}
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                                    <ImageIcon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-medium">Media</CardTitle>
                                                    <CardDescription className="text-xs">Product images</CardDescription>
                                                </div>
                                                {formData.images.length > 0 && (
                                                    <Badge variant="secondary" className="text-xs ml-auto">
                                                        {formData.images.length}/10
                                                    </Badge>
                                                )}
                                            </div>
                                        </CardHeader>
                                        <CardContent>
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
                                                        <Image src={image.url} alt={image.alt} fill className="object-cover" />
                                                        {image.isUploading && (
                                                            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                                                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                                                            </div>
                                                        )}
                                                        {!image.isUploading && (
                                                            <>
                                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                                                                <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <GripVertical className="w-4 h-4 text-white" aria-hidden="true" />
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
                                                                    <X className="w-3 h-3" aria-hidden="true" />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                ))}

                                                {formData.images.length < 10 && (
                                                    <label
                                                        className={cn(
                                                            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-all hover:border-primary hover:bg-muted/50",
                                                            formData.images.length === 0 ? "aspect-video p-6" : "aspect-square",
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
                                                            <Plus className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-sm font-medium">
                                                                {formData.images.length === 0 ? "Add images" : "Add more"}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                                                        </div>
                                                    </label>
                                                )}
                                            </div>

                                            <div className="mt-3 pt-3 border-t">
                                                <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground" disabled>
                                                    <Link2 className="w-3 h-3" aria-hidden="true" />
                                                    Add from URL
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Product Options (defines variant dimensions) */}
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                                        <Layers className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-sm font-medium">Product options</CardTitle>
                                                        <CardDescription className="text-xs">
                                                            Does this product have options like size or color?
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <Switch
                                                    checked={formData.hasVariants}
                                                    onCheckedChange={(v) => {
                                                        updateField("hasVariants", v);
                                                        if (v && (!formData.options || formData.options.length === 0)) {
                                                            addOption();
                                                        }
                                                    }}
                                                    aria-label="Enable product variants"
                                                />
                                            </div>
                                        </CardHeader>
                                        {formData.hasVariants && (
                                            <CardContent className="space-y-4">
                                                {formData.options.map((option, optIndex) => (
                                                    <div key={option.id} className="p-3 rounded-lg border space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-muted-foreground">
                                                                Option {optIndex + 1}
                                                            </span>
                                                            {formData.options.length > 1 && (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => removeOption(option.id)}
                                                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                                    aria-label={`Remove option ${optIndex + 1}`}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">Option title</Label>
                                                            <Input
                                                                placeholder="e.g. Color, Size, Material"
                                                                value={option.title}
                                                                onChange={(e) => updateOptionTitle(option.id, e.target.value)}
                                                                className="h-8 text-sm"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs">Values (comma-separated)</Label>
                                                            <div className="flex gap-2">
                                                                <Input
                                                                    placeholder="e.g. Black, White, Red"
                                                                    value={optionValueInputs[option.id] || ""}
                                                                    onChange={(e) => setOptionValueInputs(prev => ({ ...prev, [option.id]: e.target.value }))}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            e.preventDefault();
                                                                            addOptionValue(option.id);
                                                                        }
                                                                    }}
                                                                    className="h-8 text-sm"
                                                                />
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => addOptionValue(option.id)}
                                                                    aria-label="Add values"
                                                                >
                                                                    <Plus className="w-4 h-4" aria-hidden="true" />
                                                                </Button>
                                                            </div>
                                                            {option.values.length > 0 && (
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {option.values.map(val => (
                                                                        <Badge key={val} variant="secondary" className="gap-1 pr-1 text-xs">
                                                                            {val}
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => removeOptionValue(option.id, val)}
                                                                                className="ml-0.5 p-1.5 rounded hover:bg-muted"
                                                                                aria-label={`Remove ${val}`}
                                                                            >
                                                                                <X className="w-2.5 h-2.5" aria-hidden="true" />
                                                                            </button>
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {formData.options.length < 5 && (
                                                    <Button type="button" size="sm" variant="outline" onClick={addOption} className="w-full">
                                                        <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
                                                        Add another option
                                                    </Button>
                                                )}
                                                {formData.variants.length > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        {formData.variants.length} variant{formData.variants.length !== 1 ? "s" : ""} will be generated.
                                                        Configure pricing and inventory in step 3.
                                                    </p>
                                                )}
                                            </CardContent>
                                        )}
                                    </Card>
                                </>
                            )}

                            {/* ===== STEP 1: Organize ===== */}
                            {currentStep === 1 && (
                                <>
                                    {/* Organization */}
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                                    <FolderOpen className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-medium">Organization</CardTitle>
                                                    <CardDescription className="text-xs">Category, collections, and tags</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                                                    <Button variant="outline" asChild>
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
                                            </div>

                                            {/* Collections */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>Collections</Label>
                                                    {formData.collectionIds.length > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {formData.collectionIds.length}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {collections.length === 0 ? (
                                                    <div className="text-center py-3 border rounded-lg">
                                                        <p className="text-xs text-muted-foreground mb-2">No collections</p>
                                                        <Button variant="outline" asChild>
                                                            <Link href="/dashboard/collections/new">Create</Link>
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1 max-h-[160px] overflow-y-auto border rounded-lg p-2">
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
                                            </div>

                                            {/* Tags */}
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label>Tags</Label>
                                                    <span className="text-xs text-muted-foreground">{formData.tags.length}/20</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        placeholder="Add a tag..."
                                                        className="flex-1"
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                e.preventDefault();
                                                                addTag();
                                                            }
                                                        }}
                                                    />
                                                    <Button type="button" variant="outline" size="sm" aria-label="Add tag" onClick={addTag}>
                                                        <Plus className="w-4 h-4" aria-hidden="true" />
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
                                                                    className="ml-0.5 p-1.5 rounded hover:bg-muted"
                                                                    aria-label={`Remove tag ${tag}`}
                                                                >
                                                                    <X className="w-2.5 h-2.5" aria-hidden="true" />
                                                                </button>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Discountable toggle */}
                                            <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                                <div>
                                                    <Label htmlFor="discountable" className="text-sm">Discountable</Label>
                                                    <p className="text-xs text-muted-foreground">Allow discounts to be applied</p>
                                                </div>
                                                <Switch
                                                    id="discountable"
                                                    checked={formData.discountable}
                                                    onCheckedChange={(v) => updateField("discountable", v)}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Shipping */}
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                                        <Truck className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-sm font-medium">Shipping</CardTitle>
                                                        <CardDescription className="text-xs">Physical product settings</CardDescription>
                                                    </div>
                                                </div>
                                                <Badge variant={formData.requiresShipping ? "secondary" : "outline"} className="text-xs">
                                                    {formData.requiresShipping ? "Physical" : "Digital"}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
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
                                                            <SelectTrigger className="w-20" aria-label="Weight unit">
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
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* SEO */}
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                                    <Search className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-medium">Search engine listing</CardTitle>
                                                    <CardDescription className="text-xs">Optimize for search engines</CardDescription>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="p-3 rounded-lg border bg-background">
                                                <p className="text-xs text-primary truncate">{seoPreviewUrl}</p>
                                                <p className="text-sm text-primary font-medium mt-0.5 truncate">
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
                                                    className="min-h-[80px] resize-none"
                                                    maxLength={170}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}

                            {/* ===== STEP 2: Variants (Bulk Editor) ===== */}
                            {currentStep === 2 && (
                                <>
                                    <Card>
                                        <CardHeader className="pb-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                                        <Layers className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-sm font-medium">
                                                            Pricing &amp; inventory
                                                            <Badge variant="secondary" className="ml-2 text-xs">
                                                                {formData.variants.filter(v => v.enabled).length}/{formData.variants.length}
                                                            </Badge>
                                                        </CardTitle>
                                                        <CardDescription className="text-xs">
                                                            Set pricing and inventory for each variant
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={formData.variants.every(v => v.enabled)}
                                                        onCheckedChange={(checked) => toggleAllVariants(!!checked)}
                                                        aria-label="Toggle all variants"
                                                    />
                                                    <span className="text-xs text-muted-foreground">All</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            {errors.variants && (
                                                <p className="text-xs text-destructive flex items-center gap-1 mb-3">
                                                    <AlertCircle className="w-3 h-3" aria-hidden="true" />
                                                    {errors.variants}
                                                </p>
                                            )}
                                            <div className="overflow-x-auto -mx-4 px-4">
                                                <table className="w-full text-sm" role="grid">
                                                    <thead>
                                                        <tr className="border-b text-left">
                                                            <th className="pb-2 pr-2 w-8" />
                                                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground min-w-[120px]">Variant</th>
                                                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground min-w-[100px]">SKU</th>
                                                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground min-w-[100px]">Price (Rs)</th>
                                                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground min-w-[100px]">Compare</th>
                                                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground min-w-[80px]">Stock</th>
                                                            <th className="pb-2 pr-3 text-xs font-medium text-muted-foreground w-[60px]">Inventory</th>
                                                            <th className="pb-2 text-xs font-medium text-muted-foreground w-[60px]">Backorder</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {formData.variants.map((variant) => (
                                                            <tr
                                                                key={variant.id}
                                                                className={cn(
                                                                    "border-b last:border-0 transition-colors",
                                                                    !variant.enabled && "opacity-40"
                                                                )}
                                                            >
                                                                <td className="py-2 pr-2">
                                                                    <Checkbox
                                                                        checked={variant.enabled}
                                                                        onCheckedChange={(checked) => updateVariant(variant.id, "enabled", !!checked)}
                                                                        aria-label={`Enable ${variant.title}`}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-3">
                                                                    <span className="text-sm font-medium truncate block max-w-[140px]">
                                                                        {variant.title}
                                                                    </span>
                                                                </td>
                                                                <td className="py-2 pr-3">
                                                                    <Input
                                                                        value={variant.sku}
                                                                        onChange={(e) => updateVariant(variant.id, "sku", e.target.value)}
                                                                        placeholder="SKU"
                                                                        className="h-8 text-xs font-mono"
                                                                        disabled={!variant.enabled}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-3">
                                                                    <Input
                                                                        type="number"
                                                                        value={variant.price}
                                                                        onChange={(e) => updateVariant(variant.id, "price", e.target.value)}
                                                                        placeholder="0.00"
                                                                        min="0"
                                                                        step="0.01"
                                                                        className="h-8 text-xs font-mono tabular-nums"
                                                                        disabled={!variant.enabled}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-3">
                                                                    <Input
                                                                        type="number"
                                                                        value={variant.compareAtPrice}
                                                                        onChange={(e) => updateVariant(variant.id, "compareAtPrice", e.target.value)}
                                                                        placeholder="0.00"
                                                                        min="0"
                                                                        step="0.01"
                                                                        className="h-8 text-xs font-mono tabular-nums"
                                                                        disabled={!variant.enabled}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-3">
                                                                    <Input
                                                                        type="number"
                                                                        value={variant.quantity}
                                                                        onChange={(e) => updateVariant(variant.id, "quantity", e.target.value)}
                                                                        min="0"
                                                                        className="h-8 text-xs font-mono tabular-nums"
                                                                        disabled={!variant.enabled}
                                                                    />
                                                                </td>
                                                                <td className="py-2 pr-3 text-center">
                                                                    <Switch
                                                                        checked={variant.manageInventory}
                                                                        onCheckedChange={(v) => updateVariant(variant.id, "manageInventory", v)}
                                                                        disabled={!variant.enabled}
                                                                        aria-label="Manage inventory"
                                                                        className="scale-75"
                                                                    />
                                                                </td>
                                                                <td className="py-2 text-center">
                                                                    <Switch
                                                                        checked={variant.allowBackorder}
                                                                        onCheckedChange={(v) => updateVariant(variant.id, "allowBackorder", v)}
                                                                        disabled={!variant.enabled}
                                                                        aria-label="Allow backorder"
                                                                        className="scale-75"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                        <ProductSidebar
                            formData={formData}
                            updateField={updateField as (field: string, value: any) => void}
                            completionPercentage={completionPercentage}
                            goToStep={goToStep}
                            lastSaved={lastSaved}
                            isDirty={isDirty}
                            clearDraft={clearDraft}
                            seoPreviewUrl={seoPreviewUrl}
                            categories={categories}
                        />
                    </div>
                </div>

                {/* Bottom Savebar (Saleor pattern per products.md) */}
                <div className="sticky bottom-0 z-40 -mx-6 mt-4 bg-background border-t">
                    <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {currentStep > 0 && (
                                <Button variant="outline" size="sm" onClick={goToPrevStep}>
                                    <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
                                    Back
                                </Button>
                            )}
                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                Step {currentStep + 1} of {STEP_LABELS.length}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleNavigation("/dashboard/products")}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            {isLastStep ? (
                                <Button
                                    size="sm"
                                    onClick={() => handleSubmit(false)}
                                    disabled={isPending}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" aria-hidden="true" />
                                            Publishing...
                                        </>
                                    ) : (
                                        "Publish product"
                                    )}
                                </Button>
                            ) : (
                                <Button size="sm" onClick={goToNextStep}>
                                    Continue
                                    <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
                                </Button>
                            )}
                        </div>
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
