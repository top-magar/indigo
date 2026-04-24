import { Metadata } from "next";
import { auth, getTenantCurrency, getProducts, getProductStats, getCategories } from "./_lib/queries";
import { ProductsClient } from "./products-client";

export const metadata: Metadata = {
    title: "Products | Dashboard",
    description: "Manage your product catalog and inventory.",
};

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
    const { supabase, tenantId } = await auth();
    const currency = await getTenantCurrency(supabase, tenantId);

    const { data: tenantData } = await supabase.from("tenants").select("slug").eq("id", tenantId).single();
    const storeSlug = tenantData?.slug || "";

    const [{ data: productsData, count: totalCount }, stats, categories] = await Promise.all([
        getProducts(tenantId, supabase, params),
        getProductStats(tenantId),
        getCategories(tenantId),
    ]);

    const page = parseInt(params.page || "1") - 1;
    const perPage = parseInt(params.per_page || "20");

    const products: ProductRow[] = (productsData || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        name: p.name as string,
        slug: p.slug as string,
        description: p.description as string | null,
        price: parseFloat(String(p.price || "0")),
        compare_at_price: p.compare_at_price ? parseFloat(String(p.compare_at_price)) : null,
        cost_price: p.cost_price ? parseFloat(String(p.cost_price)) : null,
        sku: p.sku as string | null,
        barcode: p.barcode as string | null,
        quantity: (p.quantity as number) || 0,
        track_quantity: (p.track_quantity as boolean) ?? true,
        status: p.status as "draft" | "active" | "archived",
        images: (typeof p.images === "string" ? JSON.parse(p.images) : p.images as { url: string; alt: string }[]) || [],
        category_id: p.category_id as string | null,
        category_name: (p.categories as { name: string } | null)?.name || null,
        created_at: p.created_at as string,
        updated_at: p.updated_at as string,
    }));

    return (
        <ProductsClient
            products={products}
            categories={categories}
            stats={stats}
            totalCount={totalCount}
            currentPage={page + 1}
            pageSize={perPage}
            currency={currency}
            storeSlug={storeSlug}
            filters={{
                status: params.status,
                stock: params.stock,
                category: params.category,
                search: params.search,
            }}
        />
    );
}
