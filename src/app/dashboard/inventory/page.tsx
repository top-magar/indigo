import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { inventoryRepository } from "@/features/inventory/repositories";
import { categoryRepository } from "@/features/categories/repositories";
import type { StockLevel } from "@/features/inventory/repositories";
import { InventoryClient } from "./inventory-client";
import type { InventoryProduct, StockMovement } from "./actions";

export const metadata: Metadata = {
    title: "Inventory | Dashboard",
    description: "Manage your product inventory and stock levels.",
};

interface SearchParams {
    stock?: string;
    category?: string;
    search?: string;
    page?: string;
    per_page?: string;
}

const LOW_STOCK_THRESHOLD = 10;

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const params = await searchParams;
    const supabase = await createClient();
    
    // Authentication check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/login");

    const tenantId = userData.tenant_id;

    // Get tenant currency
    const { data: tenant } = await supabase
        .from("tenants")
        .select("currency")
        .eq("id", tenantId)
        .single();

    const currency = tenant?.currency || "USD";

    // Get categories for filter using repository
    const categoriesData = await categoryRepository.findAll(tenantId);

    // Parse pagination params
    const page = parseInt(params.page || "1") - 1;
    const perPage = parseInt(params.per_page || "25");

    // Fetch products using repository methods based on filters
    let productsData;
    
    if (params.search) {
        // Use search method when search query is provided
        productsData = await inventoryRepository.search(tenantId, params.search, {
            limit: perPage,
            offset: page * perPage,
        });
    } else if (params.stock && params.stock !== "all") {
        // Use findByStockLevel when stock filter is applied
        productsData = await inventoryRepository.findByStockLevel(
            tenantId, 
            params.stock as StockLevel, 
            {
                limit: perPage,
                offset: page * perPage,
            }
        );
    } else {
        // Use findAll for default view
        productsData = await inventoryRepository.findAll(tenantId, {
            limit: perPage,
            offset: page * perPage,
        });
    }

    // Apply category filter if needed (post-filter since repository doesn't combine filters)
    let filteredProducts = productsData;
    if (params.category && params.category !== "all") {
        filteredProducts = productsData.filter(p => p.categoryId === params.category);
    }

    // Transform products to match InventoryProduct interface
    const inventoryProducts: InventoryProduct[] = filteredProducts.map((p) => ({
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

    // Get stats using repository
    const stats = await inventoryRepository.getStats(tenantId);

    // Get recent stock movements using repository
    const movements = await inventoryRepository.getRecentMovements(tenantId, 10);

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

    // Transform categories for the filter dropdown
    const categories = categoriesData.map(c => ({
        id: c.id,
        name: c.name,
    }));

    return (
        <InventoryClient
            products={inventoryProducts}
            categories={categories}
            stats={stats}
            recentMovements={recentMovements}
            totalCount={inventoryProducts.length}
            currentPage={page}
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