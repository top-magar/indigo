import { createClient } from "@/infrastructure/supabase/server";
import { requireUser } from "@/lib/auth";
import {
    SidebarProvider,
    Sidebar,
    SidebarRail,
    SidebarInset,
} from "@/components/ui/sidebar";
import { SidebarClient, DashboardHeader, MobileBottomNav } from "@/components/dashboard";
import { ConfirmDialogProvider } from "@/hooks";

/**
 * Dashboard Layout - Server Component
 * 
 * Following Next.js best practices:
 * 1. Data fetching happens in this server component
 * 2. Interactive UI is delegated to client components
 * 3. Props are passed down to client components for hydration
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await requireUser();
    const supabase = await createClient();
    const tenantId = user.tenantId;

    // Get current month and today for calculations
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

    // Parallel data fetching for better performance
    const [
        { data: tenant },
        { data: userProfile },
        { count: pendingCount },
        { count: lowStockCount },
        { count: newCustomersToday },
    ] = await Promise.all([
        supabase
            .from("tenants")
            .select("*")
            .eq("id", tenantId)
            .single(),
        supabase
            .from("users")
            .select("full_name, avatar_url, role")
            .eq("id", user.id)
            .single(),
        supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .eq("status", "pending"),
        supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .eq("status", "active")
            .lte("quantity", 10),
        supabase
            .from("customers")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenantId)
            .gte("created_at", todayStart),
    ]);

    return (
        <ConfirmDialogProvider>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-background focus:border focus:rounded-md focus:shadow-sm focus:text-sm focus:font-medium">
            Skip to content
        </a>
        <SidebarProvider>
            {/* Sidebar - Server wrapper with client content */}
            <Sidebar collapsible="icon" className="border-r">
                <SidebarClient
                    tenantName={tenant?.name || "My Store"}
                    storeLogo={tenant?.logo_url}
                    pendingOrdersCount={pendingCount || 0}
                    lowStockCount={lowStockCount || 0}
                    userEmail={user.email}
                    userAvatarUrl={userProfile?.avatar_url}
                    userFullName={userProfile?.full_name}
                    userRole={userProfile?.role}
                    storeSlug={tenant?.slug}
                />
                <SidebarRail />
            </Sidebar>

            <SidebarInset>
                {/* Header - Client component for dynamic breadcrumbs */}
                <DashboardHeader 
                    storeSlug={tenant?.slug}
                    pendingOrdersCount={pendingCount || 0}
                    lowStockCount={lowStockCount || 0}
                    newCustomersCount={newCustomersToday || 0}
                />

                {/* Main Content */}
                <main className="flex-1 p-3 md:p-4" id="main-content" aria-label="Dashboard content">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
        </ConfirmDialogProvider>
    );
}
