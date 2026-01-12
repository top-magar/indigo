"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Loader,
    X,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Type,
    Calculator,
    Calendar,
    Clock,
    ToggleLeft,
    File,
    Link,
    Palette,
    List,
    CheckSquare,
    AlignLeft,
    Info,
    type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/shared/utils";
import { createAttribute } from "@/app/dashboard/attributes/attribute-actions";
import { NUMERIC_UNITS } from "@/app/dashboard/attributes/types";
import type { AttributeInputType, AttributeEntityType, NumericUnit } from "@/app/dashboard/attributes/types";

interface CreateAttributeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Input type configuration with icons
const INPUT_TYPES: {
    value: AttributeInputType;
    label: string;
    description: string;
    icon: LucideIcon;
    category: "selection" | "input" | "special";
}[] = [
    { value: "dropdown", label: "Dropdown", description: "Single choice from a list", icon: List, category: "selection" },
    { value: "multiselect", label: "Multi-select", description: "Multiple choices from a list", icon: CheckSquare, category: "selection" },
    { value: "swatch", label: "Swatch", description: "Color or image picker", icon: Palette, category: "selection" },
    { value: "text", label: "Text", description: "Short text input", icon: Type, category: "input" },
    { value: "rich_text", label: "Rich Text", description: "Formatted text editor", icon: AlignLeft, category: "input" },
    { value: "numeric", label: "Number", description: "Numeric value with unit", icon: Calculator, category: "input" },
    { value: "boolean", label: "Yes/No", description: "Toggle switch", icon: ToggleLeft, category: "input" },
    { value: "date", label: "Date", description: "Date picker", icon: Calendar, category: "special" },
    { value: "datetime", label: "Date & Time", description: "Date and time picker", icon: Clock, category: "special" },
    { value: "file", label: "File", description: "File upload", icon: File, category: "special" },
    { value: "reference", label: "Reference", description: "Link to other items", icon: Link, category: "special" },
];

const STEPS = [
    { id: 1, title: "Type", description: "Choose attribute type" },
    { id: 2, title: "Details", description: "Name and settings" },
    { id: 3, title: "Options", description: "Visibility settings" },
];


