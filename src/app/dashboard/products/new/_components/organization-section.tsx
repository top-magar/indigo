import Link from "next/link";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/dashboard/form-field";
import { EntityFormCard } from "@/components/dashboard/templates/entity-form-card";
import { ToggleRow } from "@/components/dashboard/toggle-row";
import type { ProductFormData, Category, Collection } from "../types";

interface Props {
    formData: ProductFormData;
    categories: Category[];
    collections: Collection[];
    tagInput: string;
    setTagInput: (v: string) => void;
    updateField: <K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => void;
    addTag: () => void;
    removeTag: (tag: string) => void;
    toggleCollection: (id: string) => void;
}

export function OrganizationSection({ formData, categories, collections, tagInput, setTagInput, updateField, addTag, removeTag, toggleCollection }: Props) {
    return (
        <EntityFormCard title="Organization" id="section-organization">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Category">
                    <Select value={formData.categoryId} onValueChange={(v) => updateField("categoryId", v)}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                            {categories.length === 0 ? (
                                <div className="p-3 text-center"><p className="text-xs text-muted-foreground mb-2">No categories</p><Button variant="outline" size="sm" asChild><Link href="/dashboard/categories/new">Create</Link></Button></div>
                            ) : categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </FormField>
                <FormField label="Brand">
                    <Input value={formData.brand} onChange={(e) => updateField("brand", e.target.value)} placeholder="e.g. Nike" />
                </FormField>
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Collections</label>
                    {formData.collectionIds.length > 0 && <Badge variant="secondary" className="text-xs">{formData.collectionIds.length}</Badge>}
                </div>
                {collections.length === 0 ? (
                    <div className="text-center py-4 border rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Group products into collections like &ldquo;Summer Sale&rdquo;</p>
                        <Button variant="outline" size="sm" asChild><Link href="/dashboard/collections/new">Create collection</Link></Button>
                    </div>
                ) : (
                    <div className="space-y-1 max-h-40 overflow-y-auto border rounded-lg p-2">
                        {collections.map(c => (
                            <label key={c.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 cursor-pointer transition-colors">
                                <Checkbox checked={formData.collectionIds.includes(c.id)} onCheckedChange={() => toggleCollection(c.id)} />
                                <span className="text-xs">{c.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium">Tags</label>
                    <span className="text-xs text-muted-foreground">{formData.tags.length}/20</span>
                </div>
                <div className="flex gap-2">
                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add a tag..." className="flex-1" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }} />
                    <Button type="button" variant="outline" size="sm" onClick={addTag}><Plus className="size-3.5" /></Button>
                </div>
                {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">{tag}<button type="button" onClick={() => removeTag(tag)} className="ml-0.5 p-0.5 rounded hover:bg-muted"><X className="size-2.5" /></button></Badge>
                        ))}
                    </div>
                )}
            </div>

            <div className="rounded-lg border">
                <ToggleRow label="Discountable" description="Allow discounts to be applied" checked={formData.discountable} onChange={(v) => updateField("discountable", v)} />
            </div>
        </EntityFormCard>
    );
}
