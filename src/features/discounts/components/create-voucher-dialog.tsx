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
    DeliveryTruck01Icon,
    Loading03Icon,
    Cancel01Icon,
    ArrowRight01Icon,
    ArrowLeft01Icon,
    CheckmarkCircle02Icon,
    Coupon01Icon,
    InformationCircleIcon,
    Calendar01Icon,
    ShoppingCart01Icon,
    UserMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { createDiscount } from "@/app/dashboard/marketing/discounts/actions";
import { toast } from "sonner";
import { cn } from "@/shared/utils";

interface CreateVoucherDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

type DiscountType = "percentage" | "fixed" | "free_shipping";
type VoucherScope = "entire_order" | "specific_products";

const STEPS = [
    { id: 1, title: "Type", description: "Choose discount type" },
    { id: 2, title: "Value", description: "Set discount value" },
    { id: 3, title: "Rules", description: "Requirements & limits" },
];

const DISCOUNT_TYPES = [
    {
        value: "percentage" as const,
        label: "Percentage Off",
        description: "Discount by a percentage of the price",
        icon: PercentIcon,
    },
    {
        value: "fixed" as const,
        label: "Fixed Amount",
        description: "Discount by a fixed dollar amount",
        icon: DollarCircleIcon,
    },
    {
        value: "free_shipping" as const,
        label: "Free Shipping",
        description: "Remove shipping costs entirely",
        icon: DeliveryTruck01Icon,
    },
];

