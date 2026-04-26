"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Users, CreditCard, Settings, LogOut, Shield } from "lucide-react";
import { createClient } from "@/infrastructure/supabase/client";
import { cn } from "@/shared/utils";

const NAV = [
  { href: "/admin", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/admin/merchants", icon: Users, label: "Merchants" },
  { href: "/admin/billing", icon: CreditCard, label: "Billing" },
  { href: "/admin/settings", icon: Settings, label: "Settings" },
];

export function AdminSidebar({ user }: { user: { fullName: string | null; email: string } }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="w-56 border-r flex flex-col shrink-0">
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
        {NAV.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-md transition-colors",
                active
                  ? "bg-muted font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
          <div className="size-7 rounded-full bg-gradient-to-br from-violet-200 to-violet-300 flex items-center justify-center text-[10px] font-semibold text-violet-700">
            {(user.fullName?.[0] || user.email[0]).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate">{user.fullName || "Admin"}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
