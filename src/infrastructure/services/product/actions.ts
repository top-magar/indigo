"use server";

/**
 * Product Service - Handles all product and inventory operations
 */

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Types
export interface CreateProductInput {
    name: string;
    price: string;
    description?: string;
    sku?: string;
    initialStock?: number;
}

export interface UpdateStockInput {
    productId: string;
    adjustment: number;
    action: 'add' | 'remove' | 'set';
}

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

/**
 * Create a new product
 */
export async function createProduct(input: CreateProductInput) {
    const { name, price, description, sku, initialStock = 0 } = input;

    if (!name || !price) {
        throw new Error("Name and price are required");
    }

    const { supabase, tenantId } = await getAuthenticatedTenant();

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const { data: product, error } = await supabase
        .from("products")
        .insert({
            tenant_id: tenantId,
            name,
            slug,
            price: parseFloat(price),
            description: description || null,
            sku: sku || null,
            quantity: initialStock,
            status: "active",
        })
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create product: ${error.message}`);
    }

    revalidatePath("/dashboard/products");
    return { product };
}


/**
 * Update stock for a product
 */
export async function updateStock(input: UpdateStockInput) {
    const { productId, adjustment, action } = input;

    if (!productId || isNaN(adjustment)) {
        throw new Error("Invalid input");
    }

    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data: current, error: fetchError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", productId)
        .eq("tenant_id", tenantId)
        .single();

    if (fetchError || !current) {
        throw new Error("Product not found");
    }

    let newQuantity: number;
    switch (action) {
        case 'add':
            newQuantity = current.quantity + adjustment;
            break;
        case 'remove':
            newQuantity = Math.max(0, current.quantity - adjustment);
            break;
        case 'set':
            newQuantity = Math.max(0, adjustment);
            break;
        default:
            newQuantity = current.quantity;
    }

    const { error: updateError } = await supabase
        .from("products")
        .update({
            quantity: newQuantity,
            updated_at: new Date().toISOString(),
        })
        .eq("id", productId)
        .eq("tenant_id", tenantId);

    if (updateError) {
        throw new Error(`Failed to update stock: ${updateError.message}`);
    }

    revalidatePath("/dashboard/products");
}

/**
 * Delete a product
 */
export async function deleteProduct(productId: string) {
    if (!productId) {
        throw new Error("Product ID is required");
    }

    const { supabase, tenantId } = await getAuthenticatedTenant();

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

/**
 * Form action wrapper for creating products
 */
export async function createProductAction(formData: FormData) {
    const name = formData.get("name") as string;
    const price = formData.get("price") as string;
    const description = formData.get("description") as string;
    const sku = formData.get("sku") as string;
    const initialStock = parseInt(formData.get("stock") as string) || 0;

    await createProduct({ name, price, description, sku, initialStock });
}

/**
 * Form action wrapper for updating stock
 */
export async function updateStockAction(formData: FormData) {
    const productId = formData.get("productId") as string;
    const adjustment = parseInt(formData.get("adjustment") as string);
    const action = formData.get("action") as 'add' | 'remove';

    await updateStock({ productId, adjustment, action });
}

/**
 * Form action wrapper for deleting products
 */
export async function deleteProductAction(formData: FormData) {
    const productId = formData.get("productId") as string;
    await deleteProduct(productId);
}
