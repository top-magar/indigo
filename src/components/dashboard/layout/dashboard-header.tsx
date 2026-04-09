"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import { useKeyboardShortcutsHelp } from "@/hooks";
import { KeyboardShortcutsModal } from "@/components/dashboard/keyboard-shortcuts/keyboard-shortcuts-modal";
import type { ShortcutCategory } from "@/components/dashboard/keyboard-shortcuts/types";
import {
    Store,
    Search,
    ShoppingCart,
    Plus,
    Package,
    Users,
    TrendingUp,
    Settings,
    LayoutDashboard,
    Layers,
    FolderTree,
    Tags,
    Gift,
    Warehouse,
    Image as ImageIcon,
    FileText,
    Star,
    Megaphone,
    BarChart3,
    DollarSign,
    Percent,
    Mail,
    Zap,
    CreditCard,
    Globe,
    Bell,
    UserCog,
    Bot,
} from "lucide-react";
import { NotificationCenter } from "@/components/dashboard/notifications";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

interface DashboardHeaderProps {
    storeSlug?: string;
    pendingOrdersCount?: number;
    lowStockCount?: number;
    newCustomersCount?: number;
}

const routeConfig: Record<string, { title: string }> = {
    "/dashboard": { title: "Overview" },
    "/dashboard/orders": { title: "Orders" },
    "/dashboard/orders/returns": { title: "Returns" },
    "/dashboard/orders/abandoned": { title: "Abandoned Carts" },
    "/dashboard/products": { title: "Products" },
    "/dashboard/products/new": { title: "New Product" },
    "/dashboard/inventory": { title: "Inventory" },
    "/dashboard/categories": { title: "Categories" },
    "/dashboard/collections": { title: "Collections" },
    "/dashboard/gift-cards": { title: "Gift Cards" },
    "/dashboard/attributes": { title: "Attributes" },
    "/dashboard/customers": { title: "Customers" },
    "/dashboard/customers/groups": { title: "Customer Groups" },
    "/dashboard/media": { title: "Media" },
    "/dashboard/pages": { title: "Pages" },
    "/dashboard/reviews": { title: "Reviews" },
    "/dashboard/marketing": { title: "Marketing" },
    "/dashboard/marketing/discounts": { title: "Discounts" },
    "/dashboard/marketing/campaigns": { title: "Campaigns" },
    "/dashboard/marketing/automations": { title: "Automations" },
    "/dashboard/analytics": { title: "Analytics" },
    "/dashboard/finances": { title: "Finances" },
    "/dashboard/settings": { title: "Settings" },
    "/dashboard/settings/checkout": { title: "Checkout" },
    "/dashboard/settings/account": { title: "Account" },
    "/dashboard/settings/team": { title: "Team" },
    "/dashboard/settings/notifications": { title: "Notifications" },
    "/dashboard/settings/payments": { title: "Payments" },
    "/dashboard/settings/domains": { title: "Domains" },
    "/dashboard/settings/shipping": { title: "Shipping" },
    "/dashboard/settings/taxes": { title: "Taxes" },
    "/dashboard/settings/tax": { title: "Tax" },
    "/dashboard/settings/currency": { title: "Currency" },
    "/dashboard/settings/storefront": { title: "Storefront" },
    "/dashboard/orders/new": { title: "New Order" },
};

// Parent route mapping for breadcrumb hierarchy
const parentRoutes: Record<string, string> = {
    "/dashboard/orders/returns": "/dashboard/orders",
    "/dashboard/orders/abandoned": "/dashboard/orders",
    "/dashboard/customers/groups": "/dashboard/customers",
    "/dashboard/marketing/discounts": "/dashboard/marketing",
    "/dashboard/marketing/campaigns": "/dashboard/marketing",
    "/dashboard/marketing/automations": "/dashboard/marketing",
};

