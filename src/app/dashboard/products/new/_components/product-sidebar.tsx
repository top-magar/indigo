"use client";

import type { ProductFormData, WizardStep } from "../types";
import { CheckCircle2, Circle, ShoppingBag } from "lucide-react";
import Image from "next/image";

interface ProductSidebarProps {
    formData: ProductFormData;
    updateField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
    completionPercentage: number;
    onNavigateStep: (step: WizardStep) => void;
    categories: { id: string; name: string }[];
}

export function ProductSidebar({ formData, completionPercentage, onNavigateStep, categories }: ProductSidebarProps) {
    const hasContent = formData.name || formData.images.length > 0;
    const priced = formData.variants.filter(v => v.enabled && v.price);
    const prices = priced.map(v => parseFloat(v.price));
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    return (
        <div className="space-y-6">
            {/* Live storefront preview */}
            <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Preview</p>
                <div className="rounded-xl border bg-background overflow-hidden">
                    {/* Product image */}
                    <div className="aspect-square bg-muted/50 relative overflow-hidden">
                        {formData.images[0] ? (
                            <Image src={formData.images[0].url} alt={formData.images[0].alt} fill className="object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30">
                                <ShoppingBag className="size-12" strokeWidth={1} />
                                <p className="text-xs mt-2">No image yet</p>
                            </div>
                        )}
                    </div>
                    {/* Product info */}
                    <div className="p-4 space-y-2">
                        <div>
                            <p className={`font-medium text-sm ${formData.name ? "" : "text-muted-foreground"}`}>
                                {formData.name || "Product name"}
                            </p>
                            {(formData.subtitle || formData.categoryId) && (
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {formData.subtitle || categories.find(c => c.id === formData.categoryId)?.name}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center justify-between">
                            <span className={`font-semibold tabular-nums ${prices.length ? "text-foreground" : "text-muted-foreground"}`}>
                                {prices.length
                                    ? minPrice === maxPrice ? `Rs ${minPrice.toLocaleString()}` : `Rs ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}`
                                    : "Rs —"
                                }
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Draft</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Completion */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Checklist</p>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">{completionPercentage}%</span>
                </div>
                <div className="space-y-0.5">
                    {([
                        { done: !!formData.name, label: "Add title", step: 0 as WizardStep },
                        { done: formData.images.length > 0, label: "Add photos", step: 0 as WizardStep },
                        { done: !!formData.description, label: "Write description", step: 0 as WizardStep },
                        { done: priced.length > 0, label: "Set price", step: 2 as WizardStep },
                        { done: !!formData.categoryId, label: "Choose category", step: 1 as WizardStep },
                    ]).map((item, i) => (
                        <button key={i} type="button" className="flex items-center gap-2 text-xs w-full text-left hover:bg-muted/50 rounded-md px-2 py-1.5 transition-colors" onClick={() => onNavigateStep(item.step)}>
                            {item.done ? <CheckCircle2 className="size-3.5 text-success shrink-0" /> : <Circle className="size-3.5 text-muted-foreground/40 shrink-0" />}
                            <span className={item.done ? "text-muted-foreground line-through" : "text-foreground"}>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
