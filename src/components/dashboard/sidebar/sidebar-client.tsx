"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Rocket01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import {
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarGroup,
    SidebarGroupContent,
    useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

import { createNavigation, canAccessItem } from "./navigation";
import { NavItemComponent } from "./nav-item";
import { StoreMenu } from "./store-menu";
import { UserMenu } from "./user-menu";
import type { SidebarClientProps } from "./types";

export function SidebarClient({
    tenantName,
    storeLogo,
    pendingOrdersCount,
    userEmail,
    userAvatarUrl,
    userFullName,
    userRole = "owner",
    planType = "trial",
    trialDaysLeft = 7,
    lowStockCount = 0,
    totalProducts = 0,
    monthlyRevenue = 0,
    storeSlug,
}: SidebarClientProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { state } = useSidebar();
    const { theme, setTheme } = useTheme();
    const isCollapsed = state === "collapsed";

    const showUpgradeBanner = planType !== "pro";
    const totalNotifications = pendingOrdersCount + lowStockCount;

    const navigation = useMemo(
        () => createNavigation({ pendingOrders: pendingOrdersCount, lowStock: lowStockCount }),
        [pendingOrdersCount, lowStockCount]
    );

    const isActive = useCallback((href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        const basePath = href.split("?")[0];
        return pathname === basePath || pathname.startsWith(basePath + "/");
    }, [pathname]);

    // Keyboard shortcuts for quick navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

            if (e.key === "g" && !isInput) {
                const handleSecondKey = (e2: KeyboardEvent) => {
                    const routes: Record<string, string> = {
                        d: "/dashboard",
                        o: "/dashboard/orders",
                        p: "/dashboard/products",
                        c: "/dashboard/customers",
                        a: "/dashboard/analytics",
                        s: "/dashboard/settings",
                    };
                    if (routes[e2.key]) {
                        e2.preventDefault();
                        router.push(routes[e2.key]);
                    }
                    document.removeEventListener("keydown", handleSecondKey);
                };
                document.addEventListener("keydown", handleSecondKey, { once: true });
                setTimeout(() => document.removeEventListener("keydown", handleSecondKey), 1000);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [router]);

    return (
        <TooltipProvider delayDuration={0}>
            <SidebarHeader className={cn("p-2", isCollapsed && "p-2 flex justify-center")}>
                <StoreMenu
                    tenantName={tenantName}
                    storeLogo={storeLogo}
                    planType={planType}
                    trialDaysLeft={trialDaysLeft}
                    totalNotifications={totalNotifications}
                    pendingOrdersCount={pendingOrdersCount}
                    totalProducts={totalProducts}
                    monthlyRevenue={monthlyRevenue}
                    storeSlug={storeSlug}
                    isCollapsed={isCollapsed}
                />
            </SidebarHeader>

            <SidebarContent className={cn("px-2 py-3", isCollapsed && "px-0 py-2")}>
                {navigation.map((group) => {
                    const accessibleItems = group.items.filter(item =>
                        canAccessItem(item, userRole, planType) || item.soon
                    );
                    if (accessibleItems.length === 0) return null;

                    return (
                        <SidebarGroup key={group.id} className={cn(isCollapsed && "px-2")}>
                            <SidebarGroupContent>
                                <SidebarMenu role="menu" aria-label={group.label}>
                                    {accessibleItems.map((item) => (
                                        <NavItemComponent
                                            key={item.id}
                                            item={item}
                                            isActive={isActive(item.href)}
                                            isCollapsed={isCollapsed}
                                            userRole={userRole}
                                            planType={planType}
                                            pathname={pathname}
                                        />
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    );
                })}
            </SidebarContent>

            <SidebarFooter className={cn("p-2", isCollapsed && "p-2 flex flex-col justify-center gap-2")}>
                {/* Upgrade Banner */}
                {!isCollapsed && showUpgradeBanner && (
                    <div className="mx-0 mb-2 p-3 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 rounded-lg bg-primary/20">
                                <HugeiconsIcon icon={Rocket01Icon} className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold">
                                    {planType === "trial" ? "Pro Trial" : "Free Plan"}
                                </p>
                                {planType === "trial" && (
                                    <p className="text-[10px] text-primary font-medium">{trialDaysLeft} days remaining</p>
                                )}
                            </div>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-2.5">
                            {planType === "trial"
                                ? "Upgrade now to keep all Pro features"
                                : "Unlock analytics, marketing & more"}
                        </p>
                        <Button size="sm" className="w-full h-8 text-xs font-medium">
                            <HugeiconsIcon icon={Rocket01Icon} className="w-3.5 h-3.5 mr-1.5" />
                            Upgrade to Pro
                        </Button>
                    </div>
                )}

                {/* Pro Plan Badge */}
                {!isCollapsed && !showUpgradeBanner && (
                    <div className="mx-0 mb-2 p-3 rounded-xl bg-chart-2/10 border border-chart-2/20">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-chart-2/20">
                                <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-chart-2" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold">Pro Plan</p>
                                <p className="text-[10px] text-chart-2">All features unlocked</p>
                            </div>
                        </div>
                    </div>
                )}

                <UserMenu
                    userEmail={userEmail}
                    userAvatarUrl={userAvatarUrl}
                    userFullName={userFullName}
                    userRole={userRole}
                    isCollapsed={isCollapsed}
                    theme={theme}
                    setTheme={setTheme}
                />
            </SidebarFooter>
        </TooltipProvider>
    );
}
