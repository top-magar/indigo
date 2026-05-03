"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, AlertCircle, Save, Loader2, PartyPopper, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";
import type { Category, Collection } from "./types";
import { WIZARD_STEPS } from "./types";
import { useProductForm } from "./use-product-form";
import { StepIndicator } from "./_components/step-indicator";
import { ProductSidebar } from "./_components/product-sidebar";
import { GeneralInfoSection } from "./_components/general-info-section";
import { MediaSection } from "./_components/media-section";
import { PricingVariantsSection } from "./_components/pricing-variants-section";
import { OrganizationSection } from "./_components/organization-section";
import { ShippingSection } from "./_components/shipping-section";
import { SeoSection } from "./_components/seo-section";

interface Props {
    categories: Category[];
    collections: Collection[];
    storeSlug: string;
}

export function NewProductClient({ categories, collections, storeSlug }: Props) {
    const form = useProductForm();
    const errorRef = useRef<HTMLDivElement>(null);
    const seoPreviewUrl = `${storeSlug || "yourstore"}.indigo.shop/products/${form.formData.slug || "product-name"}`;
    const errorEntries = Object.entries(form.errors).filter(([, v]) => v);
    const isLastStep = form.currentStep === 2;

    useEffect(() => {
        if (errorEntries.length > 0 && errorRef.current) {
            errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [errorEntries.length]);

    useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [form.currentStep]);

    // Celebration state
    if (form.isPublished) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-6 animate-in fade-in duration-500">
                <div className="relative">
                    <div className="size-20 rounded-2xl bg-success/10 flex items-center justify-center">
                        <PartyPopper className="size-9 text-success" />
                    </div>
                    <div className="absolute -top-1 -right-1 size-5 rounded-full bg-success flex items-center justify-center">
                        <Check className="size-3 text-success-foreground" />
                    </div>
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-lg font-semibold tracking-tight">Your product is live!</h1>
                    <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                        <span className="font-medium text-foreground">{form.formData.name}</span> is now visible to customers in your store.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {storeSlug && (
                        <Button variant="outline" size="sm" asChild>
                            <Link href={`/store/${storeSlug}`} target="_blank">View in store</Link>
                        </Button>
                    )}
                    <Button size="sm" asChild>
                        <Link href="/dashboard/products">Go to products</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header — tight grouping */}
            <div>
                <Link href="/dashboard/products" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="size-3.5" />Products
                </Link>
                <div className="flex items-center justify-between mt-1">
                    <h1 className="text-lg font-semibold tracking-tight">Add product</h1>
                    <Button variant="outline" size="sm" onClick={() => form.handleSubmit(true)} disabled={form.isPending} title="⌘S">
                        <Save className="size-3.5" />Save draft
                    </Button>
                </div>
            </div>

            {/* Step indicator */}
            <StepIndicator steps={[...WIZARD_STEPS]} currentStep={form.currentStep} onStepClick={(i) => form.goToStep(i as 0 | 1 | 2)} />

            {/* Error summary */}
            {errorEntries.length > 0 && (
                <div ref={errorRef} className="p-3 rounded-lg border border-destructive/30 bg-destructive/5" role="alert">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="size-3.5 text-destructive" />
                        <span className="text-sm font-medium text-destructive">{errorEntries.length} {errorEntries.length === 1 ? "error" : "errors"} found</span>
                    </div>
                    <ul className="space-y-0.5 ml-6">
                        {errorEntries.map(([key, msg]) => <li key={key} className="text-xs text-destructive">{msg}</li>)}
                    </ul>
                </div>
            )}

            {/* Main + Sidebar */}
            <form onSubmit={(e) => { e.preventDefault(); isLastStep ? form.handleSubmit(false) : form.goNext(); }}>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
                    <div className="space-y-4">
                        {form.currentStep === 0 && (
                            <>
                                <GeneralInfoSection formData={form.formData} errors={form.errors} updateField={form.updateField} />
                                <MediaSection
                                    images={form.formData.images} isUploading={form.isUploading} draggedImageIndex={form.draggedImageIndex}
                                    fileInputRef={form.fileInputRef} handleImageUpload={form.handleImageUpload} removeImage={form.removeImage}
                                    handleDragStart={form.handleDragStart} handleDragOver={form.handleDragOver} handleDragEnd={form.handleDragEnd} handleFileDrop={form.handleFileDrop}
                                />
                            </>
                        )}
                        {form.currentStep === 1 && (
                            <>
                                <OrganizationSection
                                    formData={form.formData} categories={categories} collections={collections}
                                    tagInput={form.tagInput} setTagInput={form.setTagInput} updateField={form.updateField}
                                    addTag={form.addTag} removeTag={form.removeTag} toggleCollection={form.toggleCollection}
                                />
                                <ShippingSection formData={form.formData} updateField={form.updateField} />
                                <SeoSection formData={form.formData} seoPreviewUrl={seoPreviewUrl} updateField={form.updateField} />
                            </>
                        )}
                        {form.currentStep === 2 && (
                            <PricingVariantsSection
                                formData={form.formData} errors={form.errors} updateField={form.updateField}
                                updateVariant={form.updateVariant} toggleAllVariants={form.toggleAllVariants}
                                addOption={form.addOption} removeOption={form.removeOption}
                                updateOptionTitle={form.updateOptionTitle} updateOptionValues={form.updateOptionValues}
                            />
                        )}

                        {/* Step navigation */}
                        <div className="flex items-center justify-between border-t pt-5 pb-8">
                            <div>
                                {form.currentStep > 0 && (
                                    <Button type="button" variant="ghost" onClick={form.goBack} className="gap-1.5 text-muted-foreground hover:text-foreground">
                                        <ArrowLeft className="size-3.5" />Back
                                    </Button>
                                )}
                            </div>
                            <Button type="submit" disabled={form.isPending} className={cn("gap-1.5 transition-colors", isLastStep && "px-6")}>
                                {isLastStep ? (
                                    form.isPending ? <><Loader2 className="size-4 animate-spin" />Publishing…</> : "Publish product"
                                ) : (
                                    <>Continue<ArrowRight className="size-3.5" /></>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar — sticky on desktop, stacks below on mobile */}
                    <div className="lg:sticky lg:top-4">
                        <ProductSidebar
                                formData={form.formData}
                                updateField={form.updateField}
                                completionPercentage={form.completionPercentage}
                                onNavigateStep={form.goToStep}
                                categories={categories}
                            />
                    </div>
                </div>
            </form>
        </div>
    );
}
