"use client";

import { Button } from "@/components/ui/button";
import { Package, CreditCard, Globe, Palette, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/utils";

interface SetupStep {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  completed: boolean;
}

interface SetupChecklistProps {
  storeName: string;
  hasProducts: boolean;
  hasPayments: boolean;
  hasDomain: boolean;
}

export function SetupChecklist({ storeName, hasProducts, hasPayments, hasDomain }: SetupChecklistProps) {
  const steps: SetupStep[] = [
    { id: "product", label: "Add your first product", description: "List something to sell — add photos, pricing, and inventory", href: "/dashboard/products/new", icon: Package, completed: hasProducts },
    { id: "payments", label: "Set up payments", description: "Connect eSewa, Khalti, or enable cash on delivery", href: "/dashboard/settings/payments", icon: CreditCard, completed: hasPayments },
    { id: "storefront", label: "Customize your store", description: "Add your brand colors, logo, and homepage layout", href: "/dashboard/settings", icon: Palette, completed: false },
    { id: "domain", label: "Add a custom domain", description: "Connect your own .com or .np domain", href: "/dashboard/settings/domains", icon: Globe, completed: hasDomain },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const nextStep = steps.find(s => !s.completed);

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-medium">Get {storeName} ready to sell</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {steps.length} steps complete
            </p>
          </div>
          {/* Circular progress */}
          <div className="relative size-10">
            <svg className="size-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-muted" />
              <circle
                cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="2.5"
                className="text-foreground"
                strokeDasharray={`${(completedCount / steps.length) * 94.2} 94.2`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium tabular-nums">
              {completedCount}/{steps.length}
            </span>
          </div>
        </div>

        {/* Next step CTA */}
        {nextStep && (
          <Button asChild className="w-full">
            <Link href={nextStep.href}>
              <nextStep.icon className="size-4" />
              {nextStep.label}
              <ArrowRight className="size-3.5 ml-auto" />
            </Link>
          </Button>
        )}
      </div>

      {/* Steps */}
      <div className="border-t divide-y">
        {steps.map((step, i) => (
          <Link
            key={step.id}
            href={step.completed ? "#" : step.href}
            className={cn(
              "flex items-center gap-3 px-5 py-3 transition-colors",
              step.completed ? "bg-muted/30" : "hover:bg-muted/50"
            )}
          >
            {/* Step number / check */}
            <div className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-medium",
              step.completed
                ? "bg-foreground text-background"
                : "border border-border text-muted-foreground"
            )}>
              {step.completed ? <Check className="size-3" /> : i + 1}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm",
                step.completed ? "text-muted-foreground line-through" : "font-medium"
              )}>
                {step.label}
              </p>
              {!step.completed && (
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              )}
            </div>

            {/* Arrow for incomplete */}
            {!step.completed && (
              <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
