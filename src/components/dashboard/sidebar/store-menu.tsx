"use client";

import Link from "next/link";
import { Store, Settings, ChevronDown, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
        <div className="relative flex shrink-0 items-center justify-center rounded-lg bg-foreground text-primary-foreground font-semibold text-xs h-8 w-8 shadow-sm overflow-hidden">
            {logo ? <img src={logo} alt={name} className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
    );
}

function PlanIndicator({ planType, trialDaysLeft }: { planType: PlanType; trialDaysLeft: number }) {
    if (planType === "pro") return <><span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />Pro Plan</>;
    if (planType === "trial") return <><span className="inline-block w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />Trial · {trialDaysLeft}d left</>;
    return <><span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />Free Plan</>;
}

export function StoreMenu({ tenantName, storeLogo, planType, trialDaysLeft, storeSlug, isCollapsed }: StoreMenuProps) {
    const trigger = (
        <button
            className={cn(
                "group flex items-center rounded-lg text-left border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isCollapsed ? "h-10 w-10 justify-center p-0 hover:bg-muted" : "w-full gap-3 p-2 hover:bg-muted hover:border-border active:scale-[0.99]"
            )}
            aria-label="Store menu"
        >
            <StoreAvatar name={tenantName} logo={storeLogo} />
            {!isCollapsed && (
                <>
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <p className="text-xs font-semibold tracking-[-0.28px] text-foreground truncate">{tenantName}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <PlanIndicator planType={planType} trialDaysLeft={trialDaysLeft} />
                        </p>
                    </div>
                    <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </>
            )}
        </button>
    );

    return (
        <DropdownMenu>
            {isCollapsed ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>{tenantName}</TooltipContent>
                </Tooltip>
            ) : (
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            )}
            <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-56 overscroll-contain">
                <DropdownMenuItem asChild className="gap-2 text-xs h-8 cursor-pointer">
                    <Link href="/dashboard/settings">
                        <Settings className="size-3.5 text-muted-foreground" />
                        Store Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
