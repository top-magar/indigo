"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft, Plus, Trash2, Package, Search, X,
    AlertCircle, Save, Loader2, Layers, FolderOpen, Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";
import type { Category, Collection } from "./types";
import { generateSlug, AUTOSAVE_KEY } from "./types";
import { useProductForm } from "./use-product-form";
import { ProductSidebar } from "./_components/product-sidebar";
import { MediaSection } from "./_components/media-section";
import { VariantTable } from "./_components/variant-table";

export function NewProductClient({ categories, collections }: { categories: Category[]; collections: Collection[] }) {
    const {
        formData, errors, tagInput, isDirty, showUnsavedDialog, pendingNavigation,
        lastSaved, isUploading, draggedImageIndex, fileInputRef,
        isPending, seoPreviewUrl, completionPercentage,
        setFormData, setTagInput, setShowUnsavedDialog, setPendingNavigation,
        updateField, addTag, removeTag, toggleCollection,
        addOption, removeOption, updateOptionTitle, updateOptionValues,
        updateVariant, toggleAllVariants,
        handleImageUpload, removeImage, handleDragStart, handleDragOver, handleDragEnd, handleFileDrop,
        handleSubmit, handleNavigation, clearDraft, router,
    } = useProductForm();

    const [optionValueInputs, setOptionValueInputs] = useState<Record<string, string>>({});
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const errorEntries = Object.entries(errors).filter(([, v]) => v);
    const defaultVariant = formData.variants[0];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); handleSubmit(true); }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSubmit]);

    useEffect(() => {
        if (errorEntries.length > 0 && errorSummaryRef.current) {
            errorSummaryRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [errorEntries.length]);

    const addOptionValue = (optionId: string) => {
        const raw = optionValueInputs[optionId]?.trim();
        if (!raw) return;
        const option = formData.options.find(o => o.id === optionId);
        if (!option) return;
        const newValues = raw.split(",").map(v => v.trim()).filter(v => v && !option.values.includes(v));
        if (newValues.length > 0) updateOptionValues(optionId, [...option.values, ...newValues]);
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
                                        <button type="button" onClick={() => handleNavigation("/dashboard/products")} className="p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Back to products">
                                            <ArrowLeft className="size-4" aria-hidden="true" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Back to products</TooltipContent>
                                </Tooltip>
                                <div>
                                    <h1 className="text-xl font-semibold tracking-[-0.4px]">Add product</h1>
                                    <div className="flex items-center gap-2" aria-live="polite">
                                        {lastSaved && <span className="text-xs text-muted-foreground">Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
                                        {isDirty && !lastSaved && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isDirty && <Button variant="ghost" onClick={clearDraft} className="text-muted-foreground">Discard</Button>}
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isPending}>
                                            <Save className="size-4 mr-1.5" aria-hidden="true" />Save draft
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>⌘S</TooltipContent>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto space-y-3 pb-4">
                    {errorEntries.length > 0 && (
                        <div ref={errorSummaryRef} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5" role="alert" aria-live="assertive">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="size-3.5 text-destructive" aria-hidden="true" />
                                <span className="text-sm font-medium text-destructive">{errorEntries.length} {errorEntries.length === 1 ? "error" : "errors"} found</span>
                            </div>
                            <ul className="space-y-0.5 ml-6">
                                {errorEntries.map(([key, msg]) => <li key={key} className="text-xs text-destructive">{msg}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 space-y-3">
                            {/* General Information */}
                            <Card id="section-general">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center"><Package className="size-4 text-muted-foreground" aria-hidden="true" /></div>
                                        <div><CardTitle className="text-sm font-medium">General information</CardTitle><CardDescription className="text-xs">Title, subtitle, and description</CardDescription></div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="name" className="text-xs">Title <span className="text-destructive">*</span></Label>
                                            <Input id="name" value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="Short sleeve t-shirt" className={cn(errors.name && "border-destructive")} aria-invalid={!!errors.name} aria-required="true" autoFocus />
                                            {errors.name && <p className="text-xs text-destructive flex items-center gap-1"><AlertCircle className="size-3.5" aria-hidden="true" />{errors.name}</p>}
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="subtitle" className="text-xs">Subtitle</Label>
                                            <Input id="subtitle" value={formData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} placeholder="Comfortable everyday wear" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="slug" className="text-xs">Handle</Label>
                                            <Button type="button" variant="ghost" className="h-6 text-xs" onClick={() => updateField("slug", generateSlug(formData.name))}>Generate</Button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className="text-xs text-muted-foreground shrink-0">/products/</span>
                                            <Input id="slug" value={formData.slug} onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="short-sleeve-t-shirt" className="font-mono" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="description" className="text-xs">Description</Label>
                                        <Textarea id="description" value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Describe your product..." className="min-h-[100px] resize-none" maxLength={5000} />
                                        <span className="text-xs text-muted-foreground">{formData.description.length}/5000</span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Media */}
                            <MediaSection
                                images={formData.images} isUploading={isUploading} draggedImageIndex={draggedImageIndex}
                                fileInputRef={fileInputRef} handleImageUpload={handleImageUpload} removeImage={removeImage}
                                handleDragStart={handleDragStart} handleDragOver={handleDragOver} handleDragEnd={handleDragEnd} handleFileDrop={handleFileDrop}
                            />

                            {/* Pricing & Variants */}
                            <Card id="section-pricing">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center"><Layers className="size-4 text-muted-foreground" aria-hidden="true" /></div>
                                            <div>
                                                <CardTitle className="text-sm font-medium">Pricing &amp; variants</CardTitle>
                                                <CardDescription className="text-xs">{formData.hasVariants ? "Options, pricing, and inventory per variant" : "Set product pricing"}</CardDescription>
                                            </div>
                                        </div>
                                        <Switch checked={formData.hasVariants} onCheckedChange={(v) => { updateField("hasVariants", v); if (v && formData.options.length === 0) addOption(); }} aria-label="Enable product variants" />
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {!formData.hasVariants && defaultVariant && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-1">
                                                <Label htmlFor="price" className="text-xs">Price (Rs)</Label>
                                                <Input id="price" type="number" value={defaultVariant.price} onChange={(e) => updateVariant(defaultVariant.id, "price", e.target.value)} placeholder="0.00" min="0" step="0.01" className="font-mono tabular-nums" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="compareAtPrice" className="text-xs">Compare-at price</Label>
                                                <Input id="compareAtPrice" type="number" value={defaultVariant.compareAtPrice} onChange={(e) => updateVariant(defaultVariant.id, "compareAtPrice", e.target.value)} placeholder="0.00" min="0" step="0.01" className="font-mono tabular-nums" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label htmlFor="costPrice" className="text-xs">Cost price</Label>
                                                <Input id="costPrice" type="number" placeholder="0.00" min="0" step="0.01" className="font-mono tabular-nums" />
                                            </div>
                                        </div>
                                    )}
                                    {formData.hasVariants && (
                                        <>
                                            {formData.options.map((option, optIndex) => (
                                                <div key={option.id} className="p-3 rounded-lg border space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs font-medium text-muted-foreground">Option {optIndex + 1}</span>
                                                        {formData.options.length > 1 && (
                                                            <Button type="button" variant="ghost" onClick={() => removeOption(option.id)} className="h-7 w-7 p-0 text-destructive hover:text-destructive" aria-label={`Remove option ${optIndex + 1}`}>
                                                                <Trash2 className="size-3.5" aria-hidden="true" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Option title</Label>
                                                        <Input placeholder="e.g. Color, Size, Material" value={option.title} onChange={(e) => updateOptionTitle(option.id, e.target.value)} className="h-7 text-xs" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs">Values (comma-separated)</Label>
                                                        <div className="flex gap-2">
                                                            <Input placeholder="e.g. Black, White, Red" value={optionValueInputs[option.id] || ""} onChange={(e) => setOptionValueInputs(prev => ({ ...prev, [option.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOptionValue(option.id); } }} className="h-7 text-xs" />
                                                            <Button type="button" variant="outline" onClick={() => addOptionValue(option.id)} aria-label="Add values"><Plus className="size-4" aria-hidden="true" /></Button>
                                                        </div>
                                                        {option.values.length > 0 && (
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {option.values.map(val => (
                                                                    <Badge key={val} variant="secondary" className="gap-1 pr-1 text-xs">
                                                                        {val}
                                                                        <button type="button" onClick={() => removeOptionValue(option.id, val)} className="ml-0.5 p-1.5 rounded hover:bg-muted" aria-label={`Remove ${val}`}><X className="size-2.5" aria-hidden="true" /></button>
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {formData.options.length < 5 && (
                                                <Button type="button" variant="outline" onClick={addOption} className="w-full"><Plus className="size-4 mr-1.5" aria-hidden="true" />Add another option</Button>
                                            )}
                                            {formData.variants.length > 0 && (
                                                <VariantTable variants={formData.variants} variantError={errors.variants} updateVariant={updateVariant} toggleAllVariants={toggleAllVariants} />
                                            )}
                                        </>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Organization */}
                            <Card id="section-organization">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center"><FolderOpen className="size-4 text-muted-foreground" aria-hidden="true" /></div>
                                        <div><CardTitle className="text-sm font-medium">Organization</CardTitle><CardDescription className="text-xs">Category, collections, and tags</CardDescription></div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <Label htmlFor="category" className="text-xs">Category</Label>
                                            <Select value={formData.categoryId} onValueChange={(v) => updateField("categoryId", v)}>
                                                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                                <SelectContent>
                                                    {categories.length === 0 ? (
                                                        <div className="p-3 text-center"><p className="text-xs text-muted-foreground mb-2">No categories</p><Button variant="outline" asChild><Link href="/dashboard/categories/new">Create</Link></Button></div>
                                                    ) : categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="brand" className="text-xs">Brand</Label>
                                            <Input id="brand" value={formData.brand} onChange={(e) => updateField("brand", e.target.value)} placeholder="e.g. Nike" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">Collections</Label>
                                            {formData.collectionIds.length > 0 && <Badge variant="secondary" className="text-xs">{formData.collectionIds.length}</Badge>}
                                        </div>
                                        {collections.length === 0 ? (
                                            <div className="text-center py-3 border rounded-lg"><p className="text-xs text-muted-foreground mb-2">No collections</p><Button variant="outline" asChild><Link href="/dashboard/collections/new">Create</Link></Button></div>
                                        ) : (
                                            <div className="space-y-1 max-h-[160px] overflow-y-auto border rounded-lg p-2">
                                                {collections.map(c => (
                                                    <label key={c.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors">
                                                        <Checkbox checked={formData.collectionIds.includes(c.id)} onCheckedChange={() => toggleCollection(c.id)} />
                                                        <span className="text-xs">{c.name}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs">Tags</Label>
                                            <span className="text-xs text-muted-foreground">{formData.tags.length}/20</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add a tag..." className="flex-1" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                                            <Button type="button" variant="outline" aria-label="Add tag" onClick={addTag}><Plus className="size-4" aria-hidden="true" /></Button>
                                        </div>
                                        {formData.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {formData.tags.map(tag => (
                                                    <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">{tag}<button type="button" onClick={() => removeTag(tag)} className="ml-0.5 p-1.5 rounded hover:bg-muted" aria-label={`Remove tag ${tag}`}><X className="size-2.5" aria-hidden="true" /></button></Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                        <div><Label htmlFor="discountable" className="text-xs">Discountable</Label><p className="text-xs text-muted-foreground">Allow discounts to be applied</p></div>
                                        <Switch id="discountable" checked={formData.discountable} onCheckedChange={(v) => updateField("discountable", v)} />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Shipping */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center"><Truck className="size-4 text-muted-foreground" aria-hidden="true" /></div>
                                            <div><CardTitle className="text-sm font-medium">Shipping</CardTitle><CardDescription className="text-xs">Physical product settings</CardDescription></div>
                                        </div>
                                        <Badge variant={formData.requiresShipping ? "secondary" : "outline"} className="text-xs">{formData.requiresShipping ? "Physical" : "Digital"}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                                        <div><Label htmlFor="requiresShipping" className="text-xs">Physical product</Label><p className="text-xs text-muted-foreground">This product requires shipping</p></div>
                                        <Switch id="requiresShipping" checked={formData.requiresShipping} onCheckedChange={(v) => updateField("requiresShipping", v)} />
                                    </div>
                                    {formData.requiresShipping && (
                                        <div className="space-y-1">
                                            <Label htmlFor="weight" className="text-xs">Weight</Label>
                                            <div className="flex gap-2">
                                                <Input id="weight" type="number" value={formData.weight} onChange={(e) => updateField("weight", e.target.value)} placeholder="0" min="0" className="flex-1" />
                                                <Select value={formData.weightUnit} onValueChange={(v) => updateField("weightUnit", v)}>
                                                    <SelectTrigger className="w-20" aria-label="Weight unit"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="g">g</SelectItem><SelectItem value="kg">kg</SelectItem>
                                                        <SelectItem value="lb">lb</SelectItem><SelectItem value="oz">oz</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* SEO */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center"><Search className="size-4 text-muted-foreground" aria-hidden="true" /></div>
                                        <div><CardTitle className="text-sm font-medium">Search engine listing</CardTitle><CardDescription className="text-xs">Optimize for search engines</CardDescription></div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="p-3 rounded-lg border bg-background">
                                        <p className="text-xs text-primary truncate">{seoPreviewUrl}</p>
                                        <p className="text-sm text-primary font-medium mt-0.5 truncate">{formData.metaTitle || formData.name || "Product Name"} - Your Store</p>
                                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{formData.metaDescription || formData.description || "Product description will appear here."}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="metaTitle" className="text-xs">Page title</Label>
                                            <span className={cn("text-xs", formData.metaTitle.length > 60 ? "text-destructive" : "text-muted-foreground")}>{formData.metaTitle.length}/60</span>
                                        </div>
                                        <Input id="metaTitle" value={formData.metaTitle} onChange={(e) => updateField("metaTitle", e.target.value)} placeholder={formData.name || "Product name - Your Store"} maxLength={70} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="metaDescription" className="text-xs">Meta description</Label>
                                            <span className={cn("text-xs", formData.metaDescription.length > 160 ? "text-destructive" : "text-muted-foreground")}>{formData.metaDescription.length}/160</span>
                                        </div>
                                        <Textarea id="metaDescription" value={formData.metaDescription} onChange={(e) => updateField("metaDescription", e.target.value)} placeholder="A brief description for search engines..." className="min-h-[80px] resize-none" maxLength={170} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <ProductSidebar formData={formData} updateField={updateField as (field: string, value: any) => void} completionPercentage={completionPercentage} scrollToSection={(id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })} lastSaved={lastSaved} isDirty={isDirty} clearDraft={clearDraft} seoPreviewUrl={seoPreviewUrl} categories={categories} />
                    </div>
                </div>

                {/* Bottom Savebar */}
                <div className="sticky bottom-0 z-40 -mx-6 mt-4 bg-background border-t">
                    <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-end gap-2">
                        <Button variant="outline" onClick={() => handleNavigation("/dashboard/products")} disabled={isPending}>Cancel</Button>
                        <Button onClick={() => handleSubmit(false)} disabled={isPending}>
                            {isPending ? <><Loader2 className="size-4 mr-1.5 animate-spin" aria-hidden="true" />Publishing...</> : "Publish product"}
                        </Button>
                    </div>
                </div>

                <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
                            <AlertDialogDescription>You have unsaved changes. Do you want to save them as a draft before leaving?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => { setShowUnsavedDialog(false); setPendingNavigation(null); }}>Cancel</AlertDialogCancel>
                            <AlertDialogAction variant="outline" onClick={() => { localStorage.removeItem(AUTOSAVE_KEY); if (pendingNavigation) router.push(pendingNavigation); }}>Discard</AlertDialogAction>
                            <AlertDialogAction onClick={async () => { await handleSubmit(true); if (pendingNavigation) router.push(pendingNavigation); }}>Save Draft</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </>
        </TooltipProvider>
    );
}
