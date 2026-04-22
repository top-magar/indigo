import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import type { CategoryWithCount } from "../types";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
  if (!data?.tenant_id) redirect("/login");

  return { supabase, tenantId: data.tenant_id, userId: user.id };
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
