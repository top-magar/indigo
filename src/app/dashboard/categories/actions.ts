"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { expireCategoriesCache } from "@/features/store/data";
import type { Category } from "@/infrastructure/supabase/types";

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
 * Immediately expire both dashboard and storefront category caches
 * Uses updateTag for read-your-own-writes consistency
 */
async function expireCategoryCaches(tenantId: string) {
    // Dashboard paths
    revalidatePath("/dashboard/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/new");
    
    // Storefront cache - immediate expiration
    await expireCategoriesCache(tenantId);
}

export interface CategoryWithCount extends Category {
    products_count: number;
    children_count: number;
}

export async function getCategories(): Promise<{ categories: CategoryWithCount[]; error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // Get categories with product counts
        const { data: categories, error } = await supabase
            .from("categories")
            .select(`
                *,
                products:products(count)
            `)
            .eq("tenant_id", tenantId)
            .order("sort_order", { ascending: true });

        if (error) {
            return { categories: [], error: error.message };
        }

        // Calculate children count for each category
        const categoriesWithCounts: CategoryWithCount[] = (categories || []).map(cat => {
            const childrenCount = (categories || []).filter(c => c.parent_id === cat.id).length;
            return {
                ...cat,
                products_count: cat.products?.[0]?.count || 0,
                children_count: childrenCount,
            };
        });

        return { categories: categoriesWithCounts };
    } catch (err) {
        console.error("Get categories error:", err);
        return { categories: [], error: err instanceof Error ? err.message : "Failed to fetch categories" };
    }
}

export async function createCategory(formData: FormData): Promise<{ error?: string; category?: Category }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const parentId = formData.get("parentId") as string;

        if (!name?.trim()) {
            return { error: "Category name is required" };
        }

        // Check for duplicate slug
        const { data: existing } = await supabase
            .from("categories")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("slug", slug)
            .single();

        let finalSlug = slug;
        if (existing) {
            finalSlug = `${slug}-${Date.now()}`;
        }

        // Get max sort order
        const { data: maxOrder } = await supabase
            .from("categories")
            .select("sort_order")
            .eq("tenant_id", tenantId)
            .order("sort_order", { ascending: false })
            .limit(1)
            .single();

        const sortOrder = (maxOrder?.sort_order || 0) + 1;

        const { data: category, error } = await supabase
            .from("categories")
            .insert({
                tenant_id: tenantId,
                name,
                slug: finalSlug,
                description: description || null,
                image_url: imageUrl || null,
                parent_id: parentId || null,
                sort_order: sortOrder,
            })
            .select()
            .single();

        if (error) {
            console.error("Create category error:", error);
            return { error: `Failed to create category: ${error.message}` };
        }

        await expireCategoryCaches(tenantId);
        return { category };
    } catch (err) {
        console.error("Create category error:", err);
        return { error: err instanceof Error ? err.message : "Failed to create category" };
    }
}

export async function updateCategory(formData: FormData): Promise<{ error?: string; category?: Category }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const slug = formData.get("slug") as string;
        const description = formData.get("description") as string;
        const imageUrl = formData.get("imageUrl") as string;
        const parentId = formData.get("parentId") as string;

        if (!name?.trim()) {
            return { error: "Category name is required" };
        }

        // Prevent setting self as parent
        if (parentId === id) {
            return { error: "Category cannot be its own parent" };
        }

        // Check for duplicate slug (excluding current category)
        const { data: existing } = await supabase
            .from("categories")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("slug", slug)
            .neq("id", id)
            .single();

        let finalSlug = slug;
        if (existing) {
            finalSlug = `${slug}-${Date.now()}`;
        }

        const { data: category, error } = await supabase
            .from("categories")
            .update({
                name,
                slug: finalSlug,
                description: description || null,
                image_url: imageUrl || null,
                parent_id: parentId || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("tenant_id", tenantId)
            .select()
            .single();

        if (error) {
            console.error("Update category error:", error);
            return { error: `Failed to update category: ${error.message}` };
        }

        await expireCategoryCaches(tenantId);
        return { category };
    } catch (err) {
        console.error("Update category error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update category" };
    }
}

export async function deleteCategory(id: string): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // Check if category has children
        const { data: children } = await supabase
            .from("categories")
            .select("id")
            .eq("parent_id", id)
            .limit(1);

        if (children && children.length > 0) {
            return { error: "Cannot delete category with subcategories. Delete or move subcategories first." };
        }

        // Unassign products from this category
        await supabase
            .from("products")
            .update({ category_id: null })
            .eq("category_id", id);

        // Delete the category
        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", id)
            .eq("tenant_id", tenantId);

        if (error) {
            console.error("Delete category error:", error);
            return { error: `Failed to delete category: ${error.message}` };
        }

        await expireCategoryCaches(tenantId);
        return {};
    } catch (err) {
        console.error("Delete category error:", err);
        return { error: err instanceof Error ? err.message : "Failed to delete category" };
    }
}

export async function bulkDeleteCategories(ids: string[]): Promise<{ error?: string; deletedCount: number }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();
        let deletedCount = 0;

        for (const id of ids) {
            // Check if category has children
            const { data: children } = await supabase
                .from("categories")
                .select("id")
                .eq("parent_id", id)
                .limit(1);

            if (children && children.length > 0) {
                continue; // Skip categories with children
            }

            // Unassign products
            await supabase
                .from("products")
                .update({ category_id: null })
                .eq("category_id", id);

            // Delete category
            const { error } = await supabase
                .from("categories")
                .delete()
                .eq("id", id)
                .eq("tenant_id", tenantId);

            if (!error) {
                deletedCount++;
            }
        }

        await expireCategoryCaches(tenantId);
        return { deletedCount };
    } catch (err) {
        console.error("Bulk delete categories error:", err);
        return { error: err instanceof Error ? err.message : "Failed to delete categories", deletedCount: 0 };
    }
}

export async function updateCategoryOrder(updates: { id: string; sort_order: number; parent_id: string | null }[]): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        for (const update of updates) {
            const { error } = await supabase
                .from("categories")
                .update({ 
                    sort_order: update.sort_order,
                    parent_id: update.parent_id,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", update.id)
                .eq("tenant_id", tenantId);

            if (error) {
                console.error("Update category order error:", error);
                return { error: `Failed to update order: ${error.message}` };
            }
        }

        await expireCategoryCaches(tenantId);
        return {};
    } catch (err) {
        console.error("Update category order error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update order" };
    }
}

export async function moveCategory(id: string, newParentId: string | null): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedTenant();

        // Prevent circular reference
        if (newParentId) {
            // Check if newParentId is a descendant of id
            let currentId: string | null = newParentId;
            while (currentId) {
                if (currentId === id) {
                    return { error: "Cannot move category to its own descendant" };
                }
                const result = await supabase
                    .from("categories")
                    .select("parent_id")
                    .eq("id", currentId)
                    .single();
                const parentData = result.data as { parent_id: string | null } | null;
                currentId = parentData?.parent_id || null;
            }
        }

        const { error } = await supabase
            .from("categories")
            .update({ 
                parent_id: newParentId,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id)
            .eq("tenant_id", tenantId);

        if (error) {
            console.error("Move category error:", error);
            return { error: `Failed to move category: ${error.message}` };
        }

        await expireCategoryCaches(tenantId);
        return {};
    } catch (err) {
        console.error("Move category error:", err);
        return { error: err instanceof Error ? err.message : "Failed to move category" };
    }
}
