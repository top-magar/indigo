import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import type { CategoryWithCount } from "../types";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const { user, supabase } = await getAuthenticatedClient();
  return { supabase, tenantId: user.tenantId, userId: user.id };
}

// ─── Categories ──────────────────────────────────────────

export async function getCategoriesWithCounts(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<CategoryWithCount[]> {
  const { data: categories } = await supabase
    .from("categories")
    .select("*, products:products(count)")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  return (categories || []).map(cat => ({
    ...cat,
    products_count: cat.products?.[0]?.count || 0,
    children_count: (categories || []).filter(c => c.parent_id === cat.id).length,
  }));
}
