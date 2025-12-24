import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductsClient } from "./products-client";

export const metadata: Metadata = {
    title: "Products | Indigo Dashboard",
    description: "Manage your product catalog and inventory.",
};

// Types
interface ProductRow {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    compare_at_price: number | null;
    cost_price: number | null;
    sku: string | null;
    barcode: string | null;
    quantity: number;
    track_quantity: boolean;
    status: "draft" | "active" | "archived";
    images: { url: string; alt: string }[];
    category_id: string | null;
    category_name: string | null;
    created_at: string;
    updated_at: string;
}

interface SearchParams {
    status?: string;
    stock?: string;
    category?: string;
    search?: string;
    page?: string;
    per_page?: string;
    sort?: string;
    order?: string;
}

export default async function ProductsPage({
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
    const perPage = parseInt(params.per_page || "20");
    const sortBy = params.sort || "created_at";
    const sortOrder = params.order === "asc" ? true : false;

    // Build query
    let query = supabase
        .from("products")
        .select(`
            id, name, slug, description, price, compare_at_price, cost_price,
            sku, barcode, quantity, track_quantity, status, images,
            category_id, created_at, updated_at,
            categories!products_category_id_fkey(name)
        `, { count: "exact" })
        .eq("tenant_id", tenantId);

    // Apply filters
    if (params.status && params.status !== "all") {
        const statuses = params.status.split(",");
        query = query.in("status", statuses);
    }

    if (params.stock) {
        if (params.stock === "low") {
            query = query.lte("quantity", 10).gt("quantity", 0);
        } else if (params.stock === "out") {
            query = query.eq("quantity", 0);
        } else if (params.stock === "in") {
            query = query.gt("quantity", 10);
        }
    }

    if (params.category && params.category !== "all") {
        query = query.eq("category_id", params.category);
    }

    if (params.search) {
        query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%,description.ilike.%${params.search}%`);
    }

    // Apply sorting and pagination
    query = query
        .order(sortBy, { ascending: sortOrder })
        .range(page * perPage, (page + 1) * perPage - 1);

    const { data: products, count } = await query;

    // Transform products with category name
    const productsWithCategory: ProductRow[] = (products || []).map((p: any) => ({
        ...p,
        category_name: p.categories?.name || null,
    }));

    // Calculate stats (unfiltered for overview)
    const { data: allProducts } = await supabase
        .from("products")
        .select("status, quantity, price")
        .eq("tenant_id", tenantId);

    const LOW_STOCK_THRESHOLD = 10;
    const stats = {
        total: allProducts?.length || 0,
        active: allProducts?.filter(p => p.status === "active").length || 0,
        draft: allProducts?.filter(p => p.status === "draft").length || 0,
        archived: allProducts?.filter(p => p.status === "archived").length || 0,
        lowStock: allProducts?.filter(p => p.quantity <= LOW_STOCK_THRESHOLD && p.quantity > 0).length || 0,
        outOfStock: allProducts?.filter(p => p.quantity === 0).length || 0,
        totalValue: allProducts?.reduce((sum, p) => sum + (p.quantity * (p.price || 0)), 0) || 0,
    };

    return (
        <ProductsClient
            products={productsWithCategory}
            categories={categories || []}
            stats={stats}
            totalCount={count || 0}
            currentPage={page}
            pageSize={perPage}
            currency={currency}
            filters={{
                status: params.status,
                stock: params.stock,
                category: params.category,
                search: params.search,
            }}
        />
    );
}
