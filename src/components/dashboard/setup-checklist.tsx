"use client";

import { Button } from "@/components/ui/button";
import { Package, CreditCard, Globe, Palette, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/shared/utils";

const STEPS = [
  { id: "product", label: "Add your first product", description: "List something to sell — add photos, pricing, and inventory", href: "/dashboard/products/new", icon: Package, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-950", ring: "stroke-blue-600" },
  { id: "payments", label: "Set up payments", description: "Connect eSewa, Khalti, or enable cash on delivery", href: "/dashboard/settings/payments", icon: CreditCard, color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-950", ring: "stroke-emerald-600" },
  { id: "storefront", label: "Customize your store", description: "Add your brand colors, logo, and homepage layout", href: "/dashboard/pages", icon: Palette, color: "text-violet-600", bg: "bg-violet-100 dark:bg-violet-950", ring: "stroke-violet-600" },
  { id: "domain", label: "Add a custom domain", description: "Connect your own .com or .np domain", href: "/dashboard/settings/domains", icon: Globe, color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-950", ring: "stroke-amber-600" },
] as const;

interface SetupChecklistProps {
  storeName: string;
  hasProducts: boolean;
  hasPayments: boolean;
  hasStorefront: boolean;
  hasDomain: boolean;
}

export function SetupChecklist({ storeName, hasProducts, hasPayments, hasStorefront, hasDomain }: SetupChecklistProps) {
  const completed = [hasProducts, hasPayments, hasStorefront, hasDomain];
  const completedCount = completed.filter(Boolean).length;
  const nextIdx = completed.findIndex(c => !c);
  const nextStep = nextIdx >= 0 ? STEPS[nextIdx] : null;

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-medium">Get {storeName} ready to sell</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {STEPS.length} steps complete
            </p>
          </div>
          {/* Circular progress */}
          <div className="relative size-10">
            <svg className="size-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" strokeWidth="2.5" className="stroke-muted" />
              <circle
                cx="18" cy="18" r="15" fill="none" strokeWidth="2.5"
                className={nextStep?.ring ?? "stroke-foreground"}
                strokeDasharray={`${(completedCount / STEPS.length) * 94.2} 94.2`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-medium tabular-nums">
              {completedCount}/{STEPS.length}
            </span>
          </div>
        </div>

        {/* Next step CTA */}
        {nextStep && (
          <Button asChild className="w-fit">
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
        {STEPS.map((step, i) => {
          const done = completed[i];
          return (
            <Link
              key={step.id}
              href={done ? "#" : step.href}
              className={cn(
                "flex items-center gap-3 px-5 py-3 transition-colors",
                done ? "bg-muted/30" : "hover:bg-muted/50"
              )}
            >
              {/* Icon circle */}
              <div className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                done
                  ? "bg-foreground text-background"
                  : step.bg
              )}>
                {done ? (
                  <Check className="size-3.5" />
                ) : (
                  <step.icon className={cn("size-3.5", step.color)} />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm",
                  done ? "text-muted-foreground line-through" : "font-medium"
                )}>
                  {step.label}
                </p>
                {!done && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                )}
              </div>

              {!done && <ArrowRight className="size-3.5 text-muted-foreground shrink-0" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
