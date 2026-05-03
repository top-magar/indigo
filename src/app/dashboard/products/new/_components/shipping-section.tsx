import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FormField } from "@/components/dashboard/form-field";
import { EntityFormCard } from "@/components/dashboard/templates/entity-form-card";
import { ToggleRow } from "@/components/dashboard/toggle-row";
import type { ProductFormData } from "../types";

interface Props {
    formData: ProductFormData;
    updateField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
}

export function ShippingSection({ formData, updateField }: Props) {
    return (
        <EntityFormCard
            title="Shipping"
            actions={<Badge variant={formData.requiresShipping ? "secondary" : "outline"} className="text-xs">{formData.requiresShipping ? "Physical" : "Digital"}</Badge>}
        >
            <div className="rounded-lg border">
                <ToggleRow label="Physical product" description="This product requires shipping" checked={formData.requiresShipping} onChange={(v) => updateField("requiresShipping", v)} />
            </div>
            {formData.requiresShipping && (
                <FormField label="Weight">
                    <div className="flex gap-2">
                        <Input type="number" value={formData.weight} onChange={(e) => updateField("weight", e.target.value)} placeholder="0" min="0" className="flex-1" />
                        <Select value={formData.weightUnit} onValueChange={(v) => updateField("weightUnit", v)}>
                            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="g">g</SelectItem><SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="lb">lb</SelectItem><SelectItem value="oz">oz</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </FormField>
            )}
        </EntityFormCard>
    );
}
