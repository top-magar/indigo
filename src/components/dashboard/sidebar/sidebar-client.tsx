"use client";

import { useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
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
  const { state } = useSidebar();
  const { theme, setTheme } = useTheme();
  const isCollapsed = state === "collapsed";

  const navigation = useMemo(
    () => createNavigation({ pendingOrders: pendingOrdersCount, lowStock: lowStockCount }, storeSlug),
    [pendingOrdersCount, lowStockCount, storeSlug]
  );

  const isActive = useCallback(
    (href: string) => {
      if (href === "/dashboard") return pathname === "/dashboard";
      const basePath = href.split("?")[0];
      return pathname === basePath || pathname.startsWith(basePath + "/");
    },
    [pathname]
  );

  return (
    <TooltipProvider delayDuration={150}>

      <SidebarHeader className={cn("p-2", isCollapsed && "p-2")}>
        <StoreMenu
          tenantName={tenantName}
          storeLogo={storeLogo}
          planType={planType}
          trialDaysLeft={trialDaysLeft}
          storeSlug={storeSlug}
          isCollapsed={isCollapsed}
        />
      </SidebarHeader>

      <SidebarContent className={cn("px-2", isCollapsed && "px-0")} role="navigation" aria-label="Main navigation">
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

      <SidebarFooter className={cn("p-2", isCollapsed && "p-2 gap-2")}>
        {!isCollapsed && planType !== "pro" && (
          <div className="mb-2 p-2 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="p-2 rounded-md bg-muted">
                <Rocket className="size-4 text-muted-foreground" />
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
            <Button className="w-full text-xs">
              <Rocket className="size-4 mr-1.5" />
              Upgrade to Pro
            </Button>
          </div>
        )}

        {!isCollapsed && planType === "pro" && (
          <div className="mb-2 p-2 rounded-lg bg-muted/50 border border-border">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-md bg-muted">
                <CheckCircle className="size-4 text-muted-foreground" />
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
