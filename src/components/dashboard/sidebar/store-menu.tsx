"use client";

import Link from "next/link";
import { Store, Settings, ChevronDown, CheckCircle, Plus, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
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

export function StoreMenu({
    tenantName,
    storeLogo,
    planType,
    trialDaysLeft,
    storeSlug,
    isCollapsed,
}: StoreMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "group flex items-center rounded-lg text-left border border-transparent",
                        "transition-all duration-200 ease-out motion-reduce:transition-none",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                        isCollapsed 
                            ? "h-10 w-10 justify-center p-0" 
                            : "w-full gap-3 p-2 hover:bg-muted hover:border-border active:scale-[0.99]"
                    )}
                    aria-label="Store menu"
                >
                    <div className={cn(
                        "relative flex shrink-0 items-center justify-center rounded-lg bg-foreground text-primary-foreground font-semibold shadow-sm overflow-hidden",
                        "transition-transform duration-150 active:scale-[0.98] motion-reduce:transform-none",
                        isCollapsed ? "h-10 w-10 sm:h-8 sm:w-8 text-xs" : "h-10 w-10 text-sm"
                    )}>
                        {storeLogo ? (
                            <img src={storeLogo} alt={tenantName} className="h-full w-full object-cover" />
                        ) : (
                            tenantName.charAt(0).toUpperCase()
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-semibold tracking-[-0.28px] text-foreground truncate">{tenantName}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                {planType === "pro" ? (
                                    <>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-success" />
                                        Pro Plan
                                    </>
                                ) : planType === "trial" ? (
                                    <>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                                        Trial · {trialDaysLeft}d left
                                    </>
                                ) : (
                                    <>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                                        Free Plan
                                    </>
                                )}
                            </p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-muted-foreground transition-colors duration-150" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-64 p-2 rounded-lg overscroll-contain">
                {/* Current Store Info */}
                <div className="p-3 mb-2 rounded-md bg-muted">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-primary-foreground text-sm font-semibold tracking-[-0.28px] shadow-sm overflow-hidden">
                            {storeLogo ? (
                                <img src={storeLogo} alt={tenantName} className="h-full w-full object-cover" />
                            ) : (
                                tenantName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold tracking-[-0.28px] text-foreground truncate">{tenantName}</p>
                            <div className="mt-1">
                                {planType === "pro" ? (
                                    <Badge className="bg-success/10 text-success hover:bg-success/10 text-xs py-0 px-2 h-5 rounded-sm">Pro</Badge>
                                ) : planType === "trial" ? (
                                    <Badge className="bg-warning/10 text-warning hover:bg-warning/10 text-xs py-0 px-2 h-5 rounded-sm">{trialDaysLeft}d Trial</Badge>
                                ) : (
                                    <Badge className="bg-muted text-muted-foreground hover:bg-muted text-xs py-0 px-2 h-5 rounded-sm">Free</Badge>
                                )}
                            </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-success" />
                    </div>
                </div>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 py-2">
                    Quick Actions
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className="gap-3 text-sm rounded-md px-3 h-10 cursor-pointer">
                    <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">Store Settings</span>
                    </Link>
                </DropdownMenuItem>
                {storeSlug && (
                    <DropdownMenuItem asChild className="gap-3 text-sm rounded-md px-3 h-10 cursor-pointer">
                        <Link href={`/store/${storeSlug}`} target="_blank">
                            <Store className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">View Storefront</span>
                            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem className="gap-3 text-sm rounded-md px-3 h-10 text-foreground font-medium cursor-pointer" disabled>
                    <Plus className="h-4 w-4" />
                    Create New Store
                    <Badge className="ml-auto bg-muted text-muted-foreground hover:bg-muted text-xs py-0 px-2 rounded-sm">Soon…</Badge>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
