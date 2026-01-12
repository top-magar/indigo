"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
    Store,
    Bell,
    Search,
    ShoppingCart,
    AlertCircle,
    CheckCircle,
    Plus,
    Package,
    Users,
    TrendingUp,
    Settings,
    LayoutDashboard,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
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
    "/dashboard/products": { title: "Products" },
    "/dashboard/products/new": { title: "New Product" },
    "/dashboard/inventory": { title: "Inventory" },
    "/dashboard/categories": { title: "Categories" },
    "/dashboard/collections": { title: "Collections" },
    "/dashboard/customers": { title: "Customers" },
    "/dashboard/analytics": { title: "Analytics" },
    "/dashboard/settings": { title: "Store Settings" },
    "/dashboard/settings/checkout": { title: "Checkout" },
    "/dashboard/settings/account": { title: "Account" },
    "/dashboard/settings/team": { title: "Team" },
    "/dashboard/settings/notifications": { title: "Notifications" },
    "/dashboard/settings/payments": { title: "Payments" },
    "/dashboard/settings/domains": { title: "Domains" },
};

function DynamicBreadcrumb({ pathname }: { pathname: string }) {
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbItems: { title: string; href: string; isLast: boolean }[] = [];
    
    if (pathname !== "/dashboard") {
        breadcrumbItems.push({ title: "Dashboard", href: "/dashboard", isLast: false });
    }
    
    if (segments.length >= 2) {
        const section = segments[1];
        if (section === "settings" && segments.length > 2) {
            breadcrumbItems.push({ title: "Settings", href: "/dashboard/settings", isLast: false });
            const settingsPage = `/dashboard/settings/${segments[2]}`;
            const config = routeConfig[settingsPage];
            breadcrumbItems.push({ title: config?.title || segments[2], href: settingsPage, isLast: true });
        } else if (segments.length > 2 && !["new", "edit"].includes(segments[2])) {
            const sectionPath = `/dashboard/${section}`;
            const config = routeConfig[sectionPath];
            if (config) breadcrumbItems.push({ title: config.title, href: sectionPath, isLast: false });
            breadcrumbItems.push({ title: "Details", href: pathname, isLast: true });
        } else {
            const config = routeConfig[pathname];
            breadcrumbItems.push({ title: config?.title || section, href: pathname, isLast: true });
        }
    }

    if (breadcrumbItems.length === 0) {
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

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                    <React.Fragment key={item.href}>
                        {index > 0 && <BreadcrumbSeparator className="text-muted-foreground/50" />}
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

export function DashboardHeader({ 
    storeSlug,
    pendingOrdersCount = 0,
    lowStockCount = 0,
    newCustomersCount = 0,
}: DashboardHeaderProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [commandOpen, setCommandOpen] = useState(false);

    const totalNotifications = pendingOrdersCount + lowStockCount + newCustomersCount;

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setCommandOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <>
            <header className="sticky top-0 z-40 flex h-14 items-center gap-[26px] border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-6">
                <div className="flex items-center gap-3">
                    <SidebarTrigger className="hover:bg-accent" />
                    <div className="hidden md:block">
                        <DynamicBreadcrumb pathname={pathname} />
                    </div>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-[13px]">
                    {/* Search */}
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="hidden sm:flex h-9 w-64 lg:w-[388px] justify-start text-muted-foreground hover:text-foreground border-border/60"
                        onClick={() => setCommandOpen(true)}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        <span className="flex-1 text-left">Search...</span>
                        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                    </Button>

                    <Button variant="ghost" size="icon-sm" className="sm:hidden rounded-full" onClick={() => setCommandOpen(true)}>
                        <Search className="w-[18px] h-[18px]" />
                    </Button>

                    {/* Quick Actions */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="rounded-full hover:bg-muted">
                                <Plus className="w-[18px] h-[18px]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                            <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => router.push("/dashboard/products/new")}>
                                <Package className="w-4 h-4 mr-2" />
                                New Product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/dashboard/orders")}>
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                View Orders
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push("/dashboard/customers")}>
                                <Users className="w-4 h-4 mr-2" />
                                Customers
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm" className="relative rounded-full hover:bg-muted">
                                <Bell className="w-[18px] h-[18px]" />
                                {totalNotifications > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-chart-4 px-1 text-[10px] font-medium text-primary-foreground">
                                        {totalNotifications > 9 ? "9+" : totalNotifications}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" sideOffset={8} className="w-80">
                            <DropdownMenuLabel className="flex items-center justify-between">
                                <span>Notifications</span>
                                {totalNotifications > 0 && <Badge variant="secondary" className="text-[10px]">{totalNotifications} new</Badge>}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {pendingOrdersCount > 0 && (
                                <DropdownMenuItem asChild className="flex items-start gap-3 p-3 cursor-pointer">
                                    <Link href="/dashboard/orders?status=pending">
                                        <div className="h-8 w-8 rounded-xl bg-chart-1/10 flex items-center justify-center shrink-0">
                                            <ShoppingCart className="w-4 h-4 text-chart-1" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Pending Orders</p>
                                            <p className="text-xs text-muted-foreground">{pendingOrdersCount} orders need attention</p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {lowStockCount > 0 && (
                                <DropdownMenuItem asChild className="flex items-start gap-3 p-3 cursor-pointer">
                                    <Link href="/dashboard/inventory?filter=low-stock">
                                        <div className="h-8 w-8 rounded-xl bg-chart-4/10 flex items-center justify-center shrink-0">
                                            <AlertCircle className="w-4 h-4 text-chart-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Low Stock Alert</p>
                                            <p className="text-xs text-muted-foreground">{lowStockCount} products running low</p>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            {totalNotifications === 0 && (
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center mb-2">
                                        <CheckCircle className="w-5 h-5 text-chart-2" />
                                    </div>
                                    <p className="text-sm text-muted-foreground">All caught up!</p>
                                </div>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* View Store */}
                    {storeSlug && (
                        <Button variant="outline" size="sm" className="hidden lg:flex rounded-full px-4 gap-2 border-border/60" asChild>
                            <Link href={`/store/${storeSlug}`} target="_blank">
                                <Store className="w-4 h-4" />
                                <span>View Store</span>
                            </Link>
                        </Button>
                    )}
                </div>
            </header>

            {/* Command Palette */}
            <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
                <CommandInput placeholder="Search or type a command..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Quick Actions">
                        <CommandItem onSelect={() => { router.push("/dashboard/products/new"); setCommandOpen(false); }}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Product
                        </CommandItem>
                        <CommandItem onSelect={() => { router.push("/dashboard/orders"); setCommandOpen(false); }}>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            View Orders
                        </CommandItem>
                        <CommandItem onSelect={() => { router.push("/dashboard/analytics"); setCommandOpen(false); }}>
                            <TrendingUp className="mr-2 h-4 w-4" />
                            Analytics
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => { router.push("/dashboard"); setCommandOpen(false); }}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            Dashboard
                        </CommandItem>
                        <CommandItem onSelect={() => { router.push("/dashboard/products"); setCommandOpen(false); }}>
                            <Package className="mr-2 h-4 w-4" />
                            Products
                        </CommandItem>
                        <CommandItem onSelect={() => { router.push("/dashboard/customers"); setCommandOpen(false); }}>
                            <Users className="mr-2 h-4 w-4" />
                            Customers
                        </CommandItem>
                        <CommandItem onSelect={() => { router.push("/dashboard/settings"); setCommandOpen(false); }}>
                            <Settings className="mr-2 h-4 w-4" />
                            Settings
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
