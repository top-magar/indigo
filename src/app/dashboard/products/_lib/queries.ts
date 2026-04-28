import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { sanitizeSearch } from "@/shared/utils/sanitize";
import { productRepository } from "@/features/products/repositories";
import { categoryRepository } from "@/features/categories/repositories";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { products, productVariants, inventoryLevels, categories } from "@/db/schema/products";
import { collectionProducts, collections } from "@/db/schema/collections";
import { eq, and, asc, desc, ilike, or, gt, lte, sql, count } from "drizzle-orm";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const { user, supabase } = await getAuthenticatedClient();
  return { supabase, tenantId: user.tenantId, userId: user.id };
}

export async function getTenantCurrency(_supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string) {
  const [row] = await db.select({ currency: tenants.currency }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  return row?.currency || "USD";
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

  // Build conditions
  const conditions = [eq(products.tenantId, tenantId)];

  if (params.search) {
    const term = `%${sanitizeSearch(params.search)}%`;
    conditions.push(or(ilike(products.name, term), ilike(products.sku, term))!);
  }
  if (params.status && params.status !== "all") conditions.push(eq(products.status, params.status as "draft" | "active" | "archived"));
  if (params.category && params.category !== "all") conditions.push(eq(products.categoryId, params.category));
  if (params.stock === "out") conditions.push(eq(products.quantity, 0));
  else if (params.stock === "low") conditions.push(and(gt(products.quantity, 0), lte(products.quantity, 10))!);
  else if (params.stock === "in") conditions.push(gt(products.quantity, 10));

  const sortCol = params.sort || "created_at";
  const sortDir = params.order === "asc" ? asc : desc;
  const sortField = sortCol === "name" ? products.name
    : sortCol === "price" ? products.price
    : sortCol === "quantity" ? products.quantity
    : sortCol === "status" ? products.status
    : products.createdAt;

  const where = and(...conditions);

  const [data, [countRow]] = await Promise.all([
    db.select({
      id: products.id, tenantId: products.tenantId, name: products.name, slug: products.slug,
      description: products.description, price: products.price, compareAtPrice: products.compareAtPrice,
      costPrice: products.costPrice, sku: products.sku, barcode: products.barcode,
      quantity: products.quantity, trackQuantity: products.trackQuantity, allowBackorder: products.allowBackorder,
      weight: products.weight, weightUnit: products.weightUnit, status: products.status,
      hasVariants: products.hasVariants, vendor: products.vendor, productType: products.productType,
      images: products.images, metadata: products.metadata, categoryId: products.categoryId,
      createdAt: products.createdAt, updatedAt: products.updatedAt,
      categoryName: categories.name,
    }).from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(where)
      .orderBy(sortDir(sortField))
      .limit(perPage)
      .offset(page * perPage),
    db.select({ value: count() }).from(products).where(where),
  ]);

  // Transform to match expected shape (snake_case with categories nested)
  const transformed = data.map(p => ({
    ...p,
    tenant_id: p.tenantId,
    compare_at_price: p.compareAtPrice,
    cost_price: p.costPrice,
    track_quantity: p.trackQuantity,
    allow_backorder: p.allowBackorder,
    weight_unit: p.weightUnit,
    has_variants: p.hasVariants,
    product_type: p.productType,
    category_id: p.categoryId,
    created_at: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updated_at: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
    categories: p.categoryName ? { name: p.categoryName } : null,
  }));

  return { data: transformed, count: countRow?.value ?? 0 };
}

export async function getProductStats(tenantId: string) {
  return productRepository.getStats(tenantId);
}

export async function getCategories(tenantId: string) {
  const data = await categoryRepository.findAll(tenantId);
  return data.map(c => ({ id: c.id, name: c.name }));
}

// ─── Product Detail ──────────────────────────────────────

export async function getProductDetail(tenantId: string, _supabase: Awaited<ReturnType<typeof createClient>>, id: string) {
  const [product] = await db.select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
    .limit(1);

  if (!product) return null;

  // Fetch category
  let categoryData: { id: string; name: string; slug: string } | null = null;
  if (product.categoryId) {
    const [cat] = await db.select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories).where(eq(categories.id, product.categoryId)).limit(1);
    categoryData = cat || null;
  }

  const [variantsData, collectionLinksData] = await Promise.all([
    db.select().from(productVariants)
      .where(and(eq(productVariants.productId, id), eq(productVariants.tenantId, tenantId)))
      .orderBy(asc(productVariants.createdAt)),
    db.select({
      collectionId: collectionProducts.collectionId,
      id: collections.id, name: collections.name, slug: collections.slug,
    }).from(collectionProducts)
      .innerJoin(collections, eq(collectionProducts.collectionId, collections.id))
      .where(eq(collectionProducts.productId, id)),
  ]);

  // Fetch inventory for variants
  const variantIds = variantsData.map(v => v.id);
  let inventoryMap: Record<string, { quantity: number; location: string }[]> = {};
  if (variantIds.length > 0) {
    const invLevels = await db.select().from(inventoryLevels)
      .where(eq(inventoryLevels.tenantId, tenantId));
    for (const inv of invLevels) {
      if (variantIds.includes(inv.variantId)) {
        if (!inventoryMap[inv.variantId]) inventoryMap[inv.variantId] = [];
        inventoryMap[inv.variantId].push({ quantity: inv.quantity, location: inv.location });
      }
    }
  }

  // Transform to match expected snake_case shape
  const productOut = {
    ...product,
    tenant_id: product.tenantId,
    compare_at_price: product.compareAtPrice,
    cost_price: product.costPrice,
    track_quantity: product.trackQuantity,
    allow_backorder: product.allowBackorder,
    weight_unit: product.weightUnit,
    has_variants: product.hasVariants,
    product_type: product.productType,
    category_id: product.categoryId,
    created_at: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
    updated_at: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
    categories: categoryData,
  };

  const variantsOut = variantsData.map(v => ({
    ...v,
    tenant_id: v.tenantId,
    product_id: v.productId,
    compare_at_price: v.compareAtPrice,
    cost_price: v.costPrice,
    created_at: v.createdAt instanceof Date ? v.createdAt.toISOString() : v.createdAt,
    updated_at: v.updatedAt instanceof Date ? v.updatedAt.toISOString() : v.updatedAt,
    inventory_levels: inventoryMap[v.id] || [],
  }));

  const collectionLinksOut = collectionLinksData.map(cl => ({
    collection_id: cl.collectionId,
    collections: { id: cl.id, name: cl.name, slug: cl.slug },
  }));

  return { product: productOut, variants: variantsOut, collectionLinks: collectionLinksOut };
}

// ─── New Product ─────────────────────────────────────────

export async function getNewProductData(tenantId: string, _supabase: Awaited<ReturnType<typeof createClient>>) {
  const [categoriesData, collectionsData] = await Promise.all([
    db.select({ id: categories.id, name: categories.name, slug: categories.slug })
      .from(categories).where(eq(categories.tenantId, tenantId))
      .orderBy(asc(categories.sortOrder)).limit(500),
    db.select({ id: collections.id, name: collections.name, slug: collections.slug })
      .from(collections).where(and(eq(collections.tenantId, tenantId), eq(collections.isActive, true)))
      .orderBy(asc(collections.sortOrder)).limit(500),
  ]);
  return { categories: categoriesData, collections: collectionsData };
}
