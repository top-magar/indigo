import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const { user, supabase } = await getAuthenticatedClient();
  return { supabase, tenantId: user.tenantId, userId: user.id };
}

// ─── Collections ─────────────────────────────────────────

export async function getCollections(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: collections } = await supabase
    .from("collections")
    .select("*, collection_products(count)")
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true });

  return (collections || []).map(c => ({
    ...c,
    products_count: c.collection_products?.[0]?.count || 0,
  }));
}
