"use client";

import Image from "next/image";
import Link from "next/link";
import { Settings, ChevronsUpDown, ExternalLink, Globe, CreditCard, Truck, Palette, LayoutDashboard } from "lucide-react";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
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

const planConfig: Record<PlanType, { dot: string; label: string }> = {
    pro: { dot: "bg-success/100", label: "Pro" },
    trial: { dot: "bg-amber-500", label: "Trial" },
    free: { dot: "bg-muted-foreground/30", label: "Free" },
};

export function StoreMenu({ tenantName, storeLogo, planType, trialDaysLeft, storeSlug, isCollapsed }: StoreMenuProps) {
    const plan = planConfig[planType] || planConfig.free;

    const avatar = (
        <div className="relative flex shrink-0 items-center justify-center rounded-lg bg-foreground text-primary-foreground font-semibold text-xs size-8 overflow-hidden ring-1 ring-border/50">
            {storeLogo ? <Image src={storeLogo} alt={tenantName} fill className="object-cover" /> : tenantName.charAt(0).toUpperCase()}
        </div>
    );

    const trigger = (
        <button className={cn(
            "group flex items-center rounded-lg text-left transition-colors",
            isCollapsed ? "size-10 justify-center hover:bg-accent" : "w-full gap-2.5 px-2 py-1.5 hover:bg-accent"
        )} aria-label="Store menu">
            {avatar}
            {!isCollapsed && (
                <>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate leading-none">{tenantName}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 leading-none">
                            <span className={cn("size-1.5 rounded-full shrink-0", plan.dot)} />
                            {plan.label}{planType === "trial" && ` · ${trialDaysLeft}d left`}
                        </p>
                    </div>
                    <ChevronsUpDown className="size-3 text-muted-foreground/50" />
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
            <DropdownMenuContent align="start" side={isCollapsed ? "right" : "bottom"} sideOffset={isCollapsed ? 12 : 4} className="w-56">
                {/* Store info */}
                <div className="flex items-center gap-2.5 px-2 py-2">
                    {avatar}
                    <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{tenantName}</p>
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <span className={cn("size-1.5 rounded-full", plan.dot)} />
                            {plan.label} plan
                        </p>
                    </div>
                </div>
                <DropdownMenuSeparator />

                {storeSlug && (
                    <DropdownMenuItem asChild className="gap-2 text-xs">
                        <Link href={`/store/${storeSlug}`} target="_blank">
                            <ExternalLink className="size-3.5 text-muted-foreground" /> View Store
                        </Link>
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link href="/dashboard/pages">
                        <Palette className="size-3.5 text-muted-foreground" /> Website
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link href="/dashboard/settings/domains">
                        <Globe className="size-3.5 text-muted-foreground" /> Domains
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link href="/dashboard/settings/payments">
                        <CreditCard className="size-3.5 text-muted-foreground" /> Payments
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link href="/dashboard/settings/shipping">
                        <Truck className="size-3.5 text-muted-foreground" /> Shipping
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link href="/dashboard/settings">
                        <Settings className="size-3.5 text-muted-foreground" /> All Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
