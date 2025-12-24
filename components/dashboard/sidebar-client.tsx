"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useMemo } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    DashboardSquare01Icon,
    PackageIcon,
    ShoppingCart01Icon,
    Store01Icon,
    AnalyticsUpIcon,
    Settings01Icon,
    HelpCircleIcon,
    ArrowDown01Icon,
    CheckmarkCircle02Icon,
    Add01Icon,
    MegaphoneIcon,
    UserMultipleIcon,
    UserIcon,
    Moon02Icon,
    Sun01Icon,
    Rocket01Icon,
    Notification01Icon,
    KeyboardIcon,
    Mail01Icon,
    LinkSquare01Icon,
    ArrowRight01Icon,
    PaintBrush01Icon,
} from "@hugeicons/core-free-icons";
import {
    SidebarHeader,
    SidebarContent,
    SidebarFooter,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenuBadge,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
    useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
    TooltipProvider,
} from "@/components/ui/tooltip";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { SignOutButton } from "./sign-out-button";
import { useTheme } from "next-themes";


// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type PlanType = "free" | "trial" | "pro";
type UserRole = "owner" | "admin" | "staff";

interface NavItem {
    id: string;
    title: string;
    href: string;
    icon: typeof DashboardSquare01Icon;
    badge?: number | string;
    badgeVariant?: "default" | "warning" | "success" | "destructive";
    disabled?: boolean;
    soon?: boolean;
    isNew?: boolean;
    keywords?: string[];
    requiredRole?: UserRole[];
    requiredPlan?: PlanType[];
    children?: NavSubItem[];
    external?: boolean;
}

interface NavSubItem {
    id: string;
    title: string;
    href: string;
    badge?: number | string;
    disabled?: boolean;
    soon?: boolean;
    isNew?: boolean;
    requiredRole?: UserRole[];
    requiredPlan?: PlanType[];
}

interface NavGroup {
    id: string;
    label: string;
    items: NavItem[];
    collapsible?: boolean;
    defaultOpen?: boolean;
}

interface SidebarClientProps {
    tenantName: string;
    pendingOrdersCount: number;
    userEmail: string | null | undefined;
    userRole?: UserRole;
    planType?: PlanType;
    trialDaysLeft?: number;
    lowStockCount?: number;
    totalProducts?: number;
    totalCustomers?: number;
    monthlyRevenue?: number;
    storeSlug?: string;
}

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

