"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  TrendingUp,
  Settings,
  Tag,
  Paintbrush,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Brain,
  Zap,
  Moon,
  Sun,
  Plus,
  Bell,
  HelpCircle,
  Rocket,
  CheckCircle,
  Cloud,
  Bot,
  FileSearch,
  BarChart3,
  Cpu,
} from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuBadge,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn, formatCurrency } from "@/shared/utils";
import { SignOutButton } from "../layout/sign-out-button";
import { CommandPalette } from "../command-palette";
import type { SidebarClientProps, PlanType, UserRole } from "./types";

// ============================================================================
// Types
// ============================================================================

interface NavItem {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeVariant?: "default" | "warning" | "success" | "destructive";
  external?: boolean;
  children?: NavSubItem[];
  keywords?: string[];
}

interface NavSubItem {
  id: string;
  title: string;
  href: string;
  badge?: string;
  external?: boolean;
}

interface NavSection {
  id: string;
  label?: string;
  items: NavItem[];
}

// ============================================================================
// Navigation Configuration
// ============================================================================

function createNavigation(counts: { pendingOrders: number; lowStock: number }): NavSection[] {
  return [
    {
      id: "daily",
      items: [
        {
          id: "home",
          title: "Home",
          href: "/dashboard",
          icon: LayoutDashboard,
          keywords: ["home", "overview", "dashboard", "stats", "metrics"],
        },
        {
          id: "orders",
          title: "Orders",
          href: "/dashboard/orders",
          icon: ShoppingCart,
          badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined,
          badgeVariant: "warning",
          keywords: ["sales", "purchases", "returns", "refunds", "abandoned", "fulfillment"],
        },
        {
          id: "products",
          title: "Products",
          href: "/dashboard/products",
          icon: Tag,
          badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
          badgeVariant: "warning",
          keywords: ["items", "goods", "sku", "inventory", "stock", "collections", "categories", "variants", "attributes", "reviews"],
        },
        {
          id: "customers",
          title: "Customers",
          href: "/dashboard/customers",
          icon: Users,
          keywords: ["users", "clients", "buyers", "groups", "segments"],
        },
      ],
    },
    {
      id: "grow",
      items: [
        {
          id: "marketing",
          title: "Marketing",
          href: "/dashboard/marketing",
          icon: Zap,
          keywords: ["campaigns", "promotions", "discounts", "coupons", "gift cards", "automations"],
        },
        {
          id: "analytics",
          title: "Analytics",
          href: "/dashboard/analytics",
          icon: TrendingUp,
          keywords: ["reports", "metrics", "insights", "revenue", "finances", "payouts"],
        },
      ],
    },
    {
      id: "manage",
      items: [
        {
          id: "storefront",
          title: "Storefront",
          href: "/storefront",
          icon: Paintbrush,
          keywords: ["editor", "storefront", "design", "layout", "visual"],
        },
        {
          id: "content",
          title: "Content",
          href: "/dashboard/media",
          icon: Paintbrush,
          keywords: ["media", "images", "pages", "cms"],
          children: [
            { id: "media", title: "Media Library", href: "/dashboard/media" },
            { id: "pages", title: "Pages", href: "/dashboard/pages" },
          ],
        },
      ],
    },
  ];
}


// ============================================================================
// Helper Components
// ============================================================================

// ============================================================================
// Store Switcher Component
// ============================================================================

interface StoreSwitcherProps {
  tenantName: string;
  storeLogo?: string | null;
  planType: PlanType;
  trialDaysLeft: number;
  storeSlug?: string;
  isCollapsed: boolean;
}

