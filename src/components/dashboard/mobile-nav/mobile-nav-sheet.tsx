"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { TrendingUp, Layers, Percent, Settings, Paintbrush, Image, Filter, Folder, Tag, ExternalLink, type LucideIcon } from "lucide-react";
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
    icon: LucideIcon;
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
                    icon: TrendingUp,
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
                    icon: Folder,
                    description: "Product collections",
                },
                {
                    id: "categories",
                    title: "Categories",
                    href: "/dashboard/categories",
                    icon: Tag,
                    description: "Product categories",
                },
                {
                    id: "inventory",
                    title: "Inventory",
                    href: "/dashboard/inventory",
                    icon: Layers,
                    badge: lowStockCount > 0 ? `${lowStockCount} low` : undefined,
                    badgeVariant: lowStockCount > 0 ? "warning" : undefined,
                    description: "Stock management",
                },
                {
                    id: "attributes",
                    title: "Attributes",
                    href: "/dashboard/attributes",
                    icon: Filter,
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
                    icon: Percent,
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
                    icon: Paintbrush,
                    external: true,
                    description: "Customize your store",
                },
                {
                    id: "media",
                    title: "Media Library",
                    href: "/dashboard/media",
                    icon: Image,
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
                    icon: Settings,
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
                <SheetHeader className="pb-[13px]">
                    <SheetTitle className="text-left">More</SheetTitle>
                </SheetHeader>

                <div className="overflow-y-auto h-[calc(100%-60px)] -mx-[13px] px-[13px]">
                    {navGroups.map((group, groupIndex) => (
                        <div key={group.id}>
                            {groupIndex > 0 && <Separator className="my-[13px]" />}
                            <div className="mb-[8px]">
                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    {group.label}
                                </h3>
                            </div>
                            <div className="space-y-[8px]">
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
                                                "flex items-center gap-[13px] p-[13px] rounded-2xl transition-all",
                                                "active:scale-[0.98]",
                                                active
                                                    ? "bg-primary/10 text-primary"
                                                    : "hover:bg-muted/50"
                                            )}
                                            aria-current={active ? "page" : undefined}
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center w-[42px] h-[42px] rounded-2xl",
                                                    active
                                                        ? "bg-primary/20"
                                                        : "bg-muted"
                                                )}
                                            >
                                                <item.icon
                                                    strokeWidth={active ? 2 : 1.5}
                                                    className={cn(
                                                        "w-[26px] h-[26px]",
                                                        active
                                                            ? "text-primary"
                                                            : "text-muted-foreground"
                                                    )}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-[8px]">
                                                    <span
                                                        className={cn(
                                                            "text-sm font-medium",
                                                            active && "text-primary"
                                                        )}
                                                    >
                                                        {item.title}
                                                    </span>
                                                    {item.external && (
                                                        <ExternalLink
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
                    <div className="h-[26px]" />
                </div>
            </SheetContent>
        </Sheet>
    );
}
