import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/dashboard/form-field";
import { EntityFormCard } from "@/components/dashboard/templates/entity-form-card";
import { cn } from "@/shared/utils";
import type { ProductFormData } from "../types";

interface Props {
    formData: ProductFormData;
    seoPreviewUrl: string;
    updateField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
}

export function SeoSection({ formData, seoPreviewUrl, updateField }: Props) {
    return (
        <EntityFormCard title="Search engine listing">
            <div className="p-3 rounded-lg border bg-background space-y-0.5">
                <div className="flex items-center gap-2">
                    <div className="size-5 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[8px] font-semibold text-muted-foreground">S</span>
                    </div>
                    <p className="text-xs truncate min-w-0">{seoPreviewUrl}</p>
                </div>
                <p className="text-sm font-medium text-[#1a0dab] truncate">{formData.metaTitle || formData.name || "Product Name"} - Your Store</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{formData.metaDescription || formData.description || "Product description will appear here."}</p>
            </div>
            <div className="relative">
                <FormField label="Page title">
                    <Input value={formData.metaTitle} onChange={(e) => updateField("metaTitle", e.target.value)} placeholder={formData.name || "Product name - Your Store"} maxLength={70} className="pr-14" />
                </FormField>
                <span className={cn("absolute bottom-2 right-3 text-[10px] tabular-nums", formData.metaTitle.length > 60 ? "text-destructive" : "text-muted-foreground")}>{formData.metaTitle.length}/60</span>
            </div>
            <div className="relative">
                <FormField label="Meta description" description="Appears in Google search results">
                    <Textarea value={formData.metaDescription} onChange={(e) => updateField("metaDescription", e.target.value)} placeholder="A brief description for search engines..." className="min-h-20 resize-none pb-6" maxLength={170} />
                </FormField>
                <span className={cn("absolute bottom-2 right-3 text-[10px] tabular-nums", formData.metaDescription.length > 160 ? "text-destructive" : "text-muted-foreground")}>{formData.metaDescription.length}/160</span>
            </div>
        </EntityFormCard>
    );
}
