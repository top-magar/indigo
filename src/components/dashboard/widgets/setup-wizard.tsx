"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight,
    ChevronLeft,
    CheckCircle,
    ShoppingBag,
    Download,
    Briefcase,
    Sparkles,
    Store,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Stepper,
    StepperItem,
    StepperIndicator,
    StepperSeparator,
} from "@/components/ui/stepper";
import { cn } from "@/shared/utils";
import { BRAND_COLORS } from "@/config/brand-colors";

type BusinessType = "physical" | "digital" | "services" | null;

interface SetupWizardProps {
    storeName: string;
    hasProducts: boolean;
    hasPayments: boolean;
    storeSlug?: string;
}

const WIZARD_STORAGE_KEY = "indigo_setup_wizard_completed";

export function SetupWizard({ storeName, hasProducts, hasPayments, storeSlug }: SetupWizardProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [businessType, setBusinessType] = useState<BusinessType>(null);

    // Check if wizard should be shown
    useEffect(() => {
        const wizardCompleted = localStorage.getItem(WIZARD_STORAGE_KEY);
        // Show wizard if: not completed AND (no products OR no payments)
        if (!wizardCompleted && (!hasProducts || !hasPayments)) {
            // Small delay for better UX
            const timer = setTimeout(() => setOpen(true), 500);
            return () => clearTimeout(timer);
        }
    }, [hasProducts, hasPayments]);

    const handleComplete = () => {
        localStorage.setItem(WIZARD_STORAGE_KEY, "true");
        setOpen(false);
    };

    const handleSkip = () => {
        localStorage.setItem(WIZARD_STORAGE_KEY, "skipped");
        setOpen(false);
    };

    const steps = [
        { step: 1, title: "Business" },
        { step: 2, title: "Product" },
        { step: 3, title: "Payments" },
    ];

    const businessTypes = [
        {
            id: "physical" as const,
            title: "Physical products",
            description: "Clothing, electronics, handmade goods",
            icon: ShoppingBag,
        },
        {
            id: "digital" as const,
            title: "Digital products",
            description: "E-books, courses, software, templates",
            icon: Download,
        },
        {
            id: "services" as const,
            title: "Services",
            description: "Consulting, coaching, freelance work",
            icon: Briefcase,
        },
    ];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4 border-b">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Store className="w-4 h-4 text-primary" />
                            </div>
                            <span className="font-semibold">{storeName}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleSkip} className="text-muted-foreground">
                            Skip for now
                        </Button>
                    </div>
                    
                    {/* Stepper */}
                    <Stepper value={currentStep} className="gap-2">
                        {steps.map((s, index) => (
                            <StepperItem
                                key={s.step}
                                step={s.step}
                                className="flex-1 gap-2"
                                completed={s.step < currentStep}
                            >
                                <StepperIndicator className="size-8" />
                                <span className={cn(
                                    "text-sm hidden sm:block",
                                    currentStep === s.step ? "font-medium" : "text-muted-foreground"
                                )}>
                                    {s.title}
                                </span>
                                {index < steps.length - 1 && (
                                    <StepperSeparator className="flex-1" />
                                )}
                            </StepperItem>
                        ))}
                    </Stepper>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step 1: Business Type */}
                    {currentStep === 1 && (
                        <div className="space-y-4">
                            <DialogHeader className="text-left">
                                <DialogTitle>What do you sell?</DialogTitle>
                                <DialogDescription>
                                    This helps us customize your store experience
                                </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-3 pt-2">
                                {businessTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setBusinessType(type.id)}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                                            businessType === type.id
                                                ? "border-primary bg-primary/5"
                                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-10 w-10 rounded-lg flex items-center justify-center",
                                            businessType === type.id ? "bg-primary/10" : "bg-muted"
                                        )}>
                                            <type.icon 
                                                className={cn(
                                                    "w-5 h-5",
                                                    businessType === type.id ? "text-primary" : "text-muted-foreground"
                                                )} 
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{type.title}</p>
                                            <p className="text-sm text-muted-foreground">{type.description}</p>
                                        </div>
                                        {businessType === type.id && (
                                            <CheckCircle className="w-5 h-5 text-primary" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Add Product */}
                    {currentStep === 2 && (
                        <div className="space-y-4">
                            <DialogHeader className="text-left">
                                <DialogTitle>Add your first product</DialogTitle>
                                <DialogDescription>
                                    Products are the heart of your store. Let&apos;s add one now.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="pt-2 space-y-4">
                                {hasProducts ? (
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-chart-2/5 border border-chart-2/20">
                                        <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-chart-2" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-chart-2">You already have products!</p>
                                            <p className="text-sm text-muted-foreground">Great job, you&apos;re ahead of the game.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="p-4 rounded-xl bg-muted/50 border">
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Adding a product takes just a few minutes. You&apos;ll need:
                                            </p>
                                            <ul className="space-y-2 text-sm">
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    Product name and description
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    Price and inventory count
                                                </li>
                                                <li className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                    At least one product image
                                                </li>
                                            </ul>
                                        </div>
                                        <Button 
                                            className="w-full" 
                                            onClick={() => {
                                                handleComplete();
                                                router.push("/dashboard/products/new");
                                            }}
                                        >
                                            Add your first product
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Payments */}
                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <DialogHeader className="text-left">
                                <DialogTitle>Set up payments</DialogTitle>
                                <DialogDescription>
                                    Connect a payment provider to start accepting orders
                                </DialogDescription>
                            </DialogHeader>

                            <div className="pt-2 space-y-4">
                                {hasPayments ? (
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-chart-2/5 border border-chart-2/20">
                                        <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                                            <CheckCircle className="w-5 h-5 text-chart-2" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-chart-2">Payments connected!</p>
                                            <p className="text-sm text-muted-foreground">You&apos;re ready to accept orders.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-3">
                                        <button
                                            onClick={() => {
                                                handleComplete();
                                                router.push("/dashboard/settings/payments");
                                            }}
                                            className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 text-left transition-all"
                                        >
                                            <div 
                                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: `${BRAND_COLORS.stripe}10` }}
                                            >
                                                <span style={{ color: BRAND_COLORS.stripe }} className="font-bold text-sm">S</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">Stripe</p>
                                                <p className="text-sm text-muted-foreground">Cards, Apple Pay, Google Pay</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </button>

                                        <button
                                            onClick={() => {
                                                handleComplete();
                                                router.push("/dashboard/settings/payments");
                                            }}
                                            className="flex items-center gap-4 p-4 rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 text-left transition-all"
                                        >
                                            <div 
                                                className="h-10 w-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: `${BRAND_COLORS.esewa}10` }}
                                            >
                                                <span style={{ color: BRAND_COLORS.esewa }} className="font-bold text-sm">e</span>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">eSewa</p>
                                                <p className="text-sm text-muted-foreground">Popular in Nepal</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                        disabled={currentStep === 1}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    {currentStep < steps.length ? (
                        <Button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={currentStep === 1 && !businessType}
                        >
                            Continue
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    ) : (
                        <Button onClick={handleComplete}>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Finish setup
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
