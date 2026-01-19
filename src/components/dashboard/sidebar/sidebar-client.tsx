"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Settings,
  Percent,
  Layers,
  Tag,
  Image,
  Paintbrush,
  Filter,
  MessageSquare,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Sparkles,
  Brain,
  Zap,
  Moon,
  Sun,
  LogOut,
  Store,
  Plus,
  Bell,
  HelpCircle,
  Rocket,
  CheckCircle,
  Cloud,
  Database,
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

interface IndigoService {
  id: string;
  name: string;
  shortName: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "active" | "setup" | "disabled";
  description: string;
  href: string;
}

// ============================================================================
// Navigation Configuration
// ============================================================================

function createNavigation(counts: { pendingOrders: number; lowStock: number }): NavSection[] {
  return [
    {
      id: "overview",
      items: [
        {
          id: "dashboard",
          title: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          keywords: ["home", "overview", "stats"],
        },
        {
          id: "orders",
          title: "Orders",
          href: "/dashboard/orders",
          icon: ShoppingCart,
          badge: counts.pendingOrders > 0 ? counts.pendingOrders : undefined,
          badgeVariant: "warning",
          keywords: ["sales", "purchases"],
          children: [
            { id: "all-orders", title: "All Orders", href: "/dashboard/orders" },
            { id: "returns", title: "Returns", href: "/dashboard/orders/returns" },
          ],
        },
      ],
    },
    {
      id: "catalog",
      label: "Catalog",
      items: [
        {
          id: "products",
          title: "Products",
          href: "/dashboard/products",
          icon: Tag,
          keywords: ["items", "goods", "sku"],
          children: [
            { id: "all-products", title: "All Products", href: "/dashboard/products" },
            { id: "collections", title: "Collections", href: "/dashboard/collections" },
            { id: "categories", title: "Categories", href: "/dashboard/categories" },
          ],
        },
        {
          id: "inventory",
          title: "Inventory",
          href: "/dashboard/inventory",
          icon: Layers,
          badge: counts.lowStock > 0 ? `${counts.lowStock} low` : undefined,
          badgeVariant: "warning",
          keywords: ["stock", "warehouse"],
          children: [
            { id: "all-inventory", title: "Stock Levels", href: "/dashboard/inventory" },
            { id: "inventory-history", title: "History", href: "/dashboard/inventory/history" },
          ],
        },
        {
          id: "attributes",
          title: "Attributes",
          href: "/dashboard/attributes",
          icon: Filter,
          keywords: ["size", "color", "variants"],
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
          keywords: ["design", "theme", "customize"],
        },
        {
          id: "media",
          title: "Media Library",
          href: "/dashboard/media",
          icon: Image,
          keywords: ["images", "files", "uploads"],
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
          icon: Users,
          keywords: ["users", "clients"],
          children: [
            { id: "all-customers", title: "All Customers", href: "/dashboard/customers" },
            { id: "groups", title: "Groups", href: "/dashboard/customers/groups" },
          ],
        },
        {
          id: "reviews",
          title: "Reviews",
          href: "/dashboard/reviews",
          icon: MessageSquare,
          keywords: ["feedback", "ratings"],
        },
      ],
    },
    {
      id: "marketing",
      label: "Marketing",
      items: [
        {
          id: "marketing",
          title: "Marketing",
          href: "/dashboard/marketing",
          icon: Zap,
          keywords: ["campaigns", "promotions", "automations"],
          children: [
            { id: "discounts", title: "Discounts", href: "/dashboard/marketing/discounts" },
            { id: "campaigns", title: "Campaigns", href: "/dashboard/marketing/campaigns" },
            { id: "automations", title: "Automations", href: "/dashboard/marketing/automations" },
          ],
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
          icon: TrendingUp,
          keywords: ["reports", "metrics"],
        },
      ],
    },
  ];
}

