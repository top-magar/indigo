import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/dashboard/form-field";
import { cn } from "@/shared/utils";
import type { ProductFormData, ProductFormErrors } from "../types";
import { generateSlug } from "../types";

interface Props {
    formData: ProductFormData;
    errors: ProductFormErrors;
    updateField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
}

export function GeneralInfoSection({ formData, errors, updateField }: Props) {
    return (
        <div className="space-y-8" id="section-general">
            {/* Title + Subtitle */}
            <div className="space-y-4">
                <h2 className="text-sm font-medium text-muted-foreground">Product details</h2>
                <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4">
                    <FormField label="Title" required error={errors.name}>
                        <Input value={formData.name} onChange={(e) => updateField("name", e.target.value)} placeholder="What are you selling?" className={cn("h-10", errors.name && "border-destructive")} autoFocus />
                    </FormField>
                    <FormField label="Subtitle">
                        <Input value={formData.subtitle} onChange={(e) => updateField("subtitle", e.target.value)} placeholder="Short tagline" className="h-10" />
                    </FormField>
                </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
                <div className="relative">
                    <FormField label="Description">
                        <Textarea value={formData.description} onChange={(e) => updateField("description", e.target.value)} placeholder="Tell customers about your product — materials, sizing, care instructions..." className="min-h-28 resize-none pb-6" maxLength={5000} />
                    </FormField>
                    <span className="absolute bottom-2 right-3 text-[10px] tabular-nums text-muted-foreground">{formData.description.length}/5000</span>
                </div>
            </div>

            {/* Handle — minimal, tucked away */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="shrink-0">/products/</span>
                <Input value={formData.slug} onChange={(e) => updateField("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} placeholder="auto-generated" className="font-mono h-7 text-xs border-dashed max-w-64" />
                <Button type="button" variant="ghost" size="sm" className="shrink-0 text-xs h-7" onClick={() => updateField("slug", generateSlug(formData.name))}>Generate</Button>
            </div>
        </div>
    );
}
