"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ImportProduct {
    name: string;
    sku?: string;
    price: string;
    compareAtPrice?: string;
    quantity: number;
    status: "draft" | "active" | "archived";
    category?: string;
    description?: string;
    images: string[];
}

export interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 100);
}

export async function importProducts(products: ImportProduct[]): Promise<ImportResult> {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: 0, failed: products.length, errors: ["Not authenticated"] };
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        return { success: 0, failed: products.length, errors: ["No tenant found"] };
    }

    const tenantId = userData.tenant_id;

    // Get existing categories for mapping
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name")
        .eq("tenant_id", tenantId);

    const categoryMap = new Map(
        (categories || []).map(c => [c.name.toLowerCase(), c.id])
    );

    // Get existing slugs to avoid duplicates
    const { data: existingProducts } = await supabase
        .from("products")
        .select("slug")
        .eq("tenant_id", tenantId);

    const existingSlugs = new Set((existingProducts || []).map(p => p.slug));

    const result: ImportResult = {
        success: 0,
        failed: 0,
        errors: [],
    };

    // Process products in batches
    const batchSize = 50;
    for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        const productsToInsert = [];

        for (const product of batch) {
            try {
                // Generate unique slug
                let slug = generateSlug(product.name);
                let slugSuffix = 1;
                while (existingSlugs.has(slug)) {
                    slug = `${generateSlug(product.name)}-${slugSuffix}`;
                    slugSuffix++;
                }
                existingSlugs.add(slug);

                // Map category name to ID
                let categoryId = null;
                if (product.category) {
                    categoryId = categoryMap.get(product.category.toLowerCase()) || null;
                }

                // Format images
                const images = product.images
                    .filter(url => url && url.startsWith("http"))
                    .map(url => ({ url, alt: product.name }));

                productsToInsert.push({
                    tenant_id: tenantId,
                    name: product.name,
                    slug,
                    sku: product.sku || null,
                    price: parseFloat(product.price),
                    compare_at_price: product.compareAtPrice ? parseFloat(product.compareAtPrice) : null,
                    quantity: product.quantity || 0,
                    track_quantity: true,
                    status: product.status || "draft",
                    category_id: categoryId,
                    description: product.description || null,
                    images,
                });
            } catch (error) {
                result.failed++;
                result.errors.push(`Failed to process "${product.name}": ${error instanceof Error ? error.message : "Unknown error"}`);
            }
        }

        if (productsToInsert.length > 0) {
            const { data, error } = await supabase
                .from("products")
                .insert(productsToInsert)
                .select("id");

            if (error) {
                result.failed += productsToInsert.length;
                result.errors.push(`Batch insert failed: ${error.message}`);
            } else {
                result.success += data?.length || 0;
            }
        }
    }

    revalidatePath("/dashboard/products");
    return result;
}
