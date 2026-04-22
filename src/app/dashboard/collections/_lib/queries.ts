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
