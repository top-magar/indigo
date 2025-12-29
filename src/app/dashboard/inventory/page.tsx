import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    const tenantId = userData.tenant_id;

    // Get tenant currency
    const { data: tenant } = await supabase
        .from("tenants")
        .select("currency")
        .eq("id", tenantId)
        .single();

    const currency = tenant?.currency || "USD";

    // Get categories for filter
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .eq("tenant_id", tenantId)
        .order("name");

    // Parse pagination params
    const page = parseInt(params.page || "1") - 1;
    const perPage = parseInt(params.per_page || "25");

    // Build query for products
    let query = supabase
        .from("products")
        .select(`
            id, name, slug, sku, barcode, quantity, track_quantity, allow_backorder,
            price, cost_price, status, images, category_id, updated_at,
            categories!products_category_id_fkey(name),
            metadata
        `, { count: "exact" })
        .eq("tenant_id", tenantId)
        .eq("status", "active"); // Only show active products in inventory

    // Apply stock filter
    if (params.stock) {
        if (params.stock === "low") {
            query = query.lte("quantity", LOW_STOCK_THRESHOLD).gt("quantity", 0);
        } else if (params.stock === "out") {
            query = query.eq("quantity", 0);
        } else if (params.stock === "healthy") {
            query = query.gt("quantity", LOW_STOCK_THRESHOLD);
        }
    }

    // Apply category filter
    if (params.category && params.category !== "all") {
        query = query.eq("category_id", params.category);
    }

    // Apply search
    if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%,barcode.ilike.%${params.search}%`);
    }

    // Apply pagination
    query = query
        .order("quantity", { ascending: true }) // Show low stock first
        .range(page * perPage, (page + 1) * perPage - 1);

    const { data: products, count } = await query;

    // Transform products with category name and reorder settings
    const inventoryProducts: InventoryProduct[] = (products || []).map((p: any) => {
        const metadata = p.metadata as Record<string, any> || {};
        const inventorySettings = metadata.inventory || {};
        
        return {
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            barcode: p.barcode,
            quantity: p.quantity,
            track_quantity: p.track_quantity,
            allow_backorder: p.allow_backorder,
            price: p.price,
            cost_price: p.cost_price,
            status: p.status,
            images: p.images || [],
            category_id: p.category_id,
            category_name: p.categories?.name || null,
            reorder_point: inventorySettings.reorderPoint || LOW_STOCK_THRESHOLD,
            reorder_quantity: inventorySettings.reorderQuantity || 0,
            last_restock_date: inventorySettings.lastRestockDate || null,
            updated_at: p.updated_at,
        };
    });

    // Calculate stats (unfiltered for overview)
    const { data: allProducts } = await supabase
        .from("products")
        .select("quantity, price, cost_price, metadata")
        .eq("tenant_id", tenantId)
        .eq("status", "active");

    const stats = {
        totalProducts: allProducts?.length || 0,
        totalUnits: allProducts?.reduce((sum, p) => sum + p.quantity, 0) || 0,
        totalValue: allProducts?.reduce((sum, p) => sum + (p.quantity * p.price), 0) || 0,
        costValue: allProducts?.reduce((sum, p) => sum + (p.quantity * (p.cost_price || p.price)), 0) || 0,
        lowStockCount: allProducts?.filter(p => {
            const reorderPoint = (p.metadata as any)?.inventory?.reorderPoint || LOW_STOCK_THRESHOLD;
            return p.quantity > 0 && p.quantity <= reorderPoint;
        }).length || 0,
        outOfStockCount: allProducts?.filter(p => p.quantity === 0).length || 0,
        healthyStockCount: allProducts?.filter(p => {
            const reorderPoint = (p.metadata as any)?.inventory?.reorderPoint || LOW_STOCK_THRESHOLD;
            return p.quantity > reorderPoint;
        }).length || 0,
    };

    // Get recent stock movements
    const { data: movements } = await supabase
        .from("stock_movements")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(10);

    const recentMovements: StockMovement[] = (movements || []).map((m: any) => ({
        id: m.id,
        product_id: m.product_id,
        product_name: m.product_name,
        type: m.type,
        quantity_before: m.quantity_before,
        quantity_change: m.quantity_change,
        quantity_after: m.quantity_after,
        reason: m.reason,
        notes: m.notes,
        reference: m.reference,
        created_by: m.created_by,
        created_at: m.created_at,
    }));

    return (
        <InventoryClient
            products={inventoryProducts}
            categories={categories || []}
            stats={stats}
            recentMovements={recentMovements}
            totalCount={count || 0}
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