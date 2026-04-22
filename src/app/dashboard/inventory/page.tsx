import { Metadata } from "next";
import { auth, getTenantCurrency, getInventoryProducts, getInventoryStats, getRecentMovements, getCategories } from "./_lib/queries";
import { InventoryClient } from "./inventory-client";
import type { InventoryProduct, StockMovement } from "./types";

export const metadata: Metadata = {
    title: "Inventory | Dashboard",
    description: "Manage your product inventory and stock levels.",
};

const LOW_STOCK_THRESHOLD = 10;

interface SearchParams {
    stock?: string;
    category?: string;
    search?: string;
    page?: string;
    per_page?: string;
}

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const { supabase, tenantId } = await auth();

    const [currency, productsData, stats, movements, categories] = await Promise.all([
        getTenantCurrency(supabase, tenantId),
        getInventoryProducts(tenantId, params),
        getInventoryStats(tenantId),
        getRecentMovements(tenantId, 10),
        getCategories(tenantId),
    ]);

    const page = parseInt(params.page || "1") - 1;
    const perPage = parseInt(params.per_page || "25");

    const inventoryProducts: InventoryProduct[] = productsData.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        barcode: p.barcode,
        quantity: p.quantity || 0,
        track_quantity: p.trackQuantity ?? true,
        allow_backorder: p.allowBackorder ?? false,
        price: Number(p.price) || 0,
        cost_price: p.costPrice ? Number(p.costPrice) : null,
        status: p.status as "draft" | "active" | "archived",
        images: (p.images as { url: string; alt: string }[]) || [],
        category_id: p.categoryId,
        category_name: p.categoryName || null,
        reorder_point: LOW_STOCK_THRESHOLD,
        reorder_quantity: 0,
        last_restock_date: null,
        updated_at: p.updatedAt?.toISOString() || new Date().toISOString(),
    }));

    const recentMovements: StockMovement[] = movements.map((m) => ({
        id: m.id,
        product_id: m.productId,
        product_name: m.productName,
        type: m.type as StockMovement["type"],
        quantity_before: m.quantityBefore,
        quantity_change: m.quantityChange,
        quantity_after: m.quantityAfter,
        reason: m.reason,
        notes: m.notes,
        reference: m.reference,
        created_by: m.createdBy,
        created_at: m.createdAt.toISOString(),
    }));

    return (
        <InventoryClient
            products={inventoryProducts}
            categories={categories}
            stats={stats}
            recentMovements={recentMovements}
            totalCount={inventoryProducts.length}
            currentPage={page + 1}
            pageSize={perPage}
            currency={currency}
            filters={{
                stock: params.stock,
                category: params.category,
                search: params.search,
            }}
        />
    );
}
