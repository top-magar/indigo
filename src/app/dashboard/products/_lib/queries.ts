import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { productRepository } from "@/features/products/repositories";
import { categoryRepository } from "@/features/categories/repositories";

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

// ─── Products ────────────────────────────────────────────

interface ProductFilters {
  search?: string;
  status?: string;
  stock?: string;
  category?: string;
  page?: string;
  per_page?: string;
}

export async function getProducts(tenantId: string, params: ProductFilters) {
  const page = parseInt(params.page || "1") - 1;
  const perPage = parseInt(params.per_page || "20");
  const opts = { limit: perPage, offset: page * perPage };

  if (params.search) return productRepository.search(tenantId, params.search, opts);
  if (params.status && params.status !== "all") return productRepository.findByStatus(tenantId, params.status.split(","), opts);
  if (params.stock && params.stock !== "all") return productRepository.findByStockLevel(tenantId, params.stock as "low" | "out" | "in", opts);
  if (params.category && params.category !== "all") return productRepository.findByCategory(tenantId, params.category, opts);
  return productRepository.findAll(tenantId, opts);
}

export async function getProductStats(tenantId: string) {
  return productRepository.getStats(tenantId);
}

export async function getCategories(tenantId: string) {
  const data = await categoryRepository.findAll(tenantId);
  return data.map(c => ({ id: c.id, name: c.name }));
}

// ─── Product Detail ──────────────────────────────────────

export async function getProductDetail(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const { data: product } = await supabase
    .from("products")
    .select("*, categories (id, name, slug)")
    .eq("id", id)
    .eq("tenant_id", tenantId)
    .single();

  if (!product) return null;

  const [{ data: variants }, { data: collectionLinks }] = await Promise.all([
    supabase.from("product_variants")
      .select("*, inventory_levels (quantity, location)")
      .eq("product_id", id).eq("tenant_id", tenantId)
      .order("created_at", { ascending: true }),
    supabase.from("collection_products")
      .select("collection_id, collections (id, name, slug)")
      .eq("product_id", id),
  ]);

  return { product, variants: variants || [], collectionLinks: collectionLinks || [] };
}

// ─── New Product ─────────────────────────────────────────

export async function getNewProductData(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  const [{ data: categories }, { data: collections }] = await Promise.all([
    supabase.from("categories").select("id, name, slug").eq("tenant_id", tenantId).order("sort_order", { ascending: true }),
    supabase.from("collections").select("id, name, slug").eq("tenant_id", tenantId).eq("is_active", true).order("sort_order", { ascending: true }),
  ]);
  return { categories: categories || [], collections: collections || [] };
}