function DynamicBreadcrumb({ pathname }: { pathname: string }) {
    const breadcrumbItems: { title: string; href: string; isLast: boolean }[] = [];
    
    if (pathname === "/dashboard") {
        return (
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbPage className="font-medium">Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
        );
    }

    // Always start with Dashboard
    breadcrumbItems.push({ title: "Dashboard", href: "/dashboard", isLast: false });

    // Check if this path has a known parent
    const parentPath = parentRoutes[pathname];
    if (parentPath && routeConfig[parentPath]) {
        breadcrumbItems.push({ title: routeConfig[parentPath].title, href: parentPath, isLast: false });
        const config = routeConfig[pathname];
        breadcrumbItems.push({ title: config?.title || pathname.split("/").pop() || "", href: pathname, isLast: true });
    } else if (routeConfig[pathname]) {
        // Direct known route — check if it's a settings sub-page
        const segments = pathname.split("/").filter(Boolean);
        if (segments[1] === "settings" && segments.length > 2) {
            breadcrumbItems.push({ title: "Settings", href: "/dashboard/settings", isLast: false });
        }
        breadcrumbItems.push({ title: routeConfig[pathname].title, href: pathname, isLast: true });
    } else {
        // Unknown route — build from segments
        const segments = pathname.split("/").filter(Boolean);
        let currentPath = "";
        for (let i = 1; i < segments.length; i++) {
            currentPath = `/dashboard/${segments.slice(1, i + 1).join("/")}`;
            const config = routeConfig[currentPath];
            const isLast = i === segments.length - 1;
            if (config) {
                breadcrumbItems.push({ title: config.title, href: currentPath, isLast });
            } else if (isLast) {
                breadcrumbItems.push({ title: "Details", href: pathname, isLast: true });
            }
        }
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={item.href + index}>
                        {index > 0 && <BreadcrumbSeparator className="text-muted-foreground" />}
                        <BreadcrumbItem>
                            {item.isLast ? (
                                <BreadcrumbPage className="font-medium">{item.title}</BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                                    {item.title}
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}

// Command palette navigation items with icons and shortcuts
const commandNavItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "G D" },
    { label: "Orders", href: "/dashboard/orders", icon: ShoppingCart, shortcut: "G O" },
    { label: "Products", href: "/dashboard/products", icon: Package, shortcut: "G P" },
    { label: "Customers", href: "/dashboard/customers", icon: Users, shortcut: "G C" },
    { label: "Inventory", href: "/dashboard/inventory", icon: Warehouse },
    { label: "Collections", href: "/dashboard/collections", icon: Layers },
    { label: "Categories", href: "/dashboard/categories", icon: FolderTree },
    { label: "Gift Cards", href: "/dashboard/gift-cards", icon: Gift },
    { label: "Attributes", href: "/dashboard/attributes", icon: Tags },
    { label: "Media", href: "/dashboard/media", icon: ImageIcon },
    { label: "Pages", href: "/dashboard/pages", icon: FileText },
    { label: "Reviews", href: "/dashboard/reviews", icon: Star },
    { label: "Marketing", href: "/dashboard/marketing", icon: Megaphone, shortcut: "G M" },
    { label: "Discounts", href: "/dashboard/marketing/discounts", icon: Percent },
    { label: "Campaigns", href: "/dashboard/marketing/campaigns", icon: Mail },
    { label: "Automations", href: "/dashboard/marketing/automations", icon: Zap },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, shortcut: "G A" },
    { label: "Finances", href: "/dashboard/finances", icon: DollarSign },
    { label: "Settings", href: "/dashboard/settings", icon: Settings, shortcut: "G S" },
    { label: "Payments", href: "/dashboard/settings/payments", icon: CreditCard },
    { label: "Shipping", href: "/dashboard/settings/shipping", icon: Package },
];

const commandActionItems = [
    { label: "Create Product", href: "/dashboard/products/new", icon: Plus, shortcut: "C" },
    { label: "View Orders", href: "/dashboard/orders", icon: ShoppingCart },
    { label: "View Analytics", href: "/dashboard/analytics", icon: TrendingUp },
];

// Go-to shortcut map: after pressing G, the second key navigates
const goToMap: Record<string, string> = {
    d: "/dashboard",
    o: "/dashboard/orders",
    p: "/dashboard/products",
    c: "/dashboard/customers",
    m: "/dashboard/marketing",
    a: "/dashboard/analytics",
    s: "/dashboard/settings",
    i: "/dashboard/inventory",
};

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
    {
        id: "navigation", label: "Navigation", priority: 1,
        shortcuts: [
            { id: "go-home", label: "Go to Dashboard", keys: ["g", "h"], isSequence: true },
            { id: "go-orders", label: "Go to Orders", keys: ["g", "o"], isSequence: true },
            { id: "go-products", label: "Go to Products", keys: ["g", "p"], isSequence: true },
            { id: "go-customers", label: "Go to Customers", keys: ["g", "c"], isSequence: true },
            { id: "go-analytics", label: "Go to Analytics", keys: ["g", "a"], isSequence: true },
            { id: "go-settings", label: "Go to Settings", keys: ["g", "s"], isSequence: true },
        ],
    },
    {
        id: "actions", label: "Actions", priority: 2,
        shortcuts: [
            { id: "command", label: "Command palette", keys: ["⌘", "k"] },
            { id: "create", label: "Create new", keys: ["c"] },
            { id: "search", label: "Search", keys: ["/"] },
            { id: "help", label: "Keyboard shortcuts", keys: ["?"] },
        ],
    },
];

