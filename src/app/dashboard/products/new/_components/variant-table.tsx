import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/shared/utils";
import type { ProductVariant } from "../types";

interface VariantTableProps {
    variants: ProductVariant[];
    variantError: string | undefined;
    updateVariant: (id: string, field: keyof ProductVariant, value: string | boolean) => void;
    toggleAllVariants: (enabled: boolean) => void;
}

export function VariantTable({ variants, variantError, updateVariant, toggleAllVariants }: VariantTableProps) {
    return (
        <div className="pt-3 border-t">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">
                    Variants
                    <Badge variant="secondary" className="ml-2 text-xs">
                        {variants.filter(v => v.enabled).length}/{variants.length}
                    </Badge>
                </span>
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={variants.every(v => v.enabled)}
                        onCheckedChange={(checked) => toggleAllVariants(!!checked)}
                        aria-label="Toggle all variants"
                    />
                    <span className="text-xs text-muted-foreground">All</span>
                </div>
            </div>
            {variantError && (
                <p className="text-xs text-destructive flex items-center gap-1 mb-3">
                    <AlertCircle className="w-3 h-3" aria-hidden="true" />
                    {variantError}
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
                        {variants.map((variant) => (
                            <tr key={variant.id} className={cn("border-b last:border-0 transition-colors", !variant.enabled && "opacity-40")}>
                                <td className="py-2 pr-2">
                                    <Checkbox checked={variant.enabled} onCheckedChange={(checked) => updateVariant(variant.id, "enabled", !!checked)} aria-label={`Enable ${variant.title}`} />
                                </td>
                                <td className="py-2 pr-3">
                                    <span className="text-sm font-medium truncate block max-w-[140px]">{variant.title}</span>
                                </td>
                                <td className="py-2 pr-3">
                                    <Input value={variant.sku} onChange={(e) => updateVariant(variant.id, "sku", e.target.value)} placeholder="SKU" className="h-8 text-xs font-mono" disabled={!variant.enabled} />
                                </td>
                                <td className="py-2 pr-3">
                                    <Input type="number" value={variant.price} onChange={(e) => updateVariant(variant.id, "price", e.target.value)} placeholder="0.00" min="0" step="0.01" className="h-8 text-xs font-mono tabular-nums" disabled={!variant.enabled} />
                                </td>
                                <td className="py-2 pr-3">
                                    <Input type="number" value={variant.compareAtPrice} onChange={(e) => updateVariant(variant.id, "compareAtPrice", e.target.value)} placeholder="0.00" min="0" step="0.01" className="h-8 text-xs font-mono tabular-nums" disabled={!variant.enabled} />
                                </td>
                                <td className="py-2 pr-3">
                                    <Input type="number" value={variant.quantity} onChange={(e) => updateVariant(variant.id, "quantity", e.target.value)} min="0" className="h-8 text-xs font-mono tabular-nums" disabled={!variant.enabled} />
                                </td>
                                <td className="py-2 pr-3 text-center">
                                    <Switch checked={variant.manageInventory} onCheckedChange={(v) => updateVariant(variant.id, "manageInventory", v)} disabled={!variant.enabled} aria-label="Manage inventory" className="scale-75" />
                                </td>
                                <td className="py-2 text-center">
                                    <Switch checked={variant.allowBackorder} onCheckedChange={(v) => updateVariant(variant.id, "allowBackorder", v)} disabled={!variant.enabled} aria-label="Allow backorder" className="scale-75" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
