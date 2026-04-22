import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
  if (!data?.tenant_id) redirect("/login");

  return { supabase, tenantId: data.tenant_id, userId: user.id };
}

export async function getTenantCurrency(supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string) {
  const { data } = await supabase.from("tenants").select("currency").eq("id", tenantId).single();
  return data?.currency || "USD";
}

// ─── Customer Detail ─────────────────────────────────────

export async function getCustomerCurrency(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase.from("users").select("tenants(currency)").eq("id", userId).single();
  return (data?.tenants as { currency?: string } | null)?.currency || "USD";
}

// ─── Customer Groups ─────────────────────────────────────

export async function getCustomerGroups(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  let groups: unknown[] = [];

  try {
    const { data, error } = await supabase
      .from("customer_groups")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const groupIds = data.map(g => g.id);
      if (groupIds.length > 0) {
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
