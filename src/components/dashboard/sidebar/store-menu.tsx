"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Store01Icon,
    Settings01Icon,
    ArrowDown01Icon,
    CheckmarkCircle02Icon,
    Add01Icon,
    LinkSquare01Icon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatCurrency } from "./navigation";
import type { PlanType } from "./types";

interface StoreMenuProps {
    tenantName: string;
    storeLogo?: string | null;
    planType: PlanType;
    trialDaysLeft: number;
    totalNotifications: number;
    pendingOrdersCount: number;
    totalProducts: number;
    monthlyRevenue: number;
    storeSlug?: string;
    isCollapsed: boolean;
}

export function StoreMenu({
    tenantName,
    storeLogo,
    planType,
    trialDaysLeft,
    totalNotifications,
    pendingOrdersCount,
    totalProducts,
    monthlyRevenue,
    storeSlug,
    isCollapsed,
}: StoreMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "group flex w-full items-center gap-3 p-2 rounded-xl transition-all text-left border border-transparent",
                        !isCollapsed && "hover:bg-accent/60 hover:border-border/50",
                        isCollapsed && "justify-center p-1.5 rounded-lg"
                    )}
                    aria-label="Store menu"
                >
                    <div className={cn(
                        "relative flex shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-lg transition-all overflow-hidden",
                        isCollapsed ? "h-8 w-8 text-xs rounded-lg" : "h-10 w-10 text-sm"
                    )}>
                        {storeLogo ? (
                            <img src={storeLogo} alt={tenantName} className="h-full w-full object-cover" />
                        ) : (
                            tenantName.charAt(0).toUpperCase()
                        )}
                        {totalNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-chart-4 px-1 text-[9px] font-medium text-primary-foreground">
                                {totalNotifications > 9 ? "9+" : totalNotifications}
                            </span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{tenantName}</p>
                                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                    {planType === "pro" ? (
                                        <>
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-chart-2" />
                                            Pro Plan
                                        </>
                                    ) : planType === "trial" ? (
                                        <>
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-chart-4 animate-pulse" />
                                            Trial · {trialDaysLeft}d left
                                        </>
                                    ) : (
                                        <>
                                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                                            Free Plan
                                        </>
                                    )}
                                </p>
                            </div>
                            <div className="p-1.5 rounded-md group-hover:bg-muted transition-colors">
                                <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-[260px] p-1.5 rounded-xl">
                {/* Current Store Info */}
                <div className="p-3 mb-1.5 mx-0.5 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground text-sm font-bold shadow-md overflow-hidden">
                            {storeLogo ? (
                                <img src={storeLogo} alt={tenantName} className="h-full w-full object-cover" />
                            ) : (
                                tenantName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{tenantName}</p>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                {planType === "pro" ? (
                                    <Badge className="bg-chart-2 hover:bg-chart-2 text-[9px] py-0 px-1.5 h-4">Pro</Badge>
                                ) : planType === "trial" ? (
                                    <Badge className="bg-chart-4 hover:bg-chart-4 text-[9px] py-0 px-1.5 h-4">{trialDaysLeft}d Trial</Badge>
                                ) : (
                                    <Badge variant="secondary" className="text-[9px] py-0 px-1.5 h-4">Free</Badge>
                                )}
                            </p>
                        </div>
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-chart-2" />
                    </div>

                    {/* Store Stats */}
                    <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/50">
                        <div className="text-center">
                            <p className="text-sm font-bold">{pendingOrdersCount}</p>
                            <p className="text-[10px] text-muted-foreground">Pending</p>
                        </div>
                        <div className="text-center border-x border-border/50">
                            <p className="text-sm font-bold">{totalProducts}</p>
                            <p className="text-[10px] text-muted-foreground">Products</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold">{formatCurrency(monthlyRevenue)}</p>
                            <p className="text-[10px] text-muted-foreground">Revenue</p>
                        </div>
                    </div>
                </div>

                <DropdownMenuSeparator className="my-1.5 mx-0.5" />

                <DropdownMenuLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2.5 py-1.5">
                    Quick Actions
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className="gap-2.5 text-sm rounded-lg mx-0.5 px-2.5 h-9 cursor-pointer">
                    <Link href="/dashboard/settings">
                        <HugeiconsIcon icon={Settings01Icon} className="w-4 h-4 text-muted-foreground" />
                        Store Settings
                    </Link>
                </DropdownMenuItem>
                {storeSlug && (
                    <DropdownMenuItem asChild className="gap-2.5 text-sm rounded-lg mx-0.5 px-2.5 h-9 cursor-pointer">
                        <Link href={`/store/${storeSlug}`} target="_blank">
                            <HugeiconsIcon icon={Store01Icon} className="w-4 h-4 text-muted-foreground" />
                            View Storefront
                            <HugeiconsIcon icon={LinkSquare01Icon} className="w-3 h-3 ml-auto text-muted-foreground" />
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-1.5 mx-0.5" />

                <DropdownMenuItem className="gap-2.5 text-sm rounded-lg mx-0.5 px-2.5 h-9 text-primary font-medium cursor-pointer">
                    <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
                    Create New Store
                    <Badge variant="secondary" className="ml-auto text-[9px] py-0 px-1.5">Soon</Badge>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
