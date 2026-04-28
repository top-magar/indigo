import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { eq } from "drizzle-orm";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const { user, supabase } = await getAuthenticatedClient();
  return { supabase, tenantId: user.tenantId, userId: user.id };
}

export async function getTenantCurrency(_supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string) {
  const [row] = await db.select({ currency: tenants.currency }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  return row?.currency || "USD";
}

// ─── Customer Detail ─────────────────────────────────────

export async function getCustomerCurrency(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { users } = await import("@/db/schema/users");
  const [user] = await db.select({ tenantId: users.tenantId }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user?.tenantId) return "USD";
  const [row] = await db.select({ currency: tenants.currency }).from(tenants).where(eq(tenants.id, user.tenantId)).limit(1);
  return row?.currency || "USD";
}

// ─── Customer Groups ─────────────────────────────────────

export async function getCustomerGroups(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  let groups: unknown[] = [];

  try {
    // TODO: migrate when schema added for customer_groups, customer_group_members
    const { data, error } = await supabase
      .from("customer_groups")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const groupIds = data.map(g => g.id);
      if (groupIds.length > 0) {
        // TODO: migrate when schema added for customer_group_members
        const { data: memberCounts } = await supabase
          .from("customer_group_members")
          .select("group_id")
          .in("group_id", groupIds);

        const countMap: Record<string, number> = {};
        memberCounts?.forEach(m => {
          countMap[m.group_id] = (countMap[m.group_id] || 0) + 1;
        });

        groups = data.map(g => ({ ...g, members_count: countMap[g.id] || 0 }));
      } else {
        groups = data;
      }
    }
  } catch { /* table may not exist */ }

  return groups;
}
