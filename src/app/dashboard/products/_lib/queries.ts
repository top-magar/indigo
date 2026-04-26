import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { sanitizeSearch } from "@/shared/utils/sanitize";
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
  pageSize?: string;
  sort?: string;
  order?: string;
}

export async function getProducts(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>, params: ProductFilters) {
  const page = parseInt(params.page || "1") - 1;
  const perPage = parseInt(params.pageSize || params.per_page || "20");

  let query = supabase
    .from("products")
    .select("*, categories(name)", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order(params.sort || "created_at", { ascending: params.order === "asc" })
    .range(page * perPage, (page + 1) * perPage - 1);

  if (params.search) query = query.or(`name.ilike.%${sanitizeSearch(params.search)}%,sku.ilike.%${sanitizeSearch(params.search)}%`);
  if (params.status && params.status !== "all") query = query.eq("status", params.status);
  if (params.category && params.category !== "all") query = query.eq("category_id", params.category);
  if (params.stock === "out") query = query.eq("quantity", 0);
  else if (params.stock === "low") query = query.gt("quantity", 0).lte("quantity", 10);
  else if (params.stock === "in") query = query.gt("quantity", 10);

  const { data, count } = await query;
  return { data: data || [], count: count ?? 0 };
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