function createNavigation(counts: {
    pendingOrders: number;
    lowStock: number;
}): NavGroup[] {
    return [
        {
            id: "main",
            label: "Main",
            items: [
                {
                    id: "dashboard",
                    title: "Dashboard",
                    href: "/dashboard",
                    icon: DashboardSquare01Icon,
                    keywords: ["home", "overview", "stats", "metrics"],
                },
                {
                    id: "orders",
                    title: "Orders",
                    href: "/dashboard/orders",
                    icon: ShoppingCart01Icon,
                    badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined,
                    badgeVariant: "warning",
                    keywords: ["sales", "purchases", "transactions", "fulfillment"],
                },
            ],
        },
        {
            id: "catalog",
            label: "Catalog",
            items: [
                {
                    id: "catalog",
                    title: "Catalog",
                    href: "/dashboard/products",
                    icon: PackageIcon,
                    badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
                    badgeVariant: counts.lowStock > 0 ? "warning" : undefined,
                    keywords: ["products", "inventory", "items", "stock", "sku", "categories", "collections", "taxonomy"],
                    children: [
                        { id: "products", title: "Products", href: "/dashboard/products" },
                        { id: "inventory", title: "Inventory", href: "/dashboard/inventory", badge: counts.lowStock > 0 ? `${counts.lowStock}` : undefined },
                        { id: "categories", title: "Categories", href: "/dashboard/categories" },
                        { id: "collections", title: "Collections", href: "/dashboard/collections" },
                    ],
                },
            ],
        },
        {
            id: "customers",
            label: "Customers",
            items: [
                {
                    id: "customers",
                    title: "Customers",
                    href: "/dashboard/customers",
                    icon: UserMultipleIcon,
                    keywords: ["users", "clients", "buyers", "audience"],
                },
            ],
        },
        {
            id: "insights",
            label: "Insights",
            items: [
                {
                    id: "analytics",
                    title: "Analytics",
                    href: "/dashboard/analytics",
                    icon: AnalyticsUpIcon,
                    keywords: ["reports", "insights", "metrics", "performance"],
                    requiredPlan: ["trial", "pro"],
                },
                {
                    id: "marketing",
                    title: "Marketing",
                    href: "/dashboard/marketing",
                    icon: MegaphoneIcon,
                    isNew: true,
                    keywords: ["campaigns", "promotions", "ads", "email", "discounts", "coupons", "automations"],
                    children: [
                        { id: "marketing-overview", title: "Overview", href: "/dashboard/marketing" },
                        { id: "discounts", title: "Discounts", href: "/dashboard/marketing/discounts" },
                        { id: "campaigns", title: "Campaigns", href: "/dashboard/marketing/campaigns" },
                        { id: "automations", title: "Automations", href: "/dashboard/marketing/automations", badge: "new" },
                    ],
                },
            ],
        },
        {
            id: "storefront",
            label: "Storefront",
            items: [
                {
                    id: "store-editor",
                    title: "Store Editor",
                    href: "/dashboard/store-editor",
                    icon: PaintBrush01Icon,
                    isNew: true,
                    keywords: ["pages", "design", "customize", "builder", "theme", "layout", "homepage"],
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
                    keywords: ["preferences", "config", "options", "general", "branding", "seo", "checkout", "account", "team", "notifications", "shipping", "payments", "domains"],
                    children: [
                        { id: "store-settings", title: "Store", href: "/dashboard/settings" },
                        { id: "payments", title: "Payments", href: "/dashboard/settings/payments" },
                        { id: "checkout", title: "Checkout", href: "/dashboard/settings/checkout" },
                        { id: "shipping", title: "Shipping", href: "/dashboard/settings/shipping" },
                        { id: "domains", title: "Domains", href: "/dashboard/settings/domains" },
                        { id: "account", title: "Account", href: "/dashboard/settings/account" },
                        { id: "team", title: "Team", href: "/dashboard/settings/team" },
                        { id: "notifications", title: "Notifications", href: "/dashboard/settings/notifications" },
                    ],
                },
            ],
        },
    ];
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatCurrency(value: number, compact = true) {
    if (compact) {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return `${value}`;
    }
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
    }).format(value);
}

function canAccessItem(
    item: NavItem | NavSubItem,
    userRole: UserRole,
    planType: PlanType
): boolean {
    // Check role-based access
    if (item.requiredRole && !item.requiredRole.includes(userRole)) {
        return false;
    }
    // Check plan-based access
    if (item.requiredPlan && !item.requiredPlan.includes(planType)) {
        return false;
    }
    return true;
}


// ============================================================================
// NAV ITEM COMPONENT
// ============================================================================

interface NavItemComponentProps {
    item: NavItem;
    isActive: boolean;
    isCollapsed: boolean;
    userRole: UserRole;
    planType: PlanType;
    pathname: string;
}

