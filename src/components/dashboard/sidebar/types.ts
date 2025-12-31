import type { DashboardSquare01Icon } from "@hugeicons/core-free-icons";

export type PlanType = "free" | "trial" | "pro";
export type UserRole = "owner" | "admin" | "staff";

export interface NavItem {
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

export interface NavSubItem {
    id: string;
    title: string;
    href: string;
    badge?: number | string;
    disabled?: boolean;
    soon?: boolean;
    isNew?: boolean;
    requiredRole?: UserRole[];
    requiredPlan?: PlanType[];
    external?: boolean;
    description?: string;
    group?: string;
}

export interface NavGroup {
    id: string;
    label: string;
    items: NavItem[];
    collapsible?: boolean;
    defaultOpen?: boolean;
}

export interface SidebarClientProps {
    tenantName: string;
    storeLogo?: string | null;
    pendingOrdersCount: number;
    userEmail: string | null | undefined;
    userAvatarUrl?: string | null;
    userFullName?: string | null;
    userRole?: UserRole;
    planType?: PlanType;
    trialDaysLeft?: number;
    lowStockCount?: number;
    totalProducts?: number;
    totalCustomers?: number;
    monthlyRevenue?: number;
    storeSlug?: string;
}
