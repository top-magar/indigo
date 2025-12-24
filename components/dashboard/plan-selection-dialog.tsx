"use client";

import { useId } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  RefreshIcon,
  Tick02Icon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

export interface Plan {
  id: string;
  name: string;
  price: string;
  description: string;
  features?: string[];
  popular?: boolean;
}

interface PlanSelectionDialogProps {
  plans: Plan[];
  currentPlanId?: string;
  onPlanChange?: (planId: string) => void;
  trigger?: React.ReactNode;
  title?: string;
  description?: string;
}

const defaultPlans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    description: "For individuals getting started",
    features: ["Up to 10 products", "Basic analytics", "Email support"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29/mo",
    description: "For growing businesses",
    features: [
      "Unlimited products",
      "Advanced analytics",
      "Priority support",
      "Custom domain",
      "Remove branding",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
      "Team management",
    ],
  },
];

export function PlanSelectionDialog({
  plans = defaultPlans,
  currentPlanId = "free",
  onPlanChange,
  trigger,
  title = "Change your plan",
  description = "Pick one of the following plans.",
}: PlanSelectionDialogProps) {
  const id = useId();

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Change plan</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="mb-2 flex flex-col gap-2">
          <div
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-muted"
          >
            <HugeiconsIcon icon={RefreshIcon} className="w-5 h-5 text-muted-foreground" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-left">{title}</DialogTitle>
            <DialogDescription className="text-left">{description}</DialogDescription>
          </DialogHeader>
        </div>

        <form className="space-y-5">
          <RadioGroup
            className="gap-2"
            defaultValue={currentPlanId}
            onValueChange={onPlanChange}
          >
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={cn(
                  "relative flex w-full items-center gap-2 rounded-lg border px-4 py-3 transition-colors",
                  "has-data-[state=checked]:border-primary/50 has-data-[state=checked]:bg-primary/5",
                  plan.popular && "ring-1 ring-primary/20"
                )}
              >
                <RadioGroupItem
                  aria-describedby={`${id}-${index}-description`}
                  className="order-1 after:absolute after:inset-0"
                  id={`${id}-${index}`}
                  value={plan.id}
                />
                <div className="grid grow gap-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${id}-${index}`} className="font-medium">
                      {plan.name}
                    </Label>
                    {plan.popular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        <HugeiconsIcon icon={Rocket01Icon} className="w-3 h-3" />
                        Popular
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs" id={`${id}-${index}-description`}>
                    {plan.price} · {plan.description}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>

          {plans.find((p) => p.id === currentPlanId)?.features && (
            <div className="space-y-3">
              <p>
                <strong className="font-medium text-sm">Features include:</strong>
              </p>
              <ul className="space-y-2 text-muted-foreground text-sm">
                {plans
                  .find((p) => p.id === currentPlanId)
                  ?.features?.map((feature, i) => (
                    <li key={i} className="flex gap-2">
                      <HugeiconsIcon
                        icon={Tick02Icon}
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-primary w-4 h-4"
                      />
                      {feature}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          <div className="grid gap-2">
            <Button className="w-full" type="button">
              Change plan
            </Button>
            <DialogClose asChild>
              <Button className="w-full" type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