function NavItemComponent({
    item,
    isActive,
    isCollapsed,
    userRole,
    planType,
    pathname,
}: NavItemComponentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const canAccess = canAccessItem(item, userRole, planType);
    const isDisabled = item.disabled || item.soon || !canAccess;

    // Auto-expand if a child is active
    useEffect(() => {
        if (hasChildren && item.children?.some(child => pathname.startsWith(child.href.split("?")[0]))) {
            setIsOpen(true);
        }
    }, [pathname, hasChildren, item.children]);

    const badgeContent = item.badge && (
        <SidebarMenuBadge
            className={cn(
                "text-[10px] min-w-5 h-5",
                item.badgeVariant === "warning" && "bg-chart-4 text-primary-foreground",
                item.badgeVariant === "success" && "bg-chart-2 text-primary-foreground",
                item.badgeVariant === "destructive" && "bg-destructive text-destructive-foreground",
                !item.badgeVariant && "bg-muted text-muted-foreground"
            )}
        >
            {typeof item.badge === "number" && item.badge > 99 ? "99+" : item.badge}
        </SidebarMenuBadge>
    );

    const statusBadge = (item.soon || item.isNew) && !isCollapsed && (
        <Badge
            className={cn(
                "ml-auto text-[9px] py-0 px-1.5 h-4",
                item.isNew
                    ? "bg-chart-2 hover:bg-chart-2/90 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
            )}
        >
            {item.isNew ? "NEW" : "Soon"}
        </Badge>
    );

    // Simple item without children
    if (!hasChildren) {
        return (
            <SidebarMenuItem>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SidebarMenuButton
                            asChild={!isDisabled}
                            isActive={isActive}
                            disabled={isDisabled}
                            className={cn(
                                "transition-all group/item",
                                isActive && "bg-primary/10 text-primary font-medium",
                                isDisabled && "opacity-50 cursor-not-allowed"
                            )}
                            aria-current={isActive ? "page" : undefined}
                            aria-disabled={isDisabled}
                        >
                            {isDisabled ? (
                                <span className="flex items-center gap-2 w-full">
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        strokeWidth={1.5}
                                        className="w-5 h-5 shrink-0"
                                    />
                                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                                    {!isCollapsed && statusBadge}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    target={item.external ? "_blank" : undefined}
                                    rel={item.external ? "noopener noreferrer" : undefined}
                                    className="flex items-center gap-2 w-full"
                                >
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        strokeWidth={isActive ? 2 : 1.5}
                                        className={cn(
                                            "w-5 h-5 shrink-0 transition-colors",
                                            isActive && "text-primary"
                                        )}
                                    />
                                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                                    {!isCollapsed && badgeContent}
                                    {!isCollapsed && statusBadge}
                                    {item.external && !isCollapsed && (
                                        <HugeiconsIcon
                                            icon={LinkSquare01Icon}
                                            className="w-3 h-3 ml-auto text-muted-foreground"
                                        />
                                    )}
                                </Link>
                            )}
                        </SidebarMenuButton>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" sideOffset={10}>
                            <div className="flex items-center gap-2">
                                {item.title}
                                {item.badge && (
                                    <Badge
                                        className={cn(
                                            "text-[10px] py-0 px-1.5",
                                            item.badgeVariant === "warning" && "bg-chart-4",
                                            item.badgeVariant === "destructive" && "bg-destructive"
                                        )}
                                    >
                                        {item.badge}
                                    </Badge>
                                )}
                                {item.soon && (
                                    <Badge variant="secondary" className="text-[9px] py-0 px-1">
                                        Soon
                                    </Badge>
                                )}
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </SidebarMenuItem>
        );
    }

    // Item with children - show dropdown when collapsed, collapsible when expanded
    if (isCollapsed) {
        // Collapsed mode: show dropdown menu with children
        return (
            <SidebarMenuItem>
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    isActive={isActive}
                                    className={cn(
                                        "transition-all",
                                        isActive && "bg-primary/10 text-primary font-medium"
                                    )}
                                >
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        strokeWidth={isActive ? 2 : 1.5}
                                        className={cn(
                                            "w-5 h-5 shrink-0 transition-colors",
                                            isActive && "text-primary"
                                        )}
                                    />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            <div className="flex items-center gap-2">
                                {item.title}
                                {item.badge && (
                                    <Badge className="bg-chart-4 text-[10px] py-0 px-1.5">
                                        {item.badge}
                                    </Badge>
                                )}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-48">
                        <DropdownMenuLabel className="flex items-center gap-2">
                            {item.title}
                            {item.badge && (
                                <Badge className="bg-chart-4 text-[10px] py-0 px-1.5">
                                    {item.badge}
                                </Badge>
                            )}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.children?.map((child) => {
                            const childActive = pathname === child.href.split("?")[0] ||
                                (child.href !== "/dashboard/products" && pathname.startsWith(child.href.split("?")[0]));
                            const childDisabled = child.disabled || child.soon || !canAccessItem(child, userRole, planType);

                            return (
                                <DropdownMenuItem
                                    key={child.id}
                                    asChild={!childDisabled}
                                    disabled={childDisabled}
                                    className={cn(
                                        childActive && "bg-accent font-medium"
                                    )}
                                >
                                    {childDisabled ? (
                                        <span className="flex items-center gap-2 w-full">
                                            {child.title}
                                            {child.soon && (
                                                <Badge variant="secondary" className="text-[9px] py-0 px-1 h-4 ml-auto">
                                                    Soon
                                                </Badge>
                                            )}
                                        </span>
                                    ) : (
                                        <Link href={child.href} className="flex items-center gap-2 w-full">
                                            {child.title}
                                            {child.badge && (
                                                <Badge className="ml-auto text-[9px] py-0 px-1.5 h-4">
                                                    {child.badge}
                                                </Badge>
                                            )}
                                        </Link>
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        );
    }

    // Expanded mode: show collapsible submenu
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        isActive={isActive}
                        className={cn(
                            "transition-all",
                            isActive && "bg-primary/10 text-primary font-medium"
                        )}
                    >
                        <HugeiconsIcon
                            icon={item.icon}
                            strokeWidth={isActive ? 2 : 1.5}
                            className={cn(
                                "w-5 h-5 shrink-0 transition-colors",
                                isActive && "text-primary"
                            )}
                        />
                        <span className="truncate">{item.title}</span>
                        {badgeContent}
                        <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className={cn(
                                "w-4 h-4 ml-auto transition-transform duration-200",
                                isOpen && "rotate-90"
                            )}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <SidebarMenuSub>
                        {item.children?.map((child) => {
                            const childActive = pathname === child.href.split("?")[0] ||
                                (child.href !== "/dashboard/products" && pathname.startsWith(child.href.split("?")[0]));
                            const childDisabled = child.disabled || child.soon || !canAccessItem(child, userRole, planType);

                            return (
                                <SidebarMenuSubItem key={child.id}>
                                    <SidebarMenuSubButton
                                        asChild={!childDisabled}
                                        isActive={childActive}
                                        className={cn(
                                            childDisabled && "opacity-50 cursor-not-allowed pointer-events-none"
                                        )}
                                    >
                                        {childDisabled ? (
                                            <span className="flex items-center gap-2">
                                                {child.title}
                                                {child.soon && (
                                                    <Badge variant="secondary" className="text-[9px] py-0 px-1 h-4">
                                                        Soon
                                                    </Badge>
                                                )}
                                            </span>
                                        ) : (
                                            <Link href={child.href}>
                                                {child.title}
                                                {child.badge && (
                                                    <Badge className="ml-auto text-[9px] py-0 px-1.5 h-4">
                                                        {child.badge}
                                                    </Badge>
                                                )}
                                            </Link>
                                        )}
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            );
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}


// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

export function SidebarClient({
    tenantName,
    pendingOrdersCount,
    userEmail,
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

    // Create navigation with dynamic counts
    const navigation = useMemo(
        () => createNavigation({ pendingOrders: pendingOrdersCount, lowStock: lowStockCount }),
        [pendingOrdersCount, lowStockCount]
    );

    // Check if a nav item is active
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

            // "g" + key for quick navigation (vim-style)
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
            {/* Brand Header with Store Switcher */}
            <SidebarHeader className={cn("p-2", isCollapsed && "p-2 flex justify-center")}>
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
                                "relative flex shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground font-bold shadow-lg transition-all",
                                isCollapsed ? "h-8 w-8 text-xs rounded-lg" : "h-10 w-10 text-sm"
                            )}>
                                {tenantName.charAt(0).toUpperCase()}
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
                    <DropdownMenuContent
                        align="start"
                        side="right"
                        sideOffset={12}
                        className="w-[260px] p-1.5 rounded-xl"
                    >
                        {/* Current Store Info */}
                        <div className="p-3 mb-1.5 mx-0.5 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-primary to-primary/80 text-primary-foreground text-sm font-bold shadow-md">
                                    {tenantName.charAt(0).toUpperCase()}
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
            </SidebarHeader>


            <SidebarContent className={cn("px-2 py-3", isCollapsed && "px-0 py-2")}>
                {/* Navigation Groups */}
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

            {/* Footer */}
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

                {/* User Profile */}
                <UserMenu
                    userEmail={userEmail}
                    isCollapsed={isCollapsed}
                    planType={planType}
                    trialDaysLeft={trialDaysLeft}
                    theme={theme}
                    setTheme={setTheme}
                />
            </SidebarFooter>
        </TooltipProvider>
    );
}


// ============================================================================
// USER MENU COMPONENT
// ============================================================================

interface UserMenuProps {
    userEmail: string | null | undefined;
    isCollapsed: boolean;
    planType?: PlanType;
    trialDaysLeft?: number;
    theme?: string;
    setTheme: (theme: string) => void;
}

function UserMenu({ userEmail, isCollapsed, planType = "trial", trialDaysLeft = 7, theme, setTheme }: UserMenuProps) {
    const displayName = userEmail?.split("@")[0] || "User";
    const showUpgradeBanner = planType !== "pro";
    const initial = userEmail?.charAt(0).toUpperCase() || "U";

    const avatarColors = [
        "from-chart-1 to-chart-1/70",
        "from-chart-2 to-chart-2/70",
        "from-chart-3 to-chart-3/70",
        "from-chart-4 to-chart-4/70",
        "from-chart-5 to-chart-5/70",
    ];
    const colorIndex = userEmail ? userEmail.charCodeAt(0) % avatarColors.length : 0;
    const avatarColor = avatarColors[colorIndex];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className={cn(
                        "group flex w-full items-center gap-3 rounded-xl p-2 transition-all text-left border border-transparent",
                        !isCollapsed && "hover:bg-accent/60 hover:border-border/50",
                        isCollapsed && "justify-center p-1.5 rounded-lg"
                    )}
                    aria-label="User menu"
                >
                    <div className={cn(
                        "relative flex shrink-0 items-center justify-center rounded-full bg-linear-to-br text-primary-foreground font-medium shadow-lg transition-all",
                        avatarColor,
                        isCollapsed ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
                    )}>
                        {initial}
                    </div>
                    {!isCollapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold truncate">{displayName}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                            </div>
                            <div className="p-1.5 rounded-md group-hover:bg-muted transition-colors">
                                <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-muted-foreground" />
                            </div>
                        </>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                side="right"
                sideOffset={12}
                className="w-[260px] p-1.5 rounded-xl"
            >
                {/* Profile Header */}
                <div className="p-3 mb-1.5 mx-0.5 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br text-primary-foreground text-lg font-bold shadow-md",
                            avatarColor
                        )}>
                            {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{displayName}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                        </div>
                    </div>
                </div>

                <DropdownMenuSeparator className="my-1.5 mx-0.5" />

                <DropdownMenuLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2.5 py-1.5">
                    Account
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                    <DropdownMenuItem className="rounded-lg mx-0.5 px-2.5 h-9 justify-between cursor-pointer">
                        <span className="flex items-center gap-2.5">
                            <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-muted-foreground" />
                            Profile
                        </span>
                        <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">⇧P</kbd>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg mx-0.5 px-2.5 h-9 justify-between cursor-pointer">
                        <Link href="/dashboard/settings">
                            <span className="flex items-center gap-2.5">
                                <HugeiconsIcon icon={Settings01Icon} className="w-4 h-4 text-muted-foreground" />
                                Settings
                            </span>
                            <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">⌘,</kbd>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg mx-0.5 px-2.5 h-9 justify-between cursor-pointer">
                        <span className="flex items-center gap-2.5">
                            <HugeiconsIcon icon={Notification01Icon} className="w-4 h-4 text-muted-foreground" />
                            Notifications
                        </span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5 mx-0.5" />

                <DropdownMenuLabel className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2.5 py-1.5">
                    Appearance
                </DropdownMenuLabel>
                <DropdownMenuGroup>
                    <div className="mx-0.5 px-2.5 py-2 rounded-lg">
                        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Theme selection">
                            <button
                                onClick={() => setTheme("light")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all",
                                    theme === "light"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                                role="radio"
                                aria-checked={theme === "light"}
                            >
                                <HugeiconsIcon icon={Sun01Icon} className="w-3.5 h-3.5" />
                                Light
                            </button>
                            <button
                                onClick={() => setTheme("dark")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all",
                                    theme === "dark"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                                role="radio"
                                aria-checked={theme === "dark"}
                            >
                                <HugeiconsIcon icon={Moon02Icon} className="w-3.5 h-3.5" />
                                Dark
                            </button>
                            <button
                                onClick={() => setTheme("system")}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all",
                                    theme === "system"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted hover:bg-muted/80"
                                )}
                                role="radio"
                                aria-checked={theme === "system"}
                            >
                                Auto
                            </button>
                        </div>
                    </div>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="my-1.5 mx-0.5" />

                <DropdownMenuGroup>
                    <DropdownMenuItem className="rounded-lg mx-0.5 px-2.5 h-9 cursor-pointer">
                        <HugeiconsIcon icon={KeyboardIcon} className="w-4 h-4 text-muted-foreground mr-2.5" />
                        Keyboard Shortcuts
                        <kbd className="ml-auto text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">?</kbd>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg mx-0.5 px-2.5 h-9 cursor-pointer">
                        <HugeiconsIcon icon={HelpCircleIcon} className="w-4 h-4 text-muted-foreground mr-2.5" />
                        Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg mx-0.5 px-2.5 h-9 cursor-pointer">
                        <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-muted-foreground mr-2.5" />
                        Send Feedback
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                {/* Plan Info */}
                {showUpgradeBanner ? (
                    <div className="mt-1.5 mx-0.5 p-2.5 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">
                                {planType === "trial" ? "Pro Trial" : "Free Plan"}
                            </span>
                            {planType === "trial" && (
                                <Badge className="bg-primary hover:bg-primary/90 text-[9px] py-0 px-1.5 h-4">
                                    {trialDaysLeft}d left
                                </Badge>
                            )}
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-2">
                            {planType === "trial" ? "Keep all Pro features" : "Unlock all features"}
                        </p>
                        <Button size="sm" className="w-full h-7 text-xs">
                            Upgrade to Pro
                        </Button>
                    </div>
                ) : (
                    <div className="mt-1.5 mx-0.5 p-2.5 rounded-lg bg-chart-2/10 border border-chart-2/20">
                        <div className="flex items-center gap-2">
                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-chart-2" />
                            <div>
                                <p className="text-xs font-medium">Pro Plan</p>
                                <p className="text-[10px] text-chart-2">All features unlocked</p>
                            </div>
                        </div>
                    </div>
                )}

                <DropdownMenuSeparator className="my-1.5 mx-0.5" />

                <DropdownMenuItem asChild className="rounded-lg mx-0.5 px-2.5 h-9 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