export function CreateVoucherDialog({ open, onOpenChange, onSuccess }: CreateVoucherDialogProps) {
    const [isPending, startTransition] = useTransition();
    const [step, setStep] = useState(1);
    
    // Basic info
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<DiscountType>("percentage");
    const [value, setValue] = useState("10");
    const [scope, setScope] = useState<VoucherScope>("entire_order");
    
    // Requirements
    const [minOrderAmount, setMinOrderAmount] = useState("");
    const [minCheckoutItemsQuantity, setMinCheckoutItemsQuantity] = useState("");
    
    // Limits
    const [hasUsageLimit, setHasUsageLimit] = useState(false);
    const [usageLimit, setUsageLimit] = useState("");
    const [applyOncePerCustomer, setApplyOncePerCustomer] = useState(false);
    const [onlyForStaff, setOnlyForStaff] = useState(false);
    const [singleUse, setSingleUse] = useState(false);
    
    // Dates
    const [hasStartDate, setHasStartDate] = useState(false);
    const [hasEndDate, setHasEndDate] = useState(false);
    const [startsAt, setStartsAt] = useState("");
    const [endsAt, setEndsAt] = useState("");
    
    // Options
    const [applyOncePerOrder, setApplyOncePerOrder] = useState(false);
    const [isActive, setIsActive] = useState(true);

    const resetForm = useCallback(() => {
        setStep(1);
        setName("");
        setDescription("");
        setType("percentage");
        setValue("10");
        setScope("entire_order");
        setMinOrderAmount("");
        setMinCheckoutItemsQuantity("");
        setHasUsageLimit(false);
        setUsageLimit("");
        setApplyOncePerCustomer(false);
        setOnlyForStaff(false);
        setSingleUse(false);
        setHasStartDate(false);
        setHasEndDate(false);
        setStartsAt("");
        setEndsAt("");
        setApplyOncePerOrder(false);
        setIsActive(true);
    }, []);

    const handleClose = useCallback(() => {
        resetForm();
        onOpenChange(false);
    }, [resetForm, onOpenChange]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            toast.error("Please enter a voucher name");
            setStep(2);
            return;
        }
        
        startTransition(async () => {
            const result = await createDiscount({
                name,
                description: description || undefined,
                kind: "voucher",
                type,
                value: parseFloat(value),
                scope,
                minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
                minCheckoutItemsQuantity: minCheckoutItemsQuantity ? parseInt(minCheckoutItemsQuantity) : null,
                usageLimit: hasUsageLimit && usageLimit ? parseInt(usageLimit) : null,
                applyOncePerCustomer,
                onlyForStaff,
                singleUse,
                startsAt: hasStartDate ? startsAt : null,
                endsAt: hasEndDate ? endsAt : null,
                applyOncePerOrder,
                isActive,
            });

            if (result.success) {
                toast.success("Voucher created successfully");
                handleClose();
                onSuccess?.();
            } else {
                toast.error(result.error || "Failed to create voucher");
            }
        });
    };

    const canProceed = step === 1 || (step === 2 && name.trim() && (type === "free_shipping" || value));
    const selectedType = DISCOUNT_TYPES.find(t => t.value === type);

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
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <HugeiconsIcon icon={Coupon01Icon} className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Create Voucher</h2>
                                    <p className="text-sm text-muted-foreground">
                                        Step {step} of {STEPS.length}: {STEPS[step - 1].description}
                                    </p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={handleClose}>
                                <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
                            </Button>
                        </div>
                        
                        {/* Progress Steps */}
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
                                                ? "bg-primary text-primary-foreground cursor-pointer hover:bg-primary/90"
                                                : step === s.id
                                                ? "bg-primary text-primary-foreground"
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
                                <div className="space-y-3">
                                    <Label>Discount Type</Label>
                                    <div className="grid gap-3">
                                        {DISCOUNT_TYPES.map((t) => (
                                            <button
                                                key={t.value}
                                                type="button"
                                                onClick={() => setType(t.value)}
                                                className={cn(
                                                    "flex items-center gap-3 p-4 rounded-lg border text-left transition-all",
                                                    "hover:border-primary/50 hover:bg-accent/50",
                                                    type === t.value
                                                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                        : "border-border"
                                                )}
                                            >
                                                <div
                                                    className={cn(
                                                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg transition-colors",
                                                        type === t.value ? "bg-primary text-primary-foreground" : "bg-muted"
                                                    )}
                                                >
                                                    <HugeiconsIcon icon={t.icon} className="h-6 w-6" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className={cn("font-medium", type === t.value && "text-primary")}>
                                                        {t.label}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">{t.description}</p>
                                                </div>
                                                {type === t.value && (
                                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-5 w-5 text-primary shrink-0" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Scope */}
                                <div className="space-y-3">
                                    <Label>Applies To</Label>
                                    <div className="grid gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setScope("entire_order")}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                                                "hover:border-primary/50 hover:bg-accent/50",
                                                scope === "entire_order"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                                                scope === "entire_order" ? "bg-primary text-primary-foreground" : "bg-muted"
                                            )}>
                                                <HugeiconsIcon icon={ShoppingCart01Icon} className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Entire order</p>
                                                <p className="text-xs text-muted-foreground">Discount applies to the entire order subtotal</p>
                                            </div>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setScope("specific_products")}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                                                "hover:border-primary/50 hover:bg-accent/50",
                                                scope === "specific_products"
                                                    ? "border-primary bg-primary/5"
                                                    : "border-border"
                                            )}
                                        >
                                            <div className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                                                scope === "specific_products" ? "bg-primary text-primary-foreground" : "bg-muted"
                                            )}>
                                                <HugeiconsIcon icon={Coupon01Icon} className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">Specific products</p>
                                                <p className="text-xs text-muted-foreground">Discount applies only to selected products</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Value & Details */}
                        {step === 2 && (
                            <div className="space-y-6">
                                {/* Selected Type Preview */}
                                {selectedType && (
                                    <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                            <HugeiconsIcon icon={selectedType.icon} className="h-5 w-5 text-primary" />
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
                                        Voucher Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g., Summer Sale, Welcome10, FREESHIP"
                                        className="h-11"
                                        autoFocus
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Internal name for this voucher
                                    </p>
                                </div>

                                {/* Value */}
                                {type !== "free_shipping" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="value">
                                            {type === "percentage" ? "Percentage Off" : "Amount Off"} <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="value"
                                                type="number"
                                                placeholder={type === "percentage" ? "10" : "5.00"}
                                                value={value}
                                                onChange={(e) => setValue(e.target.value)}
                                                className="h-11 pr-12"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                {type === "percentage" ? "%" : "USD"}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description (optional)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Internal notes about this voucher..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="resize-none"
                                        rows={3}
                                    />
                                </div>

                                {/* Active Status */}
                                <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                    <div className="space-y-0.5">
                                        <Label className="text-sm font-medium">Active</Label>
                                        <p className="text-xs text-muted-foreground">
                                            Customers can use this voucher when active
                                        </p>
                                    </div>
                                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                                </div>
                            </div>
                        )}

                        {/* Step 3: Rules */}
                        {step === 3 && (
                            <div className="space-y-6">
                                {/* Summary */}
                                <div className="rounded-lg border p-4 space-y-3">
                                    <h3 className="font-medium flex items-center gap-2">
                                        <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4 text-muted-foreground" />
                                        Summary
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Name</p>
                                            <p className="font-medium">{name}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Type</p>
                                            <p className="font-medium">{selectedType?.label}</p>
                                        </div>
                                        {type !== "free_shipping" && (
                                            <div>
                                                <p className="text-muted-foreground">Value</p>
                                                <p className="font-medium">
                                                    {type === "percentage" ? `${value}%` : `${value}`}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-muted-foreground">Scope</p>
                                            <p className="font-medium">
                                                {scope === "entire_order" ? "Entire order" : "Specific products"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Dates */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={Calendar01Icon} className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-medium">Active Dates</h3>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Set start date</Label>
                                            <p className="text-xs text-muted-foreground">Schedule when this voucher becomes active</p>
                                        </div>
                                        <Switch checked={hasStartDate} onCheckedChange={setHasStartDate} />
                                    </div>
                                    {hasStartDate && (
                                        <Input
                                            type="datetime-local"
                                            value={startsAt}
                                            onChange={(e) => setStartsAt(e.target.value)}
                                            className="h-10"
                                        />
                                    )}

                                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Set end date</Label>
                                            <p className="text-xs text-muted-foreground">Set when this voucher expires</p>
                                        </div>
                                        <Switch checked={hasEndDate} onCheckedChange={setHasEndDate} />
                                    </div>
                                    {hasEndDate && (
                                        <Input
                                            type="datetime-local"
                                            value={endsAt}
                                            onChange={(e) => setEndsAt(e.target.value)}
                                            className="h-10"
                                        />
                                    )}
                                </div>

                                {/* Minimum Requirements */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={ShoppingCart01Icon} className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-medium">Minimum Requirements</h3>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="minOrderAmount">Minimum order amount</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                                            <Input
                                                id="minOrderAmount"
                                                type="number"
                                                placeholder="0.00"
                                                value={minOrderAmount}
                                                onChange={(e) => setMinOrderAmount(e.target.value)}
                                                className="pl-7 h-10"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="minItems">Minimum quantity of items</Label>
                                        <Input
                                            id="minItems"
                                            type="number"
                                            placeholder="0"
                                            value={minCheckoutItemsQuantity}
                                            onChange={(e) => setMinCheckoutItemsQuantity(e.target.value)}
                                            className="h-10"
                                        />
                                    </div>
                                </div>

                                {/* Usage Limits */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <HugeiconsIcon icon={UserMultiple02Icon} className="h-4 w-4 text-muted-foreground" />
                                        <h3 className="font-medium">Usage Limits</h3>
                                    </div>
                                    
                                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Limit total uses</Label>
                                            <p className="text-xs text-muted-foreground">Set a total usage limit for all codes</p>
                                        </div>
                                        <Switch checked={hasUsageLimit} onCheckedChange={setHasUsageLimit} />
                                    </div>
                                    {hasUsageLimit && (
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            value={usageLimit}
                                            onChange={(e) => setUsageLimit(e.target.value)}
                                            min={1}
                                            className="h-10"
                                        />
                                    )}

                                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Once per customer</Label>
                                            <p className="text-xs text-muted-foreground">Each customer can only use this once</p>
                                        </div>
                                        <Switch checked={applyOncePerCustomer} onCheckedChange={setApplyOncePerCustomer} />
                                    </div>

                                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Single use codes</Label>
                                            <p className="text-xs text-muted-foreground">Each code can only be used once</p>
                                        </div>
                                        <Switch checked={singleUse} onCheckedChange={setSingleUse} />
                                    </div>

                                    <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                                        <div className="space-y-0.5">
                                            <Label className="text-sm font-medium">Staff only</Label>
                                            <p className="text-xs text-muted-foreground">Only staff members can use this</p>
                                        </div>
                                        <Switch checked={onlyForStaff} onCheckedChange={setOnlyForStaff} />
                                    </div>
                                </div>
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
                                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 mr-2" />
                                {step > 1 ? "Back" : "Cancel"}
                            </Button>
                            
                            {step < 3 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={!canProceed}
                                >
                                    Continue
                                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isPending || !name.trim()}
                                >
                                    {isPending ? (
                                        <>
                                            <HugeiconsIcon icon={Loading03Icon} className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 mr-2" />
                                            Create Voucher
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
