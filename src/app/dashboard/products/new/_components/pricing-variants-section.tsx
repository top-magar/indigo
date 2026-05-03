import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/dashboard/form-field";
import { EntityFormCard } from "@/components/dashboard/templates/entity-form-card";
import type { ProductFormData, ProductFormErrors, ProductVariant } from "../types";
import { VariantTable } from "./variant-table";

interface Props {
    formData: ProductFormData;
    errors: ProductFormErrors;
    updateField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
    updateVariant: (id: string, field: keyof ProductVariant, value: string | boolean) => void;
    toggleAllVariants: (enabled: boolean) => void;
    addOption: () => void;
    removeOption: (id: string) => void;
    updateOptionTitle: (id: string, title: string) => void;
    updateOptionValues: (id: string, values: string[]) => void;
}

export function PricingVariantsSection({ formData, errors, updateField, updateVariant, toggleAllVariants, addOption, removeOption, updateOptionTitle, updateOptionValues }: Props) {
    const [optionValueInputs, setOptionValueInputs] = useState<Record<string, string>>({});
    const defaultVariant = formData.variants[0];

    const addOptionValue = (optionId: string) => {
        const raw = optionValueInputs[optionId]?.trim();
        if (!raw) return;
        const option = formData.options.find(o => o.id === optionId);
        if (!option) return;
        const newValues = raw.split(",").map(v => v.trim()).filter(v => v && !option.values.includes(v));
        if (newValues.length > 0) updateOptionValues(optionId, [...option.values, ...newValues]);
        setOptionValueInputs(prev => ({ ...prev, [optionId]: "" }));
    };

    return (
        <EntityFormCard
            title="Pricing & variants"
            id="section-pricing"
            actions={<Switch checked={formData.hasVariants} onCheckedChange={(v) => { updateField("hasVariants", v); if (v && formData.options.length === 0) addOption(); }} aria-label="Enable variants" />}
        >
            {!formData.hasVariants && defaultVariant && (
                <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Price (Rs)">
                        <Input type="number" value={defaultVariant.price} onChange={(e) => updateVariant(defaultVariant.id, "price", e.target.value)} placeholder="e.g. 1500" min="0" step="0.01" className="font-mono tabular-nums" />
                    </FormField>
                    <FormField label="Compare-at price">
                        <Input type="number" value={defaultVariant.compareAtPrice} onChange={(e) => updateVariant(defaultVariant.id, "compareAtPrice", e.target.value)} placeholder="Original price" min="0" step="0.01" className="font-mono tabular-nums" />
                    </FormField>
                    <FormField label="Cost price">
                        <Input type="number" value={defaultVariant.costPrice} onChange={(e) => updateVariant(defaultVariant.id, "costPrice", e.target.value)} placeholder="Your cost" min="0" step="0.01" className="font-mono tabular-nums" />
                    </FormField>
                </div>
                {/* Profit margin — shows when both price and cost are set */}
                {defaultVariant.price && defaultVariant.costPrice && (() => {
                    const price = parseFloat(defaultVariant.price);
                    const cost = parseFloat(defaultVariant.costPrice);
                    if (!price || !cost || price <= 0) return null;
                    const profit = price - cost;
                    const margin = Math.round((profit / price) * 100);
                    const isPositive = profit > 0;
                    return (
                        <div className={`flex items-center gap-4 text-xs px-3 py-2 rounded-lg ${isPositive ? "bg-success/5 text-success" : "bg-destructive/5 text-destructive"}`}>
                            <span>Profit: <strong className="font-semibold tabular-nums">Rs {profit.toLocaleString()}</strong></span>
                            <span>Margin: <strong className="font-semibold tabular-nums">{margin}%</strong></span>
                        </div>
                    );
                })()}
                </>
            )}
            {formData.hasVariants && (
                <>
                    {formData.options.map((option, i) => (
                        <div key={option.id} className="p-3 rounded-lg border space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-muted-foreground">Option {i + 1}</span>
                                {formData.options.length > 1 && (
                                    <Button type="button" variant="ghost" onClick={() => removeOption(option.id)} className="size-7 p-0 text-destructive hover:text-destructive" aria-label={`Remove option ${i + 1}`}>
                                        <Trash2 className="size-3.5" />
                                    </Button>
                                )}
                            </div>
                            <FormField label="Option title">
                                <Input placeholder="e.g. Color, Size" value={option.title} onChange={(e) => updateOptionTitle(option.id, e.target.value)} className="h-7 text-xs" />
                            </FormField>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium">Values</label>
                                <div className="flex gap-2">
                                    <Input placeholder="e.g. Black, White" value={optionValueInputs[option.id] || ""} onChange={(e) => setOptionValueInputs(prev => ({ ...prev, [option.id]: e.target.value }))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addOptionValue(option.id); } }} className="h-7 text-xs" />
                                    <Button type="button" variant="outline" size="sm" onClick={() => addOptionValue(option.id)}><Plus className="size-3.5" /></Button>
                                </div>
                                {option.values.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {option.values.map(val => (
                                            <Badge key={val} variant="secondary" className="gap-1 pr-1 text-xs">
                                                {val}
                                                <button type="button" onClick={() => updateOptionValues(option.id, option.values.filter(v => v !== val))} className="ml-0.5 p-0.5 rounded hover:bg-muted"><X className="size-2.5" /></button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {formData.options.length < 5 && (
                        <Button type="button" variant="outline" onClick={addOption} className="w-full"><Plus className="size-4" />Add another option</Button>
                    )}
                    {formData.variants.length > 0 && (
                        <VariantTable variants={formData.variants} variantError={errors.variants} updateVariant={updateVariant} toggleAllVariants={toggleAllVariants} />
                    )}
                </>
            )}
        </EntityFormCard>
    );
}
