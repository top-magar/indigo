"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Add01Icon,
    PackageIcon,
    ShoppingCart01Icon,
    Store01Icon,
    CreditCardIcon,
    AnalyticsUpIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";

export interface QuickAction {
    id: string;
    label: string;
    description?: string;
    href: string;
    icon: typeof Add01Icon;
    variant?: "default" | "primary" | "warning";
    external?: boolean;
}

const defaultActions: QuickAction[] = [
    {
        id: "add-product",
        label: "Add Product",
        description: "Create a new product listing",
        href: "/dashboard/products/new",
        icon: Add01Icon,
        variant: "primary",
    },
    {
        id: "view-orders",
        label: "View Orders",
        description: "Manage customer orders",
        href: "/dashboard/orders",
        icon: ShoppingCart01Icon,
    },
    {
        id: "manage-inventory",
        label: "Inventory",
        description: "Check stock levels",
        href: "/dashboard/products",
        icon: PackageIcon,
    },
    {
        id: "analytics",
        label: "Analytics",
        description: "View store insights",
        href: "/dashboard/analytics",
        icon: AnalyticsUpIcon,
    },
];

interface QuickActionsProps {
    actions?: QuickAction[];
    storeSlug?: string;
    hasStripeConnected?: boolean;
    className?: string;
    layout?: "grid" | "list";
}

export function QuickActions({ 
    actions = defaultActions, 
    storeSlug,
    hasStripeConnected = true,
    className,
    layout = "grid"
}: QuickActionsProps) {
    // Build dynamic actions based on store state
    const dynamicActions = [...actions];

    // Add store link if slug exists
    if (storeSlug) {
        dynamicActions.push({
            id: "view-store",
            label: "View Store",
            description: "See your live storefront",
            href: `/store/${storeSlug}`,
            icon: Store01Icon,
            external: true,
        });
    }

    // Add payment setup if not connected
    if (!hasStripeConnected) {
        dynamicActions.unshift({
            id: "setup-payments",
            label: "Setup Payments",
            description: "Connect Stripe to accept payments",
            href: "/dashboard/settings/payments",
            icon: CreditCardIcon,
            variant: "warning",
        });
    }

    if (layout === "list") {
        return (
            <div className={cn("space-y-2", className)}>
                {dynamicActions.slice(0, 5).map((action) => (
                    <Button
                        key={action.id}
                        variant="ghost"
                        className={cn(
                            "w-full justify-start h-auto py-3 px-3",
                            action.variant === "primary" && "bg-primary/5 hover:bg-primary/10",
                            action.variant === "warning" && "bg-chart-4/5 hover:bg-chart-4/10"
                        )}
                        asChild
                    >
                        <Link 
                            href={action.href}
                            target={action.external ? "_blank" : undefined}
                        >
                            <div className={cn(
                                "h-8 w-8 rounded-lg flex items-center justify-center mr-3",
                                action.variant === "primary" ? "bg-primary/10" : 
                                action.variant === "warning" ? "bg-chart-4/10" : "bg-muted"
                            )}>
                                <HugeiconsIcon 
                                    icon={action.icon} 
                                    className={cn(
                                        "w-4 h-4",
                                        action.variant === "primary" ? "text-primary" :
                                        action.variant === "warning" ? "text-chart-4" : "text-muted-foreground"
                                    )} 
                                />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium">{action.label}</p>
                                {action.description && (
                                    <p className="text-xs text-muted-foreground">{action.description}</p>
                                )}
                            </div>
                        </Link>
                    </Button>
                ))}
            </div>
        );
    }

    return (
        <div className={cn("grid grid-cols-2 gap-2", className)}>
            {dynamicActions.slice(0, 4).map((action) => (
                <Button
                    key={action.id}
                    variant="outline"
                    className={cn(
                        "h-auto py-3 px-3 flex-col items-center gap-2",
                        action.variant === "primary" && "border-primary/30 bg-primary/5 hover:bg-primary/10",
                        action.variant === "warning" && "border-chart-4/30 bg-chart-4/5 hover:bg-chart-4/10"
                    )}
                    asChild
                >
                    <Link 
                        href={action.href}
                        target={action.external ? "_blank" : undefined}
                    >
                        <HugeiconsIcon 
                            icon={action.icon} 
                            className={cn(
                                "w-5 h-5",
                                action.variant === "primary" ? "text-primary" :
                                action.variant === "warning" ? "text-chart-4" : "text-muted-foreground"
                            )} 
                        />
                        <span className="text-xs font-medium">{action.label}</span>
                    </Link>
                </Button>
            ))}
        </div>
    );
}
