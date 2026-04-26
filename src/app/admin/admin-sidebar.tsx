"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Shield, UserCog, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils";
import type { Permission } from "./_lib/types";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", exact: true, permission: "view_overview" as Permission },
  { href: "/admin/merchants", icon: Users, label: "Merchants", permission: "view_merchants" as Permission },
  { href: "/admin/billing", icon: CreditCard, label: "Billing", permission: "view_billing" as Permission },
  { href: "/admin/team", icon: UserCog, label: "Team", permission: "view_team" as Permission },
  { href: "/admin/settings", icon: Settings, label: "Settings", permission: "view_settings" as Permission },
];

function SidebarContent({ user, permissions, pathname, onNavigate }: {
  user: { fullName: string | null; email: string };
  permissions: Permission[];
  pathname: string;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      <div className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-foreground text-background flex items-center justify-center">
            <Shield className="size-4" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Indigo Admin</p>
            <p className="text-[10px] text-muted-foreground">Platform Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 space-y-0.5">
        {NAV.filter(item => permissions.includes(item.permission)).map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-xs rounded-md transition-colors",
                active ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn("size-4", active && "text-foreground")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t space-y-2">
        <button onClick={handleSignOut} className="flex items-center gap-2 w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/50 transition-colors">
          <LogOut className="size-3.5" /> Sign out
        </button>
        <div className="flex items-center gap-2.5 px-3">
          <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
            {(user.fullName?.[0] || user.email[0]).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{user.fullName || "Admin"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function AdminSidebar({ user, permissions }: { user: { fullName: string | null; email: string }; permissions: Permission[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 border-r flex-col shrink-0">
        <SidebarContent user={user} permissions={permissions} pathname={pathname} />
      </aside>

      {/* Mobile header + sheet */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 border-b bg-background px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm"><Menu className="size-4" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0 flex flex-col">
            <SidebarContent user={user} permissions={permissions} pathname={pathname} onNavigate={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Shield className="size-4" />
          <p className="text-sm font-semibold tracking-tight">Indigo Admin</p>
        </div>
      </div>
    </>
  );
}
