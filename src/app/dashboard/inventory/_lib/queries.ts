import { getAuthenticatedClient } from "@/lib/auth";
import { inventoryRepository } from "@/features/inventory/repositories";
import { categoryRepository } from "@/features/categories/repositories";
import type { StockLevel } from "@/features/inventory/repositories";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { products } from "@/db/schema/products";
import { stockMovements } from "@/db/schema/inventory";
import { eq, and, desc } from "drizzle-orm";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const { user } = await getAuthenticatedClient();
  return { tenantId: user.tenantId, userId: user.id };
}

export async function getTenantCurrency(tenantId: string) {
  const [result] = await db
    .select({ currency: tenants.currency })
    .from(tenants)
    .where(eq(tenants.id, tenantId))
    .limit(1);
  return result?.currency || "USD";
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

export async function getProductWithMovements(tenantId: string, productId: string) {
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      sku: products.sku,
      quantity: products.quantity,
      images: products.images,
    })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.tenantId, tenantId)))
    .limit(1);

  if (!product) return null;

  const movements = await db
    .select()
    .from(stockMovements)
    .where(and(eq(stockMovements.productId, productId), eq(stockMovements.tenantId, tenantId)))
    .orderBy(desc(stockMovements.createdAt))
    .limit(100);

  return { product, movements };
}
