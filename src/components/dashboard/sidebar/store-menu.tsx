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
import { cn, formatCurrency } from "@/shared/utils";
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
                        "group flex items-center rounded-lg text-left border border-transparent",
                        "transition-all duration-200 ease-out motion-reduce:transition-none",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-1",
                        isCollapsed 
                            ? "h-10 w-10 justify-center p-0" 
                            : "w-full gap-3 p-2 hover:bg-[var(--ds-gray-100)] hover:border-[var(--ds-gray-200)] active:scale-[0.99]"
                    )}
                    aria-label="Store menu"
                >
                    <div className={cn(
                        "relative flex shrink-0 items-center justify-center rounded-lg bg-[var(--ds-gray-1000)] text-white font-semibold shadow-sm overflow-hidden",
                        "transition-transform duration-150 active:scale-[0.98] motion-reduce:transform-none",
                        isCollapsed ? "h-10 w-10 sm:h-8 sm:w-8 text-xs" : "h-10 w-10 text-sm"
                    )}>
                        {storeLogo ? (
                            <img src={storeLogo} alt={tenantName} className="h-full w-full object-cover" />
                        ) : (
                            tenantName.charAt(0).toUpperCase()
                        )}
                        {totalNotifications > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ds-amber-700)] px-1 text-xs font-medium text-white">
                                {totalNotifications > 9 ? "9+" : totalNotifications}
                            </span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <p className="text-sm font-semibold text-[var(--ds-gray-900)] truncate">{tenantName}</p>
                            <p className="text-xs text-[var(--ds-gray-600)] flex items-center gap-1">
                                {planType === "pro" ? (
                                    <>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--ds-green-700)]" />
                                        Pro Plan
                                    </>
                                ) : planType === "trial" ? (
                                    <>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--ds-amber-700)] animate-pulse" />
                                        Trial · {trialDaysLeft}d left
                                    </>
                                ) : (
                                    <>
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--ds-gray-500)]" />
                                        Free Plan
                                    </>
                                )}
                            </p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--ds-gray-500)] group-hover:text-[var(--ds-gray-700)] transition-colors duration-150" />
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="right" sideOffset={12} className="w-64 p-2 rounded-lg overscroll-contain">
                {/* Current Store Info */}
                <div className="p-3 mb-2 rounded-md bg-[var(--ds-gray-100)]">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ds-gray-1000)] text-white text-sm font-semibold shadow-sm overflow-hidden">
                            {storeLogo ? (
                                <img src={storeLogo} alt={tenantName} className="h-full w-full object-cover" />
                            ) : (
                                tenantName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[var(--ds-gray-900)] truncate">{tenantName}</p>
                            <div className="mt-1">
                                {planType === "pro" ? (
                                    <Badge className="bg-[var(--ds-green-100)] text-[var(--ds-green-800)] hover:bg-[var(--ds-green-100)] text-xs py-0 px-2 h-5 rounded-sm">Pro</Badge>
                                ) : planType === "trial" ? (
                                    <Badge className="bg-[var(--ds-amber-100)] text-[var(--ds-amber-800)] hover:bg-[var(--ds-amber-100)] text-xs py-0 px-2 h-5 rounded-sm">{trialDaysLeft}d Trial</Badge>
                                ) : (
                                    <Badge className="bg-[var(--ds-gray-200)] text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)] text-xs py-0 px-2 h-5 rounded-sm">Free</Badge>
                                )}
                            </div>
                        </div>
                        <CheckCircle className="h-5 w-5 text-[var(--ds-green-700)]" />
                    </div>

                    {/* Store Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-[var(--ds-gray-200)]">
                        <div className="text-center">
                            <p className="text-sm font-semibold text-[var(--ds-gray-900)] tabular-nums">{pendingOrdersCount}</p>
                            <p className="text-xs text-[var(--ds-gray-600)]">Pending</p>
                        </div>
                        <div className="text-center border-x border-[var(--ds-gray-200)]">
                            <p className="text-sm font-semibold text-[var(--ds-gray-900)] tabular-nums">{totalProducts}</p>
                            <p className="text-xs text-[var(--ds-gray-600)]">Products</p>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-[var(--ds-gray-900)] tabular-nums">{formatCurrency(monthlyRevenue)}</p>
                            <p className="text-xs text-[var(--ds-gray-600)]">Revenue</p>
                        </div>
                    </div>
                </div>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuLabel className="text-xs font-medium text-[var(--ds-gray-500)] uppercase tracking-wider px-3 py-2">
                    Quick Actions
                </DropdownMenuLabel>
                <DropdownMenuItem asChild className="gap-3 text-sm rounded-md px-3 h-10 cursor-pointer">
                    <Link href="/dashboard/settings">
                        <Settings className="h-4 w-4 text-[var(--ds-gray-600)]" />
                        <span className="text-[var(--ds-gray-800)]">Store Settings</span>
                    </Link>
                </DropdownMenuItem>
                {storeSlug && (
                    <DropdownMenuItem asChild className="gap-3 text-sm rounded-md px-3 h-10 cursor-pointer">
                        <Link href={`/store/${storeSlug}`} target="_blank">
                            <Store className="h-4 w-4 text-[var(--ds-gray-600)]" />
                            <span className="text-[var(--ds-gray-800)]">View Storefront</span>
                            <ExternalLink className="h-3 w-3 ml-auto text-[var(--ds-gray-500)]" />
                        </Link>
                    </DropdownMenuItem>
                )}

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem className="gap-3 text-sm rounded-md px-3 h-10 text-[var(--ds-gray-900)] font-medium cursor-pointer" disabled>
                    <Plus className="h-4 w-4" />
                    Create New Store
                    <Badge className="ml-auto bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-200)] text-xs py-0 px-2 rounded-sm">Soon…</Badge>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