function StoreSwitcher({
  tenantName,
  storeLogo,
  planType,
  trialDaysLeft,
  storeSlug,
  isCollapsed,
}: StoreSwitcherProps) {
  const planBadge = {
    free: { label: "Free", className: "bg-muted text-muted-foreground" },
    trial: { label: `${trialDaysLeft}d left`, className: "bg-info/10 text-info" },
    pro: { label: "Pro", className: "bg-success/10 text-success" },
  }[planType];

  const dropdownContent = (
    <DropdownMenuContent 
      side={isCollapsed ? "right" : "bottom"} 
      align="start" 
      sideOffset={isCollapsed ? 8 : 4} 
      className="w-64 overscroll-contain"
    >
      <DropdownMenuLabel className="flex flex-col gap-1">
        <span className="font-medium tracking-[-0.28px]">{tenantName}</span>
        <span className="text-xs text-muted-foreground">
          {storeSlug ? `${storeSlug}.indigo.store` : "Configure domain"}
        </span>
        <Badge variant="secondary" className={cn("w-fit text-[10px] px-1.5 py-0 h-4 mt-1", planBadge.className)}>
          {planBadge.label}
        </Badge>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
          <Settings className="h-4 w-4" />
          Store Settings
        </Link>
      </DropdownMenuItem>
      {storeSlug && (
        <DropdownMenuItem asChild>
          <Link href={`/store/${storeSlug}`} target="_blank" className="flex items-center gap-2 cursor-pointer">
            <ExternalLink className="h-4 w-4" />
            View Storefront
          </Link>
        </DropdownMenuItem>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link href="/dashboard/settings/domains" className="flex items-center gap-2 cursor-pointer">
          <Cloud className="h-4 w-4" />
          Custom Domain
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="flex items-center gap-2 text-muted-foreground" disabled>
        <Plus className="h-4 w-4" />
        Create New Store
        <Badge variant="secondary" className="ml-auto text-[10px]">Soon</Badge>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  const storeIcon = (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-foreground text-white font-semibold text-sm overflow-hidden transition-transform duration-150 active:scale-[0.98] motion-reduce:transform-none">
      {storeLogo ? (
        <img src={storeLogo} alt={tenantName} className="h-full w-full object-cover" />
      ) : (
        tenantName.charAt(0).toUpperCase()
      )}
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          className={cn(
            "flex items-center rounded-lg text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            isCollapsed 
              ? "h-10 w-10 justify-center p-0" 
              : "w-full gap-3 p-2 hover:bg-muted active:scale-[0.99]"
          )}
          aria-label={`${tenantName} store menu`}
        >
          {storeIcon}
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm tracking-[-0.28px] text-foreground truncate">
                  {tenantName}
                </span>
                <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4 shrink-0", planBadge.className)}>
                  {planBadge.label}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground truncate block">
                {storeSlug ? `${storeSlug}.indigo.store` : "Configure domain"}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-muted-foreground transition-colors duration-150" />
          )}
        </button>
      </DropdownMenuTrigger>
      {dropdownContent}
    </DropdownMenu>
  );
}

// ============================================================================
// Navigation Item Component
// ============================================================================

interface NavItemProps {
  item: NavItem;
  isActive: boolean;
  isCollapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
}

function NavItemComponent({ item, isActive, isCollapsed, isOpen, onToggle, pathname }: NavItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  // Check if any child is active
  const isChildActive = hasChildren && item.children?.some(
    (child) => pathname === child.href || pathname.startsWith(child.href + "/")
  );

  const isItemActive = isActive || isChildActive;

  // Collapsed state with children - show dropdown menu with children
  if (isCollapsed && hasChildren) {
    return (
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150",
                "active:scale-[0.98] motion-reduce:transform-none",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isItemActive && ""
              )}
              aria-label={item.title}
            >
              <Icon className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-48 overscroll-contain">
            <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <Icon className="h-3.5 w-3.5" />
              {item.title}
              {item.badge && (
                <Badge variant="secondary" className={cn(
                  "ml-auto text-[10px] px-1.5 py-0 h-4",
                  item.badgeVariant === "warning" && "bg-warning/70 text-white"
                )}>
                  {item.badge}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.children?.map((child) => (
              <DropdownMenuItem key={child.id} asChild>
                <Link
                  href={child.href}
                  target={child.external ? "_blank" : undefined}
                  className={cn(
                    "flex items-center gap-2 text-sm cursor-pointer",
                    (pathname === child.href || pathname.startsWith(child.href + "/")) &&
                      "bg-muted font-medium"
                  )}
                >
                  <span>{child.title}</span>
                  {child.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs tabular-nums">
                      {child.badge}
                    </Badge>
                  )}
                  {child.external && <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    );
  }

  // Collapsed state without children - show icon with tooltip
  if (isCollapsed) {
    return (
      <SidebarMenuItem>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href={item.href}
              target={item.external ? "_blank" : undefined}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-md transition-colors duration-150",
                "active:scale-[0.98] motion-reduce:transform-none",
                "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isItemActive && "font-medium"
              )}
              aria-label={item.title}
            >
              <Icon className="h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-2">
            {item.title}
            {item.badge && (
              <Badge variant="secondary" className={cn(
                "text-xs",
                item.badgeVariant === "warning" && "bg-warning/70 text-white"
              )}>
                {item.badge}
              </Badge>
            )}
          </TooltipContent>
        </Tooltip>
      </SidebarMenuItem>
    );
  }

  // Items without children - simple link
  if (!hasChildren) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          isActive={isItemActive}
          className={cn(
            "transition-colors duration-150 active:scale-[0.98] motion-reduce:transform-none",
            isItemActive && "font-medium"
          )}
        >
          <Link
            href={item.href}
            target={item.external ? "_blank" : undefined}
            className="flex items-center gap-2"
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "shrink-0 text-[10px] px-1.5 py-0 h-5 min-w-5 tabular-nums",
                  item.badgeVariant === "warning" && "bg-warning/70 text-white"
                )}
              >
                {item.badge}
              </Badge>
            )}
            {item.external && <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Items with children - collapsible
  // Note: We use inline Badge instead of SidebarMenuBadge here because
  // SidebarMenuBadge uses absolute positioning which conflicts with the chevron
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            isActive={isItemActive}
            className={cn(
              "transition-colors duration-150 active:scale-[0.98] motion-reduce:transform-none",
              isItemActive && "font-medium"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-left">{item.title}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "shrink-0 text-[10px] px-1.5 py-0 h-5 min-w-5 tabular-nums",
                  item.badgeVariant === "warning" && "bg-warning/70 text-white"
                )}
              >
                {item.badge}
              </Badge>
            )}
            <ChevronRight className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              isOpen && "rotate-90"
            )} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.children?.map((child) => (
              <SidebarMenuSubItem key={child.id}>
                <SidebarMenuSubButton
                  asChild
                  isActive={pathname === child.href || pathname.startsWith(child.href + "/")}
                >
                  <Link href={child.href} target={child.external ? "_blank" : undefined}>
                    <span>{child.title}</span>
                    {child.badge && (
                      <Badge variant="secondary" className="ml-auto text-xs tabular-nums">
                        {child.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}


// ============================================================================
// ============================================================================

// ============================================================================
// User Menu Component
// ============================================================================

interface UserMenuProps {
  userEmail: string | null | undefined;
  userAvatarUrl?: string | null;
  userFullName?: string | null;
  userRole: UserRole;
  isCollapsed: boolean;
  theme?: string;
  setTheme: (theme: string) => void;
}

function UserMenuComponent({
  userEmail,
  userAvatarUrl,
  userFullName,
  userRole,
  isCollapsed,
  theme,
  setTheme,
}: UserMenuProps) {
  const displayName = userFullName || userEmail?.split("@")[0] || "User";
  const userInitial = (userFullName?.charAt(0) || userEmail?.charAt(0) || "U").toUpperCase();

  const roleLabels: Record<UserRole, string> = {
    owner: "Owner",
    admin: "Admin",
    staff: "Staff",
  };

  const avatarColors = [
    "bg-primary",
    "bg-success/80",
    "bg-ds-teal-700",
    "bg-warning",
    "bg-ds-purple-700",
  ];
  const colorIndex = userEmail ? userEmail.charCodeAt(0) % avatarColors.length : 0;

  const dropdownContent = (
    <DropdownMenuContent 
      side={isCollapsed ? "right" : "bottom"} 
      align={isCollapsed ? "end" : "end"} 
      sideOffset={isCollapsed ? 8 : 4} 
      className="w-56 overscroll-contain"
    >
      <DropdownMenuLabel>
        <div className="flex flex-col">
          <span className="font-medium">{displayName}</span>
          <span className="text-xs text-muted-foreground">{userEmail}</span>
          <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0 h-4 mt-1 bg-muted text-muted-foreground">
            {roleLabels[userRole]}
          </Badge>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/account">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings/notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help" target="_blank">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
        {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <SignOutButton />
    </DropdownMenuContent>
  );

  const userAvatar = (
    <Avatar className={cn("shrink-0 transition-transform duration-150 active:scale-[0.98] motion-reduce:transform-none", isCollapsed ? "h-9 w-9" : "h-9 w-9")}>
      <AvatarImage src={userAvatarUrl || undefined} alt={displayName} />
      <AvatarFallback className={cn("text-white text-sm font-medium", avatarColors[colorIndex])}>
        {userInitial}
      </AvatarFallback>
    </Avatar>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex items-center rounded-lg text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            isCollapsed 
              ? "h-10 w-10 justify-center p-0" 
              : "w-full gap-3 p-2 hover:bg-muted active:scale-[0.99]"
          )}
          aria-label={`${displayName} account menu`}
        >
          {userAvatar}
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm tracking-[-0.28px] text-foreground truncate">
                  {displayName}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground shrink-0">
                  {roleLabels[userRole]}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground truncate block">
                {userEmail}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-muted-foreground transition-colors duration-150" />
          )}
        </button>
      </DropdownMenuTrigger>
      {dropdownContent}
    </DropdownMenu>
  );
}


// ============================================================================
// Main Sidebar Component
// ============================================================================

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
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  
  // Track which nav items with children are expanded
  const [openSections, setOpenSections] = useState<string[]>(() => {
    // Auto-expand sections based on current path
    const sections: string[] = [];
    if (pathname.startsWith("/dashboard/media") || pathname.startsWith("/dashboard/pages")) sections.push("content");
    if (pathname.startsWith("/dashboard/settings")) sections.push("settings");
    return sections;
  });

  const navigation = useMemo(
    () => createNavigation({ pendingOrders: pendingOrdersCount, lowStock: lowStockCount }),
    [pendingOrdersCount, lowStockCount]
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === "/dashboard") return pathname === "/dashboard";
      const basePath = href.split("?")[0];
      return pathname === basePath || pathname.startsWith(basePath + "/");
    },
    [pathname]
  );

  const toggleSection = useCallback((id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  // Keyboard shortcuts for quick navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // Quick navigation with 'g' prefix
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      
      if (e.key === "g" && !isInput && !e.metaKey && !e.ctrlKey) {
        const handleSecondKey = (e2: KeyboardEvent) => {
          const routes: Record<string, string> = {
            d: "/dashboard",
            o: "/dashboard/orders",
            p: "/dashboard/products",
            c: "/dashboard/customers",
            m: "/dashboard/marketing",
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
    <TooltipProvider delayDuration={150}>
      <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} commands={[]} />
      {/* ================================================================== */}
      {/* Header - Store Switcher */}
      {/* ================================================================== */}
      <SidebarHeader className={cn("p-3", isCollapsed && "p-2")}>
        <StoreSwitcher
          tenantName={tenantName}
          storeLogo={storeLogo}
          planType={planType}
          trialDaysLeft={trialDaysLeft}
          storeSlug={storeSlug}
          isCollapsed={isCollapsed}
        />
      </SidebarHeader>



      {/* ================================================================== */}
      {/* Main Navigation */}
      {/* ================================================================== */}
      <SidebarContent className={cn("px-3", isCollapsed && "px-0")} role="navigation" aria-label="Main navigation">
        {navigation.map((section) => (
          <SidebarGroup key={section.id} className="py-1">
            {section.label && !isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2 mb-1">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <NavItemComponent
                    key={item.id}
                    item={item}
                    isActive={isActive(item.href)}
                    isCollapsed={isCollapsed}
                    isOpen={openSections.includes(item.id)}
                    onToggle={() => toggleSection(item.id)}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* ================================================================ */}
        {/* Settings Section */}
        {/* ================================================================ */}
        <SidebarGroup className="py-1 mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItemComponent
                item={{
                  id: "settings",
                  title: "Settings",
                  href: "/dashboard/settings",
                  icon: Settings,
                  keywords: ["preferences", "configuration"],
                  children: [
                    { id: "settings-general", title: "General", href: "/dashboard/settings" },
                    { id: "settings-account", title: "Account", href: "/dashboard/settings/account" },
                    { id: "settings-team", title: "Team", href: "/dashboard/settings/team" },
                    { id: "settings-payments", title: "Payments", href: "/dashboard/settings/payments" },
                    { id: "settings-checkout", title: "Checkout", href: "/dashboard/settings/checkout" },
                    { id: "settings-shipping", title: "Shipping", href: "/dashboard/settings/shipping" },
                    { id: "settings-tax", title: "Tax", href: "/dashboard/settings/tax" },
                    { id: "settings-domains", title: "Domains", href: "/dashboard/settings/domains" },
                    { id: "settings-currency", title: "Currency", href: "/dashboard/settings/currency" },
                    { id: "settings-notifications", title: "Notifications", href: "/dashboard/settings/notifications" },
                    { id: "settings-storefront", title: "Storefront", href: "/dashboard/settings/storefront" },
                  ],
                }}
                isActive={isActive("/dashboard/settings")}
                isCollapsed={isCollapsed}
                isOpen={openSections.includes("settings")}
                onToggle={() => toggleSection("settings")}
                pathname={pathname}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ================================================================== */}
      {/* Footer - Upgrade Banner & User Menu */}
      {/* ================================================================== */}
      <SidebarFooter className={cn("p-3", isCollapsed && "p-2 gap-2")}>
        {/* Upgrade Banner */}
        {!isCollapsed && planType !== "pro" && (
          <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-muted">
                <Rocket className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[-0.28px] text-foreground">
                  {planType === "trial" ? "Pro Trial" : "Free Plan"}
                </p>
                {planType === "trial" && (
                  <p className="text-[10px] text-muted-foreground font-medium">
                    {trialDaysLeft} days remaining
                  </p>
                )}
              </div>
            </div>
            <Button size="sm" className="w-full text-xs h-8">
              <Rocket className="h-3.5 w-3.5 mr-1.5" />
              Upgrade to Pro
            </Button>
          </div>
        )}

        {/* Pro Badge */}
        {!isCollapsed && planType === "pro" && (
          <div className="mb-3 p-3 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-muted">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold tracking-[-0.28px] text-foreground">Pro Plan</p>
                <p className="text-[10px] text-muted-foreground">All features unlocked</p>
              </div>
            </div>
          </div>
        )}

        {/* User Menu */}
        <UserMenuComponent
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
