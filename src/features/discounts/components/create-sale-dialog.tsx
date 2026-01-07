"use client";

import { useState, useTransition, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    PercentIcon,
    DollarCircleIcon,
    Loading03Icon,
    Cancel01Icon,
    ArrowRight01Icon,
    ArrowLeft01Icon,
    CheckmarkCircle02Icon,
    Tag01Icon,
    InformationCircleIcon,
    Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { createDiscount } from "@/app/dashboard/marketing/discounts/actions";
import { toast } from "sonner";
import { cn } from "@/shared/utils";

interface CreateSaleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

type DiscountType = "percentage" | "fixed";

const STEPS = [
    { id: 1, title: "Type", description: "Choose discount type" },
    { id: 2, title: "Details", description: "Name and schedule" },
];

const DISCOUNT_TYPES = [
    {
        value: "percentage" as const,
        label: "Percentage Off",
        description: "Discount by a percentage of the price",
        icon: PercentIcon,
        placeholder: "10",
        suffix: "%",
    },
    {
        value: "fixed" as const,
        label: "Fixed Amount",
        description: "Discount by a fixed dollar amount",
        icon: DollarCircleIcon,
        placeholder: "5.00",
        suffix: "USD",
    },
];

export function CreateSaleDialog({ open, onOpenChange, onSuccess }: CreateSaleDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState(1);
    
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<DiscountType>("percentage");
    const [value, setValue] = useState("10");
    const [hasStartDate, setHasStartDate] = useState(false);
    const [hasEndDate, setHasEndDate] = useState(false);
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    const [isActive, setIsActive] = useState(true);

    const resetForm = useCallback(() => {
        setStep(1);
        setName("");
        setDescription("");
        setType("percentage");
        setValue("10");
        setHasStartDate(false);
        setHasEndDate(false);
        setStartsAt("");
        setEndsAt("");
        setIsActive(true);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onOpenChange(false);
    }, [resetForm, onOpenChange]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Please enter a sale name");
            return;
        }
        
        startTransition(async () => {
            const result = await createDiscount({
                name,
                description: description || undefined,
                kind: "sale",
                type,
                value: parseFloat(value),
                scope: "specific_products",
                applyOncePerOrder: false,
                applyOncePerCustomer: false,
                onlyForStaff: false,
                singleUse: false,
                startsAt: hasStartDate ? startsAt : null,
                endsAt: hasEndDate ? endsAt : null,
                isActive,
            });

            if (result.success) {
                toast.success("Sale created successfully");
                handleClose();
                onSuccess?.();
            } else {
                toast.error(result.error || "Failed to create sale");
            }
        });
    };

    const canProceed = step === 1 ? value : name.trim();
    const selectedType = DISCOUNT_TYPES.find(t => t.value === type);

    if (!open) return null;

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
                onClick={handleClose}
            />
            
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl animate-in slide-in-from-right duration-300">
                <div className="flex h-full flex-col bg-background shadow-2xl">
                    <div className="border-b px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
                                    <HugeiconsIcon icon={Tag01Icon} className="h-5 w-5 text-chart-2" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Create Sale</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Step {step} of {STEPS.length}: {STEPS[step - 1].description}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleClose}>
                                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        <div className="mt-4 flex items-center gap-2">
                            {STEPS.map((s, i) => (
                                <div key={s.id} className="flex items-center">
                                    <button
                                        type="button"
                                        onClick={() => s.id < step && setStep(s.id)}
                                        disabled={s.id > step}
                                        className={cn(
                                            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors",
                                            step > s.id
                                                ? "bg-chart-2 text-white cursor-pointer hover:bg-chart-2/90"
                                                : step === s.id
                                                ? "bg-chart-2 text-white"
                                                : "bg-muted text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        {step > s.id ? (
                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
                                        ) : (
                                            s.id
                                        )}
                                    </button>
                                    {i < STEPS.length - 1 && (
                                        <div className={cn("mx-2 h-0.5 w-16 transition-colors", step > s.id ? "bg-chart-2" : "bg-muted")} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <Label>Discount Type</Label>
                                    <div className="grid gap-3">
                                        {DISCOUNT_TYPES.map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => setType(t.value)}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-lg border text-left transition-all hover:border-chart-2/50 hover:bg-accent/50",
                                                    type === t.value ? "border-chart-2 bg-chart-2/5 ring-1 ring-chart-2" : "border-border"
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors",
                                                    type === t.value ? "bg-chart-2 text-white" : "bg-muted"
                                                )}>
                                                    <HugeiconsIcon icon={t.icon} className="h-6 w-6" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className={cn("font-medium", type === t.value && "text-chart-2")}>{t.label}</p>
                                                    <p className="text-sm text-muted-foreground">{t.description}</p>
                                                </div>
                                                {type === t.value && (
                                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-chart-2 shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="value">{type === "percentage" ? "Percentage Off" : "Amount Off"} <span className="text-destructive">*</span></Label>
                                    <div className="relative">
                                        <Input
                                            id="value"
                                            type="number"
                                            placeholder={selectedType?.placeholder}
                                            value={value}
                                            onChange={(e) => setValue(e.target.value)}
                                            className="h-12 text-lg pr-16"
                                            autoFocus
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">{selectedType?.suffix}</span>
                                    </div>
                                </div>

                                <div className="rounded-lg bg-muted/50 p-4">
                                    <p className="text-sm text-muted-foreground mb-2">Preview</p>
                                    <p className="text-2xl font-bold text-chart-2">{type === "percentage" ? `${value || 0}% OFF` : `${value || 0} OFF`}</p>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="rounded-lg border p-4 space-y-3">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 text-muted-foreground" />
                                        Discount Value
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/10">
                                            <HugeiconsIcon icon={selectedType?.icon || PercentIcon} className="h-6 w-6 text-chart-2" />
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-chart-2">{type === "percentage" ? `${value}%` : `${value}`}</p>
                                            <p className="text-sm text-muted-foreground">{selectedType?.label}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">Sale Name <span className="text-destructive">*</span></Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Black Friday Sale" className="h-11" autoFocus />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (optional)</Label>
                                    <Textarea id="description" placeholder="Internal notes..." value={description} onChange={(e) => setDescription(e.target.value)} className="resize-none" rows={3} />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-medium">Schedule</h3>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Set start date</Label>
                                            <p className="text-xs text-muted-foreground">Schedule when this sale becomes active</p>
                                        </div>
                                        <Switch checked={hasStartDate} onCheckedChange={setHasStartDate} />
                                    </div>
                                    {hasStartDate && <Input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="h-10" />}

                                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Set end date</Label>
                                            <p className="text-xs text-muted-foreground">Set when this sale expires</p>
                                        </div>
                                        <Switch checked={hasEndDate} onCheckedChange={setHasEndDate} />
                                    </div>
                                    {hasEndDate && <Input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="h-10" />}
                                </div>

                                <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Active</Label>
                                        <p className="text-xs text-muted-foreground">Sale is applied to products when active</p>
                                    </div>
                                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                                </div>

                                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                                    <p className="font-medium mb-1">Next Steps</p>
                                    <p className="text-muted-foreground">After creating this sale, you can assign products, collections, and categories from the sale details page.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t px-6 py-4">
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" onClick={() => step > 1 ? setStep(step - 1) : handleClose()}>
                                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                                {step > 1 ? "Back" : "Cancel"}
                            </Button>
                            
                            {step < 2 ? (
                                <Button onClick={() => setStep(step + 1)} disabled={!canProceed} className="bg-chart-2 hover:bg-chart-2/90">
                                    Continue
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button onClick={handleSubmit} disabled={isPending || !name.trim()} className="bg-chart-2 hover:bg-chart-2/90">
                                    {isPending ? (
                                        <>
                                            <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 mr-2" />
                                            Create Sale
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
