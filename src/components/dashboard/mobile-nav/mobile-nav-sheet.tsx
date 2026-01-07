"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    AnalyticsUpIcon,
    Layers01Icon,
    PercentIcon,
    Settings01Icon,
    PaintBrushIcon,
    Image01Icon,
    FilterIcon,
    Folder01Icon,
    Tag01Icon,
    LinkSquare01Icon,
} from "@hugeicons/core-free-icons";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils";

export interface MobileNavSheetProps {
    /** Whether the sheet is open */
    open: boolean;
    /** Callback when open state changes */
    onOpenChange: (open: boolean) => void;
    /** Number of low stock items */
    lowStockCount?: number;
    /** Number of pending returns */
    pendingReturnsCount?: number;
}

interface NavGroup {
    id: string;
    label: string;
    items: NavItem[];
}

interface NavItem {
    id: string;
    title: string;
    href: string;
    icon: typeof AnalyticsUpIcon;
    badge?: string | number;
    badgeVariant?: "default" | "warning" | "success" | "destructive";
    external?: boolean;
    description?: string;
}

export function MobileNavSheet({
    open,
    onOpenChange,
    lowStockCount = 0,
    pendingReturnsCount = 0,
}: MobileNavSheetProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        const basePath = href.split("?")[0];
        return pathname === basePath || pathname.startsWith(basePath + "/");
    };

    const navGroups: NavGroup[] = [
        {
            id: "insights",
            label: "Insights",
            items: [
                {
                    id: "analytics",
                    title: "Analytics",
                    href: "/dashboard/analytics",
                    icon: AnalyticsUpIcon,
                    description: "Reports & performance metrics",
                },
            ],
        },
        {
            id: "catalog",
            label: "Catalog",
            items: [
                {
                    id: "collections",
                    title: "Collections",
                    href: "/dashboard/collections",
                    icon: Folder01Icon,
                    description: "Product collections",
                },
                {
                    id: "categories",
                    title: "Categories",
                    href: "/dashboard/categories",
                    icon: Tag01Icon,
                    description: "Product categories",
                },
                {
                    id: "inventory",
                    title: "Inventory",
                    href: "/dashboard/inventory",
                    icon: Layers01Icon,
                    badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
                    badgeVariant: lowStockCount > 0 ? "warning" : undefined,
                    description: "Stock management",
                },
                {
                    id: "attributes",
                    title: "Attributes",
                    href: "/dashboard/attributes",
                    icon: FilterIcon,
                    description: "Product attributes",
                },
            ],
        },
        {
            id: "marketing",
            label: "Marketing",
            items: [
                {
                    id: "discounts",
                    title: "Discounts",
                    href: "/dashboard/marketing/discounts",
                    icon: PercentIcon,
                    description: "Coupons & promotions",
                },
            ],
        },
        {
            id: "content",
            label: "Content",
            items: [
                {
                    id: "storefront",
                    title: "Storefront Editor",
                    href: "/storefront",
                    icon: PaintBrushIcon,
                    external: true,
                    description: "Customize your store",
                },
                {
                    id: "media",
                    title: "Media Library",
                    href: "/dashboard/media",
                    icon: Image01Icon,
                    description: "Images & files",
                },
            ],
        },
        {
            id: "settings",
            label: "Settings",
            items: [
                {
                    id: "settings",
                    title: "Settings",
                    href: "/dashboard/settings",
                    icon: Settings01Icon,
                    description: "Store configuration",
                },
            ],
        },
    ];

    const handleNavClick = () => {
        onOpenChange(false);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="bottom"
                className={cn(
                    "h-[85vh] rounded-t-3xl",
                    // Safe area padding for iOS devices
                    "pb-[env(safe-area-inset-bottom)]"
                )}
            >
                <SheetHeader className="pb-4">
                    <SheetTitle className="text-left">More</SheetTitle>
                </SheetHeader>

                <div className="overflow-y-auto h-[calc(100%-60px)] -mx-6 px-6">
                    {navGroups.map((group, groupIndex) => (
                        <div key={group.id}>
                            {groupIndex > 0 && <Separator className="my-4" />}
                            <div className="mb-3">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {group.label}
                                </h3>
                            </div>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.id}
                                            href={item.href}
                                            target={item.external ? "_blank" : undefined}
                                            rel={item.external ? "noopener noreferrer" : undefined}
                                            onClick={handleNavClick}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-xl transition-all",
                                                "active:scale-[0.98]",
                                                active
                                                    ? "bg-primary/10 text-primary"
                                                    : "hover:bg-muted/50"
                                            )}
                                            aria-current={active ? "page" : undefined}
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center w-10 h-10 rounded-xl",
                                                    active
                                                        ? "bg-primary/20"
                                                        : "bg-muted"
                                                )}
                                            >
                                                <HugeiconsIcon
                                                    icon={item.icon}
                                                    strokeWidth={active ? 2 : 1.5}
                                                    className={cn(
                                                        "w-5 h-5",
                                                        active
                                                            ? "text-primary"
                                                            : "text-muted-foreground"
                                                    )}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            "text-sm font-medium",
                                                            active && "text-primary"
                                                        )}
                                                    >
                                                        {item.title}
                                                    </span>
                                                    {item.external && (
                                                        <HugeiconsIcon
                                                            icon={LinkSquare01Icon}
                                                            className="w-3.5 h-3.5 text-muted-foreground"
                                                        />
                                                    )}
                                                    {item.badge && (
                                                        <Badge
                                                            className={cn(
                                                                "text-[10px] py-0 px-1.5 h-5",
                                                                item.badgeVariant === "warning" &&
                                                                    "bg-chart-4 text-primary-foreground",
                                                                item.badgeVariant === "success" &&
                                                                    "bg-chart-2 text-primary-foreground",
                                                                item.badgeVariant === "destructive" &&
                                                                    "bg-destructive text-destructive-foreground",
                                                                !item.badgeVariant &&
                                                                    "bg-muted text-muted-foreground"
                                                            )}
                                                        >
                                                            {item.badge}
                                                        </Badge>
                                                    )}
                                                </div>
                                                {item.description && (
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* Bottom spacing for safe area */}
                    <div className="h-8" />
                </div>
            </SheetContent>
        </Sheet>
    );
}
