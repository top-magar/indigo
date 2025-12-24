"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowRight01Icon,
  PackageIcon,
  CreditCardIcon,
  Store01Icon,
  PaintBoardIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface OnboardingStep {
  title: string;
  description: string;
  icon: typeof PackageIcon;
  action?: {
    label: string;
    href: string;
  };
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to your store! 🎉",
    description:
      "Let's get your store set up and ready to start selling. We'll guide you through the essential steps to launch your online business.",
    icon: Store01Icon,
  },
  {
    title: "Add your first product",
    description:
      "Start by adding products to your store. Include photos, descriptions, and pricing to showcase what you're selling.",
    icon: PackageIcon,
    action: {
      label: "Add Product",
      href: "/dashboard/products/new",
    },
  },
  {
    title: "Set up payments",
    description:
      "Connect your Stripe account to start accepting payments from customers. This only takes a few minutes.",
    icon: CreditCardIcon,
    action: {
      label: "Setup Payments",
      href: "/dashboard/settings/payments",
    },
  },
  {
    title: "Customize your storefront",
    description:
      "Make your store unique with our visual editor. Add sections, customize colors, and create a beautiful shopping experience.",
    icon: PaintBoardIcon,
    action: {
      label: "Open Editor",
      href: "/dashboard/store-editor",
    },
  },
  {
    title: "You're all set!",
    description:
      "Your store is ready to go live. Share your store link with customers and start making sales!",
    icon: CheckmarkCircle02Icon,
  },
];

interface OnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

export function OnboardingDialog({
  open,
  onOpenChange,
  onComplete,
}: OnboardingDialogProps) {
  const [step, setStep] = useState(0);
  const totalSteps = onboardingSteps.length;
  const currentStep = onboardingSteps[step];

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onComplete?.();
      onOpenChange(false);
    }
  };

  const handleSkip = () => {
    onComplete?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md gap-0 p-0">
        {/* Header illustration */}
        <div className="relative h-40 bg-linear-to-br from-primary/10 via-chart-1/10 to-chart-2/10 rounded-t-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-20 w-20 rounded-2xl bg-background shadow-lg flex items-center justify-center">
              <HugeiconsIcon
                icon={currentStep.icon}
                className="w-10 h-10 text-primary"
              />
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-4 left-4 h-8 w-8 rounded-lg bg-chart-1/20" />
          <div className="absolute bottom-4 right-4 h-6 w-6 rounded-full bg-chart-2/20" />
          <div className="absolute top-1/2 right-8 h-4 w-4 rounded bg-chart-4/20" />
        </div>

        <div className="space-y-6 px-6 pt-6 pb-6">
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl">{currentStep.title}</DialogTitle>
            <DialogDescription className="text-sm">
              {currentStep.description}
            </DialogDescription>
          </DialogHeader>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {onboardingSteps.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setStep(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  index === step
                    ? "w-6 bg-primary"
                    : index < step
                    ? "w-1.5 bg-primary/60"
                    : "w-1.5 bg-muted"
                )}
              />
            ))}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="ghost" onClick={handleSkip}>
                Skip setup
              </Button>
            </DialogClose>
            {currentStep.action ? (
              <Button asChild>
                <a href={currentStep.action.href}>
                  {currentStep.action.label}
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
                </a>
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {step === totalSteps - 1 ? "Get Started" : "Next"}
                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Checklist version for dashboard
interface OnboardingChecklistProps {
  completedSteps: string[];
  className?: string;
}

export function OnboardingChecklist({
  completedSteps,
  className,
}: OnboardingChecklistProps) {
  const checklistItems = [
    { id: "product", label: "Add your first product", href: "/dashboard/products/new" },
    { id: "payment", label: "Set up payments", href: "/dashboard/settings/payments" },
    { id: "storefront", label: "Customize storefront", href: "/dashboard/store-editor" },
  ];

  const allCompleted = checklistItems.every((item) =>
    completedSteps.includes(item.id)
  );

  if (allCompleted) return null;

  return (
    <div className={cn("rounded-lg border bg-card p-4", className)}>
      <h3 className="font-semibold text-sm mb-3">Getting Started</h3>
      <div className="space-y-2">
        {checklistItems.map((item) => {
          const isCompleted = completedSteps.includes(item.id);
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-2 rounded-md transition-colors",
                isCompleted
                  ? "text-muted-foreground"
                  : "hover:bg-muted/50"
              )}
            >
              <div
                className={cn(
                  "h-5 w-5 rounded-full border-2 flex items-center justify-center",
                  isCompleted
                    ? "border-chart-2 bg-chart-2"
                    : "border-muted-foreground/30"
                )}
              >
                {isCompleted && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="w-3 h-3 text-white"
                  />
                )}
              </div>
              <span
                className={cn(
                  "text-sm",
                  isCompleted && "line-through"
                )}
              >
                {item.label}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