export function DashboardHeader({ 
    storeSlug,
}: DashboardHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [commandOpen, setCommandOpen] = useState(false);
    const [shortcutsOpen, setShortcutsOpen] = useKeyboardShortcutsHelp();
    const goKeyPending = useRef(false);
    const goKeyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const navigate = useCallback((href: string) => {
        router.push(href);
        setCommandOpen(false);
    }, [router]);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;

            // Cmd+K — command palette
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandOpen((open) => !open);
                return;
            }

            // Skip shortcuts when typing in inputs
            if (isInput) return;

            // "C" — create product
            if (e.key === "c" && !e.metaKey && !e.ctrlKey && !e.shiftKey && !goKeyPending.current) {
                e.preventDefault();
                router.push("/dashboard/products/new");
                return;
            }

            // "G" then <key> — go-to navigation (Linear-style)
            if (e.key === "g" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
                e.preventDefault();
                goKeyPending.current = true;
                if (goKeyTimer.current) clearTimeout(goKeyTimer.current);
                goKeyTimer.current = setTimeout(() => { goKeyPending.current = false; }, 1000);
                return;
            }

            if (goKeyPending.current) {
                goKeyPending.current = false;
                if (goKeyTimer.current) clearTimeout(goKeyTimer.current);
                const dest = goToMap[e.key.toLowerCase()];
                if (dest) {
                    e.preventDefault();
                    router.push(dest);
                }
            }
        };
        document.addEventListener("keydown", down);
        return () => {
            document.removeEventListener("keydown", down);
            if (goKeyTimer.current) clearTimeout(goKeyTimer.current);
        };
    }, [router]);

    return (
        <>
            <header className="sticky top-0 z-40 flex h-12 items-center gap-4 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-6">
                {/* Left: sidebar toggle + breadcrumb */}
                <SidebarTrigger />
                <div className="hidden md:block">
                    <DynamicBreadcrumb pathname={pathname} />
                </div>

                <div className="flex-1" />

                {/* Right: search, notifications, view store */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        className="w-52 lg:w-64 justify-start text-muted-foreground text-xs"
                        onClick={() => setCommandOpen(true)}
                    >
                        <Search className="size-3.5 mr-2 shrink-0" />
                        <span className="flex-1 text-left truncate">Search…</span>
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[0.6875rem] font-medium tabular-nums sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>

                    <NotificationCenter
                        tenantId=""
                        userId=""
                        enableRealtime={false}
                    />

                    {storeSlug && (
                        <Button variant="outline" className="gap-1.5 text-xs" asChild>
                            <Link href={`/store/${storeSlug}`} target="_blank">
                                <Store className="size-3.5" />
                                <span className="hidden sm:inline">View Store</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </header>

            {/* Command Palette */}
            <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
                <CommandInput aria-label="Search pages, actions, or type a command" placeholder="Search pages, actions, or type a command..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Quick Actions">
                        {commandActionItems.map((item) => (
                            <CommandItem key={item.href} onSelect={() => navigate(item.href)}>
                                <item.icon className="mr-2 size-4" />
                                {item.label}
                                {item.shortcut && (
                                    <kbd className="ml-auto font-mono text-[0.6875rem] tracking-widest text-muted-foreground tabular-nums">{item.shortcut}</kbd>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Navigation">
                        {commandNavItems.map((item) => (
                            <CommandItem key={item.href} onSelect={() => navigate(item.href)}>
                                <item.icon className="mr-2 size-4" />
                                {item.label}
                                {item.shortcut && (
                                    <kbd className="ml-auto font-mono text-[0.6875rem] tracking-widest text-muted-foreground tabular-nums">{item.shortcut}</kbd>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </CommandDialog>

            <KeyboardShortcutsModal
                open={shortcutsOpen}
                onOpenChange={setShortcutsOpen}
                categories={SHORTCUT_CATEGORIES}
            />
        </>
    );
}
