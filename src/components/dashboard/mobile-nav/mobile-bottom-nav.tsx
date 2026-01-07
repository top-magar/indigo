"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    DashboardSquare01Icon,
    ShoppingCart01Icon,
    Tag01Icon,
    UserMultipleIcon,
    Menu01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/shared/utils";
import { Badge } from "@/components/ui/badge";
import { MobileNavSheet } from "./mobile-nav-sheet";

export interface MobileBottomNavProps {
    /** Number of pending orders to show as badge */
    pendingOrdersCount?: number;
    /** Number of low stock items */
    lowStockCount?: number;
    /** Number of pending returns */
    pendingReturnsCount?: number;
    /** Additional CSS classes */
    className?: string;
}

interface NavItem {
    id: string;
    title: string;
    href: string;
    icon: typeof DashboardSquare01Icon;
    badge?: number;
}

const mainNavItems: NavItem[] = [
    {
        id: "dashboard",
        title: "Dashboard",
        href: "/dashboard",
        icon: DashboardSquare01Icon,
    },
    {
        id: "orders",
        title: "Orders",
        href: "/dashboard/orders",
        icon: ShoppingCart01Icon,
    },
    {
        id: "products",
        title: "Products",
        href: "/dashboard/products",
        icon: Tag01Icon,
    },
    {
        id: "customers",
        title: "Customers",
        href: "/dashboard/customers",
        icon: UserMultipleIcon,
    },
];

export function MobileBottomNav({
    pendingOrdersCount = 0,
    lowStockCount = 0,
    pendingReturnsCount = 0,
    className,
}: MobileBottomNavProps) {
    const pathname = usePathname();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === "/dashboard") return pathname === "/dashboard";
        const basePath = href.split("?")[0];
        return pathname === basePath || pathname.startsWith(basePath + "/");
    };

    // Check if any "More" section item is active
    const isMoreActive = [
        "/dashboard/analytics",
        "/dashboard/inventory",
        "/dashboard/marketing",
        "/dashboard/settings",
        "/dashboard/collections",
        "/dashboard/categories",
        "/dashboard/attributes",
        "/dashboard/media",
        "/storefront",
    ].some((path) => pathname.startsWith(path));

    // Add badges to nav items
    const navItemsWithBadges = mainNavItems.map((item) => ({
        ...item,
        badge: item.id === "orders" ? pendingOrdersCount : undefined,
    }));

    return (
        <>
            {/* Bottom Navigation Bar */}
            <nav
                className={cn(
                    // Only visible on mobile (hidden on md and up)
                    "fixed bottom-0 left-0 right-0 z-50 md:hidden",
                    // Background and border
                    "bg-background/95 backdrop-blur-lg border-t border-border",
                    // Safe area padding for iOS devices
                    "pb-[env(safe-area-inset-bottom)]",
                    className
                )}
                role="navigation"
                aria-label="Mobile navigation"
            >
                <div className="flex items-center justify-around h-16 px-2">
                    {navItemsWithBadges.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 px-3 rounded-xl transition-all",
                                    "active:scale-95",
                                    active
                                        ? "text-primary"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                aria-current={active ? "page" : undefined}
                            >
                                <div className="relative">
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        strokeWidth={active ? 2 : 1.5}
                                        className={cn(
                                            "w-6 h-6 transition-all",
                                            active && "text-primary"
                                        )}
                                    />
                                    {item.badge && item.badge > 0 && (
                                        <Badge
                                            className={cn(
                                                "absolute -top-1.5 -right-2 h-4 min-w-4 px-1 text-[10px] font-medium",
                                                "bg-chart-4 text-primary-foreground border-0"
                                            )}
                                        >
                                            {item.badge > 99 ? "99+" : item.badge}
                                        </Badge>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-[10px] font-medium transition-all",
                                        active && "text-primary font-semibold"
                                    )}
                                >
                                    {item.title}
                                </span>
                                {/* Active indicator */}
                                {active && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                                )}
                            </Link>
                        );
                    })}

                    {/* More Button */}
                    <button
                        onClick={() => setIsSheetOpen(true)}
                        className={cn(
                            "flex flex-col items-center justify-center gap-1 min-w-[64px] py-2 px-3 rounded-xl transition-all",
                            "active:scale-95",
                            isMoreActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                        aria-label="More navigation options"
                        aria-expanded={isSheetOpen}
                    >
                        <div className="relative">
                            <HugeiconsIcon
                                icon={Menu01Icon}
                                strokeWidth={isMoreActive ? 2 : 1.5}
                                className={cn(
                                    "w-6 h-6 transition-all",
                                    isMoreActive && "text-primary"
                                )}
                            />
                            {/* Show badge if there are notifications in "More" sections */}
                            {lowStockCount > 0 && (
                                <Badge
                                    className={cn(
                                        "absolute -top-1.5 -right-2 h-4 min-w-4 px-1 text-[10px] font-medium",
                                        "bg-chart-4 text-primary-foreground border-0"
                                    )}
                                >
                                    {lowStockCount > 99 ? "99+" : lowStockCount}
                                </Badge>
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-[10px] font-medium transition-all",
                                isMoreActive && "text-primary font-semibold"
                            )}
                        >
                            More
                        </span>
                        {isMoreActive && (
                            <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                        )}
                    </button>
                </div>
            </nav>

            {/* More Navigation Sheet */}
            <MobileNavSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                lowStockCount={lowStockCount}
                pendingReturnsCount={pendingReturnsCount}
            />
        </>
    );
}
