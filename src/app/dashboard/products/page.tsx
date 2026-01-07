import { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { productRepository } from "@/features/products/repositories";
import { categoryRepository } from "@/features/categories/repositories";
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
    
    // Authentication check
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

    // Get categories for filter using repository
    const categoriesData = await categoryRepository.findAll(tenantId);
    const categories = categoriesData.map(c => ({ id: c.id, name: c.name }));

    // Parse pagination params
    const page = parseInt(params.page || "1") - 1;
    const perPage = parseInt(params.per_page || "20");

    // Fetch products using repository based on filters
    let productsData;
    
    if (params.search) {
        // Use search method for text search
        productsData = await productRepository.search(tenantId, params.search, {
            limit: perPage,
            offset: page * perPage,
        });
    } else if (params.status && params.status !== "all") {
        // Use findByStatus for status filtering
        const statuses = params.status.split(",");
        productsData = await productRepository.findByStatus(tenantId, statuses, {
            limit: perPage,
            offset: page * perPage,
        });
    } else if (params.stock && params.stock !== "all") {
        // Use findByStockLevel for stock filtering
        productsData = await productRepository.findByStockLevel(
            tenantId,
            params.stock as "low" | "out" | "in",
            { limit: perPage, offset: page * perPage }
        );
    } else if (params.category && params.category !== "all") {
        // Use findByCategory for category filtering
        productsData = await productRepository.findByCategory(tenantId, params.category, {
            limit: perPage,
            offset: page * perPage,
        });
    } else {
        // Use findAll for default listing
        productsData = await productRepository.findAll(tenantId, {
            limit: perPage,
            offset: page * perPage,
        });
    }

    // Transform products to match client expected format (snake_case)
    const productsWithCategory: ProductRow[] = (productsData || []).map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: parseFloat(p.price || "0"),
        compare_at_price: p.compareAtPrice ? parseFloat(p.compareAtPrice) : null,
        cost_price: p.costPrice ? parseFloat(p.costPrice) : null,
        sku: p.sku,
        barcode: p.barcode,
        quantity: p.quantity || 0,
        track_quantity: p.trackQuantity ?? true,
        status: p.status as "draft" | "active" | "archived",
        images: (p.images as { url: string; alt: string }[]) || [],
        category_id: p.categoryId,
        category_name: p.categoryName || null,
        created_at: p.createdAt.toISOString(),
        updated_at: p.updatedAt.toISOString(),
    }));

    // Get stats using repository
    const stats = await productRepository.getStats(tenantId);

    return (
        <ProductsClient
            products={productsWithCategory}
            categories={categories}
            stats={stats}
            totalCount={stats.total}
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