// Indigo AI Services Configuration (powered by AWS under the hood)
const INDIGO_SERVICES: IndigoService[] = [
  {
    id: "indigo-ai",
    name: "Indigo AI",
    shortName: "AI Content",
    icon: Sparkles,
    status: "active",
    description: "AI-powered content generation",
    href: "/dashboard/settings/ai-services/content",
  },
  {
    id: "indigo-search",
    name: "Indigo Search",
    shortName: "Smart Search",
    icon: FileSearch,
    status: "active",
    description: "Intelligent product search",
    href: "/dashboard/settings/ai-services/search",
  },
  {
    id: "indigo-recommendations",
    name: "Indigo Recommendations",
    shortName: "Recommend",
    icon: Brain,
    status: "active",
    description: "Personalized product recommendations",
    href: "/dashboard/settings/ai-services/recommendations",
  },
  {
    id: "indigo-insights",
    name: "Indigo Insights",
    shortName: "Insights",
    icon: BarChart3,
    status: "active",
    description: "AI analytics & forecasting",
    href: "/dashboard/settings/ai-services/insights",
  },
  {
    id: "indigo-content",
    name: "Indigo Content",
    shortName: "Translate",
    icon: Bot,
    status: "active",
    description: "Translation & localization",
    href: "/dashboard/settings/ai-services/translate",
  },
  {
    id: "indigo-media",
    name: "Indigo Media",
    shortName: "Media AI",
    icon: Cpu,
    status: "active",
    description: "Image analysis & auto-tagging",
    href: "/dashboard/settings/ai-services/media",
  },
];


// ============================================================================
// Helper Components
// ============================================================================

