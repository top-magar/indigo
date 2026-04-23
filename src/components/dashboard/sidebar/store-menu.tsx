"use client";

import Link from "next/link";
import { Settings, ChevronDown, ExternalLink, FileText, CreditCard, Truck, Globe } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";
import type { PlanType } from "./types";

interface StoreMenuProps {
    tenantName: string;
    storeLogo?: string | null;
    planType: PlanType;
    trialDaysLeft: number;
    storeSlug?: string;
    isCollapsed: boolean;
}

function StoreAvatar({ name, logo }: { name: string; logo?: string | null }) {
    return (
        <div className="relative flex shrink-0 items-center justify-center rounded-lg bg-foreground text-primary-foreground font-semibold text-xs size-8 overflow-hidden">
            {logo ? <img src={logo} alt={name} className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
    );
}

const planConfig: Record<PlanType, { dot: string; label: string }> = {
    pro: { dot: "bg-emerald-500", label: "Pro" },
    trial: { dot: "bg-amber-500", label: "Trial" },
    free: { dot: "bg-muted-foreground/40", label: "Free" },
};

export function StoreMenu({ tenantName, storeLogo, planType, trialDaysLeft, storeSlug, isCollapsed }: StoreMenuProps) {
    const plan = planConfig[planType] || planConfig.free;

    const trigger = (
        <button
            className={cn(
                "group flex items-center rounded-lg text-left transition-colors",
                isCollapsed ? "size-10 justify-center hover:bg-muted" : "w-full gap-3 p-2 hover:bg-muted"
            )}
            aria-label="Store menu"
        >
            <StoreAvatar name={tenantName} logo={storeLogo} />
            {!isCollapsed && (
                <>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{tenantName}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <span className={cn("size-1.5 rounded-full", plan.dot)} />
                            {plan.label}{planType === "trial" && ` · ${trialDaysLeft}d left`}
                        </p>
                    </div>
                    <ChevronDown className="size-3 text-muted-foreground" />
                </>
            )}
        </button>
    );

    return (
        <DropdownMenu>
            {isCollapsed ? (
                <Tooltip>
                    <TooltipTrigger asChild><DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger></TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>{tenantName}</TooltipContent>
                </Tooltip>
            ) : (
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            )}
            <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-52">
                <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal">Quick access</DropdownMenuLabel>
                <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link href="/dashboard/pages"><FileText className="size-4 text-muted-foreground" />Pages</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link href="/dashboard/settings/domains"><Globe className="size-4 text-muted-foreground" />Domains</Link>
                </DropdownMenuItem>
                {storeSlug && (
                    <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                        <Link href={`/store/${storeSlug}`} target="_blank">
                            <ExternalLink className="size-4 text-muted-foreground" />View Store
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal">Store</DropdownMenuLabel>
                <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link href="/dashboard/settings/payments"><CreditCard className="size-4 text-muted-foreground" />Payments</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link href="/dashboard/settings/shipping"><Truck className="size-4 text-muted-foreground" />Shipping</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link href="/dashboard/settings"><Settings className="size-4 text-muted-foreground" />All Settings</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
