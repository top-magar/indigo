"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CheckCircle2, Circle, Eye, ImageIcon, AlertCircle } from "lucide-react"
import Image from "next/image"
import { cn } from "@/shared/utils"

interface ProductSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  formData: any
  updateField: (field: string, value: any) => void
  completionPercentage: number
  scrollToSection: (id: string) => void
  lastSaved: Date | null
  isDirty: boolean
  clearDraft: () => void
  seoPreviewUrl: string
  categories: { id: string; name: string }[]
}

export function ProductSidebar({
  formData, updateField, completionPercentage, scrollToSection,
  lastSaved, isDirty, clearDraft, seoPreviewUrl, categories,
}: ProductSidebarProps) {
  return (
<div className="space-y-4">
    {/* Status Card */}
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
            <Select
                value={formData.status}
                onValueChange={(v: "draft" | "active" | "archived") => updateField("status", v)}
            >
                <SelectTrigger>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
                            Draft
                        </div>
                    </SelectItem>
                    <SelectItem value="active">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-success" />
                            Active
                        </div>
                    </SelectItem>
                    <SelectItem value="archived">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-destructive" />
                            Archived
                        </div>
                    </SelectItem>
                </SelectContent>
            </Select>

            <Separator />

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <Label className="text-xs">Schedule for later</Label>
                    <Switch
                        checked={!formData.publishNow}
                        onCheckedChange={(checked) => {
                            updateField("publishNow", !checked);
                            if (!checked) updateField("publishDate", undefined);
                        }}
                    />
                </div>

                {!formData.publishNow && (
                    <div className="space-y-2 pt-2">
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label className="text-xs">Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                                            {formData.publishDate ? (
                                                formData.publishDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                            ) : (
                                                <span className="text-muted-foreground">Pick date</span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={formData.publishDate}
                                            onSelect={(date) => updateField("publishDate", date)}
                                            disabled={(date) => date < new Date()}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Time</Label>
                                <Input
                                    type="time"
                                    value={formData.publishTime}
                                    onChange={(e) => updateField("publishTime", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CardContent>
    </Card>

    {/* Preview Card */}
    {formData.name && (
        <Card className="bg-muted/30 border-dashed">
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium flex items-center gap-1.5 text-muted-foreground">
                    <Eye className="size-3.5" aria-hidden="true" />
                    Preview
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {formData.images[0] && (
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <Image
                            src={formData.images[0].url}
                            alt={formData.images[0].alt}
                            width={200}
                            height={200}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div>
                    <p className="font-medium text-sm truncate">{formData.name}</p>
                    {formData.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{formData.subtitle}</p>
                    )}
                    {formData.categoryId && (
                        <p className="text-xs text-muted-foreground">
                            {categories.find(c => c.id === formData.categoryId)?.name}
                        </p>
                    )}
                </div>
                {(() => {
                    const enabledWithPrice = formData.variants.filter((v: any) => v.enabled && v.price);
                    if (enabledWithPrice.length === 0) return (
                        <span className="text-sm text-muted-foreground">Set price below</span>
                    );
                    const prices = enabledWithPrice.map((v: any) => parseFloat(v.price));
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);
                    return (
                        <span className="font-semibold font-mono tabular-nums">
                            {min === max ? `Rs ${min}` : `Rs ${min} – ${max}`}
                        </span>
                    );
                })()}
                {formData.hasVariants && (
                    <p className="text-xs text-muted-foreground">
                        {formData.variants.filter((v: any) => v.enabled).length} variant{formData.variants.filter((v: any) => v.enabled).length !== 1 ? "s" : ""}
                    </p>
                )}
            </CardContent>
        </Card>
    )}

    {/* Completion Progress */}
    <Card className="bg-muted/30">
        <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Completion</span>
                <span className="text-xs text-muted-foreground">{completionPercentage}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                />
            </div>
            <div className="mt-2 space-y-1">
                {[
                    { done: !!formData.name, label: "Add title", section: "section-general" },
                    { done: formData.variants.some((v: any) => v.enabled && !!v.price), label: "Set price", section: "section-pricing" },
                    { done: formData.images.length > 0, label: "Add images", section: "section-general" },
                    { done: !!formData.description, label: "Add description", section: "section-general" },
                    { done: !!formData.categoryId, label: "Select category", section: "section-organization" },
                ].map((item, i) => (
                    <button
                        key={i}
                        type="button"
                        className="flex items-center gap-2 text-xs w-full text-left hover:bg-muted/50 rounded p-0.5 transition-colors"
                        onClick={() => scrollToSection(item.section)}
                    >
                        {item.done ? (
                            <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
                        ) : (
                            <AlertCircle className="size-3.5 text-muted-foreground" aria-hidden="true" />
                        )}
                        <span className={item.done ? "text-muted-foreground line-through" : ""}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </CardContent>
    </Card>
</div>
  )
}
