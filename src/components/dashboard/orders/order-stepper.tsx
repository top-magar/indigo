"use client";

import {
  ShoppingCart,
  CheckCircle,
  Package,
  Truck,
  Home,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";

export type OrderStatus = 
  | "pending" 
  | "confirmed" 
  | "processing" 
  | "shipped" 
  | "delivered" 
  | "completed" 
  | "cancelled";

interface OrderStepperProps {
  currentStatus: OrderStatus;
  className?: string;
}

const steps = [
  { status: "pending", label: "Placed", icon: ShoppingCart },
  { status: "confirmed", label: "Confirmed", icon: CheckCircle },
  { status: "processing", label: "Processing", icon: Package },
  { status: "shipped", label: "Shipped", icon: Truck },
  { status: "delivered", label: "Delivered", icon: Home },
];

const statusToStep: Record<OrderStatus, number> = {
  pending: 1,
  confirmed: 2,
  processing: 3,
  shipped: 4,
  delivered: 5,
  completed: 5,
  cancelled: 0,
};

export function OrderStepper({ currentStatus, className }: OrderStepperProps) {
  const currentStep = statusToStep[currentStatus];

  if (currentStatus === "cancelled") {
    return (
      <div className={cn("flex items-center justify-center py-4", className)}>
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive">
          <span className="text-sm font-medium">Order Cancelled</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center w-full">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const Icon = step.icon;

          return (
            <div key={step.status} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center transition-all",
                    isCompleted && "bg-chart-2 text-white",
                    isActive && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isCompleted && !isActive && "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium whitespace-nowrap",
                    isCompleted && "text-chart-2",
                    isActive && "text-primary",
                    !isCompleted && !isActive && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors",
                    isCompleted ? "bg-chart-2" : "bg-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
