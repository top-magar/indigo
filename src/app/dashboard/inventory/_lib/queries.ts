import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { inventoryRepository } from "@/features/inventory/repositories";
import { categoryRepository } from "@/features/categories/repositories";
import type { StockLevel } from "@/features/inventory/repositories";

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

// ─── Inventory ───────────────────────────────────────────

interface InventoryFilters {
  stock?: string;
  category?: string;
  search?: string;
  page?: string;
  per_page?: string;
}

export async function getInventoryProducts(tenantId: string, params: InventoryFilters) {
  const page = parseInt(params.page || "1") - 1;
  const perPage = parseInt(params.per_page || "25");
  const opts = { limit: perPage, offset: page * perPage };

  let products;
  if (params.search) products = await inventoryRepository.search(tenantId, params.search, opts);
  else if (params.stock && params.stock !== "all") products = await inventoryRepository.findByStockLevel(tenantId, params.stock as StockLevel, opts);
  else products = await inventoryRepository.findAll(tenantId, opts);

  if (params.category && params.category !== "all") {
    products = products.filter(p => p.categoryId === params.category);
  }

  return products;
}

export async function getInventoryStats(tenantId: string) {
  return inventoryRepository.getStats(tenantId);
}

export async function getRecentMovements(tenantId: string, limit = 10) {
  return inventoryRepository.getRecentMovements(tenantId, limit);
}

export async function getCategories(tenantId: string) {
  const data = await categoryRepository.findAll(tenantId);
  return data.map(c => ({ id: c.id, name: c.name }));
}

// ─── Stock History ───────────────────────────────────────

export async function getProductWithMovements(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>, productId: string) {
  const { data: product } = await supabase
    .from("products")
    .select("id, name, sku, quantity, images")
    .eq("id", productId)
    .eq("tenant_id", tenantId)
    .single();

  if (!product) return null;

  const { data: movements } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("product_id", productId)
    .eq("tenant_id", tenantId)
    .order("created_at", { ascending: false })
    .limit(100);

  return { product, movements: movements || [] };
}
