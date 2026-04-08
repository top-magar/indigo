"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Rocket, CheckCircle } from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/shared/utils";
import { StoreMenu } from "./store-menu";
import { UserMenu } from "./user-menu";
import { NavItemComponent } from "./nav-item";
import { createNavigation } from "./navigation";
import { CommandPalette } from "../command-palette";
import type { SidebarClientProps } from "./types";

export function SidebarClient({
  tenantName,
  storeLogo,
  pendingOrdersCount,
  lowStockCount = 0,
  userEmail,
  userAvatarUrl,
  userFullName,
  userRole = "owner",
  planType = "trial",
  trialDaysLeft = 7,
  storeSlug,
}: SidebarClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { state } = useSidebar();
  const { theme, setTheme } = useTheme();
  const isCollapsed = state === "collapsed";
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

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

      <SidebarHeader className={cn("p-3", isCollapsed && "p-2")}>
        <StoreMenu
          tenantName={tenantName}
          storeLogo={storeLogo}
          planType={planType}
          trialDaysLeft={trialDaysLeft}
          pendingOrdersCount={pendingOrdersCount}
          storeSlug={storeSlug}
          isCollapsed={isCollapsed}
        />
      </SidebarHeader>

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
                    userRole={userRole}
                    planType={planType}
                    pathname={pathname}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className={cn("p-3", isCollapsed && "p-2 gap-2")}>
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

        <UserMenu
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
