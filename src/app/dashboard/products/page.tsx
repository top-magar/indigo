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

    const [productsData, stats, categories] = await Promise.all([
        getProducts(tenantId, params),
        getProductStats(tenantId),
        getCategories(tenantId),
    ]);

    const page = parseInt(params.page || "1") - 1;
    const perPage = parseInt(params.per_page || "20");

    const products: ProductRow[] = (productsData || []).map(p => ({
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

    return (
        <ProductsClient
            products={products}
            categories={categories}
            stats={stats}
            totalCount={stats.total}
            currentPage={page + 1}
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