function StatusDot({ status }: { status: IndigoService["status"] }) {
  return (
    <span
      className={cn(
        "h-2 w-2 rounded-full",
        status === "active" && "bg-[var(--ds-green-600)]",
        status === "setup" && "bg-[var(--ds-amber-500)]",
        status === "disabled" && "bg-[var(--ds-gray-400)]"
      )}
    />
  );
}

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
    free: { label: "Free", className: "bg-[var(--ds-gray-200)] text-[var(--ds-gray-700)]" },
    trial: { label: `${trialDaysLeft}d left`, className: "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)]" },
    pro: { label: "Pro", className: "bg-[var(--ds-green-100)] text-[var(--ds-green-700)]" },
  }[planType];

  const dropdownContent = (
    <DropdownMenuContent 
      side={isCollapsed ? "right" : "bottom"} 
      align="start" 
      sideOffset={isCollapsed ? 8 : 4} 
      className="w-64 overscroll-contain"
    >
      <DropdownMenuLabel className="flex flex-col gap-1">
        <span className="font-medium">{tenantName}</span>
        <span className="text-xs text-[var(--ds-gray-600)]">
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
      <DropdownMenuItem className="flex items-center gap-2 text-[var(--ds-gray-600)]" disabled>
        <Plus className="h-4 w-4" />
        Create New Store
        <Badge variant="secondary" className="ml-auto text-[10px]">Soon</Badge>
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  const storeIcon = (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--ds-gray-1000)] text-white font-semibold text-sm overflow-hidden transition-transform duration-150 active:scale-[0.98] motion-reduce:transform-none">
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
            "flex items-center rounded-lg text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-1",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            isCollapsed 
              ? "h-10 w-10 justify-center p-0" 
              : "w-full gap-3 p-2 hover:bg-[var(--ds-gray-100)] active:scale-[0.99]"
          )}
          aria-label={`${tenantName} store menu`}
        >
          {storeIcon}
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-[var(--ds-gray-900)] truncate">
                  {tenantName}
                </span>
                <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4 shrink-0", planBadge.className)}>
                  {planBadge.label}
                </Badge>
              </div>
              <span className="text-xs text-[var(--ds-gray-600)] truncate block">
                {storeSlug ? `${storeSlug}.indigo.store` : "Configure domain"}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--ds-gray-500)] group-hover:text-[var(--ds-gray-700)] transition-colors duration-150" />
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
                "hover:bg-[var(--ds-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)]",
                isItemActive && "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)]"
              )}
              aria-label={item.title}
            >
              <Icon className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-48 overscroll-contain">
            <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-[var(--ds-gray-600)]">
              <Icon className="h-3.5 w-3.5" />
              {item.title}
              {item.badge && (
                <Badge variant="secondary" className={cn(
                  "ml-auto text-[10px] px-1.5 py-0 h-4",
                  item.badgeVariant === "warning" && "bg-[var(--ds-amber-500)] text-white"
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
                      "bg-[var(--ds-gray-100)] font-medium"
                  )}
                >
                  <span>{child.title}</span>
                  {child.badge && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {child.badge}
                    </Badge>
                  )}
                  {child.external && <ExternalLink className="h-3 w-3 ml-auto text-[var(--ds-gray-500)]" />}
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
                "hover:bg-[var(--ds-gray-100)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)]",
                isItemActive && "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] font-medium"
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
                item.badgeVariant === "warning" && "bg-[var(--ds-amber-500)] text-white"
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
            isItemActive && "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] font-medium"
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
                  item.badgeVariant === "warning" && "bg-[var(--ds-amber-500)] text-white"
                )}
              >
                {item.badge}
              </Badge>
            )}
            {item.external && <ExternalLink className="h-3 w-3 shrink-0 text-[var(--ds-gray-500)]" />}
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
              isItemActive && "bg-[var(--ds-gray-100)] text-[var(--ds-gray-900)] font-medium"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 truncate text-left">{item.title}</span>
            {item.badge && (
              <Badge 
                variant="secondary" 
                className={cn(
                  "shrink-0 text-[10px] px-1.5 py-0 h-5 min-w-5 tabular-nums",
                  item.badgeVariant === "warning" && "bg-[var(--ds-amber-500)] text-white"
                )}
              >
                {item.badge}
              </Badge>
            )}
            <ChevronRight className={cn(
              "h-4 w-4 shrink-0 text-[var(--ds-gray-500)] transition-transform duration-200",
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
                      <Badge variant="secondary" className="ml-auto text-xs">
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
// Indigo AI Services Panel Component
// ============================================================================

interface IndigoServicesPanelProps {
  isCollapsed: boolean;
}

function IndigoServicesPanel({ isCollapsed }: IndigoServicesPanelProps) {
  const activeCount = INDIGO_SERVICES.filter((s) => s.status === "active").length;
  const setupCount = INDIGO_SERVICES.filter((s) => s.status === "setup").length;

  if (isCollapsed) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--ds-blue-100)] to-[var(--ds-purple-100)] hover:from-[var(--ds-blue-200)] hover:to-[var(--ds-purple-200)] transition-colors duration-150 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-1"
            aria-label="Indigo AI Services"
          >
            <Sparkles className="h-5 w-5 text-[var(--ds-blue-700)]" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-56 overscroll-contain">
          <DropdownMenuLabel className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--ds-blue-600)]" />
              <span>Indigo AI</span>
            </div>
            <span className="text-xs text-[var(--ds-gray-600)]">
              {activeCount}/{INDIGO_SERVICES.length} active
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {INDIGO_SERVICES.map((service) => (
            <DropdownMenuItem key={service.id} asChild>
              <Link
                href={service.href}
                className="flex items-center gap-2 cursor-pointer"
              >
                <service.icon className="h-4 w-4" />
                <span className="flex-1">{service.shortName}</span>
                <StatusDot status={service.status} />
              </Link>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/dashboard/settings/ai-services" className="flex items-center gap-2 cursor-pointer text-[var(--ds-gray-600)]">
              View all services
              <ChevronRight className="h-3 w-3 ml-auto" />
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[var(--ds-blue-600)]" />
          <span className="text-xs font-medium text-[var(--ds-gray-600)] uppercase tracking-wider">
            Indigo AI
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--ds-green-600)] font-medium">{activeCount}</span>
          <span className="text-[10px] text-[var(--ds-gray-500)]">/</span>
          <span className="text-[10px] text-[var(--ds-gray-600)]">{INDIGO_SERVICES.length}</span>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {INDIGO_SERVICES.slice(0, 4).map((service) => (
          <Tooltip key={service.id}>
            <TooltipTrigger asChild>
              <Link
                href={service.href}
                className={cn(
                  "flex items-center gap-2 p-2 rounded-md text-xs transition-colors duration-150",
                  "active:scale-[0.98] motion-reduce:transform-none",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-1",
                  service.status === "active" && "bg-[var(--ds-gray-100)] text-[var(--ds-gray-800)] hover:bg-[var(--ds-gray-200)]",
                  service.status === "setup" && "bg-[var(--ds-amber-50)] text-[var(--ds-amber-800)] hover:bg-[var(--ds-amber-100)] border border-[var(--ds-amber-200)]",
                  service.status === "disabled" && "bg-[var(--ds-gray-50)] text-[var(--ds-gray-600)] hover:bg-[var(--ds-gray-100)]"
                )}
              >
                <service.icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate flex-1">{service.shortName}</span>
                <StatusDot status={service.status} />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-48">
              <div className="space-y-1">
                <p className="font-medium">{service.name}</p>
                <p className="text-xs text-[var(--ds-gray-600)]">{service.description}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* View All Link */}
      <Link
        href="/dashboard/settings/ai-services"
        className="flex items-center justify-center gap-1 py-1.5 text-xs text-[var(--ds-gray-600)] hover:text-[var(--ds-gray-800)] transition-colors duration-150 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)]"
      >
        View all services
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

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
    "bg-[var(--ds-blue-600)]",
    "bg-[var(--ds-green-600)]",
    "bg-[var(--ds-purple-600)]",
    "bg-[var(--ds-amber-600)]",
    "bg-[var(--ds-pink-600)]",
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
          <span className="text-xs text-[var(--ds-gray-600)]">{userEmail}</span>
          <Badge variant="secondary" className="w-fit text-[10px] px-1.5 py-0 h-4 mt-1 bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]">
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
            "flex items-center rounded-lg text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-1",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            isCollapsed 
              ? "h-10 w-10 justify-center p-0" 
              : "w-full gap-3 p-2 hover:bg-[var(--ds-gray-100)] active:scale-[0.99]"
          )}
          aria-label={`${displayName} account menu`}
        >
          {userAvatar}
          {!isCollapsed && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-[var(--ds-gray-900)] truncate">
                  {displayName}
                </span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)] shrink-0">
                  {roleLabels[userRole]}
                </Badge>
              </div>
              <span className="text-xs text-[var(--ds-gray-600)] truncate block">
                {userEmail}
              </span>
            </div>
          )}
          {!isCollapsed && (
            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--ds-gray-500)] group-hover:text-[var(--ds-gray-700)] transition-colors duration-150" />
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
  
  // Track which nav items with children are expanded
  const [openSections, setOpenSections] = useState<string[]>(() => {
    // Auto-expand sections based on current path
    const sections: string[] = [];
    if (pathname.startsWith("/dashboard/orders")) sections.push("orders");
    if (pathname.startsWith("/dashboard/products") || pathname.startsWith("/dashboard/collections") || pathname.startsWith("/dashboard/categories")) sections.push("products");
    if (pathname.startsWith("/dashboard/inventory")) sections.push("inventory");
    if (pathname.startsWith("/dashboard/customers")) sections.push("customers");
    if (pathname.startsWith("/dashboard/marketing")) sections.push("marketing");
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
        // TODO: Open command palette
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
            a: "/dashboard/analytics",
            s: "/dashboard/settings",
            i: "/dashboard/inventory",
            m: "/dashboard/media",
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
      <SidebarContent className={cn("px-3", isCollapsed && "px-0")}>
        {navigation.map((section) => (
          <SidebarGroup key={section.id} className="py-1">
            {section.label && !isCollapsed && (
              <SidebarGroupLabel className="text-xs font-medium text-[var(--ds-gray-600)] uppercase tracking-wider px-2 mb-1">
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
        {/* Indigo AI Services Section */}
        {/* ================================================================ */}
        <SidebarGroup className="py-2 mt-2 border-t border-[var(--ds-gray-200)]">
          <SidebarGroupContent>
            <IndigoServicesPanel isCollapsed={isCollapsed} />
          </SidebarGroupContent>
        </SidebarGroup>

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
                    { id: "settings-domains", title: "Domains", href: "/dashboard/settings/domains" },
                    { id: "settings-currency", title: "Currency", href: "/dashboard/settings/currency" },
                    { id: "settings-notifications", title: "Notifications", href: "/dashboard/settings/notifications" },
                    { id: "settings-storefront", title: "Storefront", href: "/dashboard/settings/storefront" },
                    { id: "settings-ai-services", title: "AI Services", href: "/dashboard/settings/ai-services" },
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
          <div className="mb-3 p-3 rounded-lg bg-gradient-to-br from-[var(--ds-blue-100)] to-[var(--ds-purple-100)] border border-[var(--ds-blue-200)]">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-md bg-[var(--ds-blue-200)]">
                <Rocket className="h-4 w-4 text-[var(--ds-blue-700)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--ds-gray-900)]">
                  {planType === "trial" ? "Pro Trial" : "Free Plan"}
                </p>
                {planType === "trial" && (
                  <p className="text-[10px] text-[var(--ds-blue-700)] font-medium">
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
          <div className="mb-3 p-3 rounded-lg bg-[var(--ds-green-100)] border border-[var(--ds-green-200)]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-[var(--ds-green-200)]">
                <CheckCircle className="h-4 w-4 text-[var(--ds-green-700)]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--ds-gray-900)]">Pro Plan</p>
                <p className="text-[10px] text-[var(--ds-green-700)]">All features unlocked</p>
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
