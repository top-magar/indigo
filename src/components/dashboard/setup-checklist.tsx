"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, CreditCard, Globe, Palette, Check } from "lucide-react";
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
    { id: "product", label: "Add your first product", description: "List something to sell", href: "/dashboard/products/new", icon: Package, completed: hasProducts },
    { id: "payments", label: "Set up payments", description: "Accept eSewa, Khalti, or COD", href: "/dashboard/settings/payments", icon: CreditCard, completed: hasPayments },
    { id: "storefront", label: "Customize storefront", description: "Make your store look great", href: "/dashboard/settings", icon: Palette, completed: false },
    { id: "domain", label: "Add a custom domain", description: "Use your own .com", href: "/dashboard/settings/domains", icon: Globe, completed: hasDomain },
  ];

  const completedCount = steps.filter(s => s.completed).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Set up {storeName}</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount === steps.length
                ? "You're all set! 🎉"
                : `${completedCount} of ${steps.length} completed`}
            </p>
          </div>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">{progress}%</span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-foreground rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {steps.map((step) => (
          <Link
            key={step.id}
            href={step.completed ? "#" : step.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors",
              step.completed
                ? "opacity-60"
                : "hover:bg-muted/50"
            )}
          >
            <div className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border transition-colors",
              step.completed
                ? "bg-foreground border-foreground text-background"
                : "border-border"
            )}>
              {step.completed ? (
                <Check className="size-3.5" />
              ) : (
                <step.icon className="size-3.5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium", step.completed && "line-through")}>{step.label}</p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
            {!step.completed && (
              <Button variant="ghost" size="sm" className="shrink-0 text-xs" tabIndex={-1}>
                Start
              </Button>
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