export function CreateAttributeDialog({ open, onOpenChange }: CreateAttributeDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState(1);
    
    // Form state
    const [inputType, setInputType] = useState<AttributeInputType>("dropdown");
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [entityType, setEntityType] = useState<AttributeEntityType>("product");
    const [unit, setUnit] = useState<NumericUnit>("pcs");
    const [valueRequired, setValueRequired] = useState(false);
    const [visibleInStorefront, setVisibleInStorefront] = useState(true);
    const [filterableInStorefront, setFilterableInStorefront] = useState(false);

    const resetForm = useCallback(() => {
        setStep(1);
        setInputType("dropdown");
        setName("");
        setSlug("");
        setEntityType("product");
        setUnit("pcs");
        setValueRequired(false);
        setVisibleInStorefront(true);
        setFilterableInStorefront(false);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onOpenChange(false);
    }, [resetForm, onOpenChange]);

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Please enter a name");
            return;
        }

        startTransition(async () => {
            const result = await createAttribute({
                name: name.trim(),
                slug: slug.trim() || undefined,
                inputType,
                entityType: inputType === "reference" ? entityType : undefined,
                unit: inputType === "numeric" ? unit : undefined,
                valueRequired,
                visibleInStorefront,
                filterableInStorefront,
            });

            if (result.error) {
                toast.error(result.error);
            } else if (result.data) {
                toast.success("Attribute created successfully");
                handleClose();
                router.push(`/dashboard/attributes/${result.data.id}`);
            }
        });
    };

    const generateSlug = () => {
        if (name && !slug) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
        }
    };

    const canProceed = step === 1 || (step === 2 && name.trim());
    const selectedType = INPUT_TYPES.find(t => t.value === inputType);

    if (!open) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                onClick={handleClose}
            />
            
            {/* Slide-over Panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl animate-in slide-in-from-right duration-300">
                <div className="flex h-full flex-col bg-background shadow-2xl">
                    {/* Header */}
                    <div className="border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Create Attribute</h2>
                                <p className="text-sm text-muted-foreground">
                                    Step {step} of {STEPS.length}: {STEPS[step - 1].description}
                                </p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleClose}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        {/* Progress Steps */}
                        <div className="mt-4 flex items-center gap-2">
                            {STEPS.map((s, i) => (
                                <div key={s.id} className="flex items-center">
                                    <div
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                                            step > s.id
                                                ? "bg-primary text-primary-foreground"
                                                : step === s.id
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted text-muted-foreground"
                                        )}
                                    >
                                        {step > s.id ? (
                                            <CheckCircle className="h-4 w-4" />
                                        ) : (
                                            s.id
                                        )}
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div
                                            className={cn(
                                                "mx-2 h-0.5 w-8 transition-colors",
                                                step > s.id ? "bg-primary" : "bg-muted"
                                            )}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* Step 1: Choose Type */}
                        {step === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Selection Types</h3>
                                    <div className="grid gap-3">
                                        {INPUT_TYPES.filter(t => t.category === "selection").map((type) => (
                                            <TypeCard
                                                key={type.value}
                                                type={type}
                                                selected={inputType === type.value}
                                                onClick={() => setInputType(type.value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Input Types</h3>
                                    <div className="grid gap-3">
                                        {INPUT_TYPES.filter(t => t.category === "input").map((type) => (
                                            <TypeCard
                                                key={type.value}
                                                type={type}
                                                selected={inputType === type.value}
                                                onClick={() => setInputType(type.value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Special Types</h3>
                                    <div className="grid gap-3">
                                        {INPUT_TYPES.filter(t => t.category === "special").map((type) => (
                                            <TypeCard
                                                key={type.value}
                                                type={type}
                                                selected={inputType === type.value}
                                                onClick={() => setInputType(type.value)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Details */}
                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Selected Type Preview */}
                                {selectedType && (
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                            <selectedType.icon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">{selectedType.label}</p>
                                            <p className="text-sm text-muted-foreground">{selectedType.description}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Attribute Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                        onBlur={generateSlug}
                                        placeholder="e.g., Size, Color, Material"
                                        className="h-11"
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        This will be displayed to customers on product pages
                                    </p>
                                </div>

                                {/* Slug */}
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug (optional)</Label>
                                    <Input
                                        id="slug"
                                        value={slug}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                                        placeholder="auto-generated-from-name"
                                        className="h-11 font-mono text-sm"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Used in URLs and API. Leave empty to auto-generate.
                                    </p>
                                </div>

                                {/* Reference Type */}
                                {inputType === "reference" && (
                                    <div className="space-y-2">
                                        <Label>Reference Type</Label>
                                        <Select value={entityType} onValueChange={(v: string) => setEntityType(v as AttributeEntityType)}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="product">Products</SelectItem>
                                                <SelectItem value="product_variant">Product Variants</SelectItem>
                                                <SelectItem value="category">Categories</SelectItem>
                                                <SelectItem value="collection">Collections</SelectItem>
                                                <SelectItem value="page">Pages</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {/* Numeric Unit */}
                                {inputType === "numeric" && (
                                    <div className="space-y-2">
                                        <Label>Unit of Measurement</Label>
                                        <Select value={unit} onValueChange={(v: string) => setUnit(v as NumericUnit)}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {NUMERIC_UNITS.map((u) => (
                                                    <SelectItem key={u.value} value={u.value}>
                                                        {u.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                            </div>
                        )}


                        {/* Step 3: Options */}
                        {step === 3 && (
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="rounded-xl border p-4 space-y-3">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <Info className="h-4 w-4 text-muted-foreground" />
                                        Summary
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Name</p>
                                            <p className="font-medium">{name || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Type</p>
                                            <p className="font-medium">{selectedType?.label || "—"}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Slug</p>
                                            <p className="font-mono text-xs">{slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "—"}</p>
                                        </div>
                                        {inputType === "numeric" && (
                                            <div>
                                                <p className="text-muted-foreground">Unit</p>
                                                <p className="font-medium">{NUMERIC_UNITS.find(u => u.value === unit)?.label || "—"}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Settings */}
                                <div className="space-y-4">
                                    <h3 className="font-medium">Visibility & Behavior</h3>
                                    
                                    <SettingRow
                                        label="Value Required"
                                        description="Products must have a value for this attribute"
                                        checked={valueRequired}
                                        onCheckedChange={setValueRequired}
                                    />
                                    
                                    <SettingRow
                                        label="Visible in Storefront"
                                        description="Show this attribute on product pages"
                                        checked={visibleInStorefront}
                                        onCheckedChange={setVisibleInStorefront}
                                    />
                                    
                                    <SettingRow
                                        label="Filterable in Storefront"
                                        description="Allow customers to filter products by this attribute"
                                        checked={filterableInStorefront}
                                        onCheckedChange={setFilterableInStorefront}
                                    />
                                </div>

                                {/* Info about values */}
                                {["dropdown", "multiselect", "swatch"].includes(inputType) && (
                                    <div className="rounded-xl bg-muted/50 p-4 text-sm">
                                        <p className="font-medium mb-1">Next Steps</p>
                                        <p className="text-muted-foreground">
                                            After creating this attribute, you&apos;ll be able to add values 
                                            (like &quot;Small&quot;, &quot;Medium&quot;, &quot;Large&quot; for a Size attribute).
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="border-t px-6 py-4">
                        <div className="flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={() => step > 1 ? setStep(step - 1) : handleClose()}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                {step > 1 ? "Back" : "Cancel"}
                            </Button>
                            
                            {step < 3 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!canProceed}
                                >
                                    Continue
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isPending || !name.trim()}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Create Attribute
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// Type selection card component
function TypeCard({
    type,
    selected,
    onClick,
}: {
    type: typeof INPUT_TYPES[number];
    selected: boolean;
    onClick: () => void;
}) {
    const IconComponent = type.icon;
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                "hover:border-primary/50 hover:bg-accent/50",
                selected
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border"
            )}
        >
            <div
                className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                    selected ? "bg-primary text-primary-foreground" : "bg-muted"
                )}
            >
                <IconComponent className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className={cn("font-medium", selected && "text-primary")}>{type.label}</p>
                <p className="text-sm text-muted-foreground truncate">{type.description}</p>
            </div>
            {selected && (
                <CheckCircle className="h-5 w-5 text-primary shrink-0" />
            )}
        </button>
    );
}

// Setting row component
function SettingRow({
    label,
    description,
    checked,
    onCheckedChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4 p-3 rounded-xl border">
            <div className="space-y-0.5">
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}
