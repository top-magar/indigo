"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAuthenticatedTenant() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { supabase, tenantId: userData.tenant_id };
}

export async function createProduct(formData: FormData) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string) || 0;
    const description = formData.get("description") as string | null;
    const quantity = parseInt(formData.get("quantity") as string) || 0;
    const sku = formData.get("sku") as string | null;

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { error } = await supabase.from("products").insert({
        tenant_id: tenantId,
        name,
        slug,
        price,
        description: description || null,
        quantity,
        sku: sku || null,
        status: "active",
    });

    if (error) {
        throw new Error(`Failed to create product: ${error.message}`);
    }

    revalidatePath("/dashboard/products");
}

// Production-ready product creation with full details
export async function createProductWithDetails(formData: FormData): Promise<{ success?: boolean; error?: string; productId?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // Parse form data
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        const description = formData.get("description") as string;
        const categoryId = formData.get("categoryId") as string;
        const collectionIdsJson = formData.get("collectionIds") as string;
        const collectionIds = collectionIdsJson ? JSON.parse(collectionIdsJson) : [];
        const brand = formData.get("brand") as string;
        const tagsJson = formData.get("tags") as string;
        const tags = tagsJson ? JSON.parse(tagsJson) : [];
        
        // Pricing
        const price = parseFloat(formData.get("price") as string) || 0;
        const compareAtPrice = parseFloat(formData.get("compareAtPrice") as string) || null;
        const costPrice = parseFloat(formData.get("costPrice") as string) || null;
        
        // Inventory
        const sku = formData.get("sku") as string;
        const barcode = formData.get("barcode") as string;
        const quantity = parseInt(formData.get("quantity") as string) || 0;
        const trackQuantity = formData.get("trackQuantity") === "true";
        const allowBackorder = formData.get("allowBackorder") === "true";
        
        // Shipping
        const weight = parseFloat(formData.get("weight") as string) || null;
        const weightUnit = formData.get("weightUnit") as string || "g";
        const requiresShipping = formData.get("requiresShipping") === "true";
        
        // Media
        const imagesJson = formData.get("images") as string;
        const images = imagesJson ? JSON.parse(imagesJson) : [];
        
        // Variants
        const hasVariants = formData.get("hasVariants") === "true";
        const variantsJson = formData.get("variants") as string;
        const variants = variantsJson ? JSON.parse(variantsJson) : [];
        
        // SEO
        const metaTitle = formData.get("metaTitle") as string;
        const metaDescription = formData.get("metaDescription") as string;
        
        // Status
        const status = formData.get("status") as "draft" | "active" | "archived";
        const publishAt = formData.get("publishAt") as string;

        // Validate required fields
        if (!name || name.trim().length === 0) {
            return { error: "Product name is required" };
        }

        if (price < 0) {
            return { error: "Price must be a positive number" };
        }

        // Check for duplicate slug
        const { data: existingProduct } = await supabase
            .from("products")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("slug", slug)
            .single();

        let finalSlug = slug;
        if (existingProduct) {
            // Append timestamp to make slug unique
            finalSlug = `${slug}-${Date.now()}`;
        }

        // Build metadata object
        const metadata: Record<string, unknown> = {
            brand: brand || null,
            tags: tags,
            seo: {
                metaTitle: metaTitle || null,
                metaDescription: metaDescription || null,
            },
            shipping: {
                requiresShipping,
                weightUnit,
                dimensions: {
                    length: parseFloat(formData.get("length") as string) || null,
                    width: parseFloat(formData.get("width") as string) || null,
                    height: parseFloat(formData.get("height") as string) || null,
                },
            },
            variants: hasVariants ? variants : null,
            publishAt: publishAt || null,
        };

        // Insert product
        const { data: product, error } = await supabase
            .from("products")
            .insert({
                tenant_id: tenantId,
                name,
                slug: finalSlug,
                description: description || null,
                category_id: categoryId || null,
                price,
                compare_at_price: compareAtPrice,
                cost_price: costPrice,
                sku: sku || null,
                barcode: barcode || null,
                quantity,
                track_quantity: trackQuantity,
                allow_backorder: allowBackorder,
                weight,
                weight_unit: weightUnit,
                status,
                images: images.map((img: { url: string; alt: string; position: number }) => ({
                    url: img.url,
                    alt: img.alt || "",
                    position: img.position,
                })),
                metadata,
            })
            .select("id")
            .single();

        if (error) {
            console.error("Product creation error:", error);
            return { error: `Failed to create product: ${error.message}` };
        }

        // Add product to collections
        if (collectionIds.length > 0 && product?.id) {
            for (let i = 0; i < collectionIds.length; i++) {
                await supabase
                    .from("collection_products")
                    .insert({
                        collection_id: collectionIds[i],
                        product_id: product.id,
                        position: i,
                    });
            }
        }

        revalidatePath("/dashboard/products");
        revalidatePath("/dashboard/collections");
        return { success: true, productId: product.id };
    } catch (err) {
        console.error("Product creation error:", err);
        return { error: err instanceof Error ? err.message : "Failed to create product" };
    }
}

export async function updateProductStock(formData: FormData) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const productId = formData.get("productId") as string;
    const action = formData.get("action") as "add" | "remove" | "set";
    const adjustment = parseInt(formData.get("adjustment") as string) || 1;

    // Get current product
    const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", productId)
        .eq("tenant_id", tenantId)
        .single();

    if (fetchError || !product) {
        throw new Error("Product not found");
    }

    let newQuantity: number;
    if (action === "set") {
        newQuantity = adjustment;
    } else if (action === "add") {
        newQuantity = product.quantity + adjustment;
    } else {
        newQuantity = Math.max(0, product.quantity - adjustment);
    }

    const { error: updateError } = await supabase
        .from("products")
        .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
        .eq("id", productId)
        .eq("tenant_id", tenantId);

    if (updateError) {
        throw new Error(`Failed to update stock: ${updateError.message}`);
    }

    revalidatePath("/dashboard/products");
}

export async function deleteProduct(formData: FormData) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const productId = formData.get("productId") as string;

    const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)
        .eq("tenant_id", tenantId);

    if (error) {
        throw new Error(`Failed to delete product: ${error.message}`);
    }

    revalidatePath("/dashboard/products");
}

export async function updateProductStatus(productId: string, status: "draft" | "active" | "archived") {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
        .from("products")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", productId)
        .eq("tenant_id", tenantId);

    if (error) {
        throw new Error(`Failed to update product status: ${error.message}`);
    }

    revalidatePath("/dashboard/products");
}

export async function bulkDeleteProducts(productIds: string[]) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
        .from("products")
        .delete()
        .in("id", productIds)
        .eq("tenant_id", tenantId);

    if (error) {
        throw new Error(`Failed to delete products: ${error.message}`);
    }

    revalidatePath("/dashboard/products");
}

export async function bulkUpdateProductStatus(productIds: string[], status: "draft" | "active" | "archived") {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { error } = await supabase
        .from("products")
        .update({ status, updated_at: new Date().toISOString() })
        .in("id", productIds)
        .eq("tenant_id", tenantId);

    if (error) {
        throw new Error(`Failed to update products: ${error.message}`);
    }

    revalidatePath("/dashboard/products");
}
