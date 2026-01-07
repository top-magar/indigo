"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
    Category,
    CategoryProduct,
    Subcategory,
    CategoryBreadcrumb,
    CategoryStats,
} from "./types";

// ============================================================================
// AUTH HELPER
// ============================================================================

async function getAuthenticatedTenant() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, full_name")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { supabase, tenantId: userData.tenant_id, userId: user.id, userName: userData.full_name };
}

// ============================================================================
// CATEGORY QUERIES
// ============================================================================

export async function getCategoryDetail(categoryId: string): Promise<{ success: boolean; data?: Category; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Fetch category
        const { data: category, error: categoryError } = await supabase
            .from("categories")
            .select("*")
            .eq("id", categoryId)
            .eq("tenant_id", tenantId)
            .single();

        if (categoryError || !category) {
            return { success: false, error: "Category not found" };
        }

        // Fetch parent if exists
        let parentName: string | null = null;
        if (category.parent_id) {
            const { data: parent } = await supabase
                .from("categories")
                .select("name")
                .eq("id", category.parent_id)
                .single();
            parentName = parent?.name || null;
        }

        // Fetch subcategories
        const { data: subcategoriesData } = await supabase
            .from("categories")
            .select(`
                id,
                name,
                slug,
                description,
                image_url,
                sort_order,
                created_at,
                products:products(count)
            `)
            .eq("parent_id", categoryId)
            .eq("tenant_id", tenantId)
            .order("sort_order", { ascending: true });

        // Fetch products in this category
        const { data: productsData } = await supabase
            .from("products")
            .select("id, name, slug, sku, price, images, status, created_at")
            .eq("category_id", categoryId)
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false })
            .limit(50);

        // Calculate level
        let level = 0;
        let currentParentId = category.parent_id;
        while (currentParentId) {
            level++;
            const { data: parent } = await supabase
                .from("categories")
                .select("parent_id")
                .eq("id", currentParentId)
                .single();
            currentParentId = parent?.parent_id || null;
        }

        // Transform subcategories
        const subcategories: Subcategory[] = (subcategoriesData || []).map(sub => {
            // Count children of this subcategory
            const childCount = (subcategoriesData || []).filter(s => s.id !== sub.id).length;
            return {
                id: sub.id,
                name: sub.name,
                slug: sub.slug,
                description: sub.description,
                imageUrl: sub.image_url,
                productCount: sub.products?.[0]?.count || 0,
                subcategoryCount: 0, // Will be calculated separately if needed
                sortOrder: sub.sort_order || 0,
                createdAt: sub.created_at,
            };
        });

        // Get subcategory counts
        for (const sub of subcategories) {
            const { count } = await supabase
                .from("categories")
                .select("*", { count: "exact", head: true })
                .eq("parent_id", sub.id)
                .eq("tenant_id", tenantId);
            sub.subcategoryCount = count || 0;
        }

        // Transform products
        const products: CategoryProduct[] = (productsData || []).map(p => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            sku: p.sku,
            price: parseFloat(p.price || "0"),
            image: (p.images as string[])?.[0] || null,
            status: p.status as "draft" | "active" | "archived",
            createdAt: p.created_at,
        }));

        // Get total product count
        const { count: productCount } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("category_id", categoryId)
            .eq("tenant_id", tenantId);

        // Transform to Category type
        const categoryData: Category = {
            id: category.id,
            tenantId: category.tenant_id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            backgroundImage: category.image_url,
            backgroundImageAlt: category.image_alt || null,
            parentId: category.parent_id,
            parentName,
            level,
            seo: {
                metaTitle: category.meta_title || null,
                metaDescription: category.meta_description || null,
                slug: category.slug,
            },
            productCount: productCount || 0,
            subcategoryCount: subcategories.length,
            subcategories,
            products,
            metadata: category.metadata,
            sortOrder: category.sort_order || 0,
            createdAt: category.created_at,
            updatedAt: category.updated_at,
        };

        return { success: true, data: categoryData };
    } catch (error) {
        console.error("Failed to fetch category:", error);
        return { success: false, error: "Failed to fetch category" };
    }
}

export async function getCategoryBreadcrumbs(categoryId: string): Promise<CategoryBreadcrumb[]> {
    const { supabase, tenantId } = await getAuthenticatedTenant();
    const breadcrumbs: CategoryBreadcrumb[] = [];

    try {
        let currentId: string | null = categoryId;
        
        while (currentId) {
            const result = await supabase
                .from("categories")
                .select("id, name, slug, parent_id")
                .eq("id", currentId)
                .eq("tenant_id", tenantId)
                .single();

            const cat = result.data as { id: string; name: string; slug: string; parent_id: string | null } | null;
            if (!cat) break;

            breadcrumbs.unshift({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
            });

            currentId = cat.parent_id;
        }

        return breadcrumbs;
    } catch (error) {
        console.error("Failed to fetch breadcrumbs:", error);
        return [];
    }
}

export async function getCategoryStats(): Promise<CategoryStats> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    const { data: categories } = await supabase
        .from("categories")
        .select(`
            id,
            parent_id,
            products:products(count)
        `)
        .eq("tenant_id", tenantId);

    const stats: CategoryStats = {
        total: 0,
        rootCategories: 0,
        withProducts: 0,
        empty: 0,
        totalProducts: 0,
        maxDepth: 0,
    };

    if (categories) {
        stats.total = categories.length;
        
        // Calculate stats
        const categoryMap = new Map<string, { parentId: string | null; productCount: number }>();
        categories.forEach(cat => {
            const productCount = cat.products?.[0]?.count || 0;
            categoryMap.set(cat.id, { parentId: cat.parent_id, productCount });
            
            if (!cat.parent_id) stats.rootCategories++;
            if (productCount > 0) {
                stats.withProducts++;
                stats.totalProducts += productCount;
            } else {
                stats.empty++;
            }
        });

        // Calculate max depth
        const getDepth = (id: string, visited = new Set<string>()): number => {
            if (visited.has(id)) return 0;
            visited.add(id);
            const cat = categoryMap.get(id);
            if (!cat || !cat.parentId) return 0;
            return 1 + getDepth(cat.parentId, visited);
        };

        categories.forEach(cat => {
            const depth = getDepth(cat.id);
            if (depth > stats.maxDepth) stats.maxDepth = depth;
        });
    }

    return stats;
}

// ============================================================================
// CATEGORY MUTATIONS
// ============================================================================

export async function updateCategoryInfo(
    categoryId: string,
    data: { name?: string; description?: string }
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;

        const { error } = await supabase
            .from("categories")
            .update(updateData)
            .eq("id", categoryId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update category" };
        }

        revalidatePath(`/dashboard/categories/${categoryId}`);
        revalidatePath("/dashboard/categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to update category:", error);
        return { success: false, error: "Failed to update category" };
    }
}

// ============================================================================
// IMAGE ACTIONS
// ============================================================================

export async function updateCategoryImage(
    categoryId: string,
    imageUrl: string | null,
    imageAlt?: string
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { error } = await supabase
            .from("categories")
            .update({
                image_url: imageUrl,
                image_alt: imageAlt || null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", categoryId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update image" };
        }

        revalidatePath(`/dashboard/categories/${categoryId}`);
        revalidatePath("/dashboard/categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to update image:", error);
        return { success: false, error: "Failed to update image" };
    }
}

export async function deleteCategoryImage(categoryId: string) {
    return updateCategoryImage(categoryId, null);
}

// ============================================================================
// SEO ACTIONS
// ============================================================================

export async function updateCategorySeo(
    categoryId: string,
    seo: { metaTitle?: string; metaDescription?: string; slug?: string }
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (seo.metaTitle !== undefined) updateData.meta_title = seo.metaTitle;
        if (seo.metaDescription !== undefined) updateData.meta_description = seo.metaDescription;
        if (seo.slug !== undefined) {
            // Check for duplicate slug
            const { data: existing } = await supabase
                .from("categories")
                .select("id")
                .eq("tenant_id", tenantId)
                .eq("slug", seo.slug)
                .neq("id", categoryId)
                .single();

            if (existing) {
                return { success: false, error: "Slug already exists" };
            }
            updateData.slug = seo.slug;
        }

        const { error } = await supabase
            .from("categories")
            .update(updateData)
            .eq("id", categoryId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update SEO" };
        }

        revalidatePath(`/dashboard/categories/${categoryId}`);
        revalidatePath("/dashboard/categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to update SEO:", error);
        return { success: false, error: "Failed to update SEO" };
    }
}

// ============================================================================
// DELETE CATEGORY
// ============================================================================

export async function deleteCategoryById(categoryId: string) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Check if category has children
        const { data: children } = await supabase
            .from("categories")
            .select("id")
            .eq("parent_id", categoryId)
            .limit(1);

        if (children && children.length > 0) {
            return { success: false, error: "Cannot delete category with subcategories" };
        }

        // Unassign products from this category
        await supabase
            .from("products")
            .update({ category_id: null })
            .eq("category_id", categoryId);

        // Delete category
        const { error } = await supabase
            .from("categories")
            .delete()
            .eq("id", categoryId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to delete category" };
        }

        revalidatePath("/dashboard/categories");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { success: false, error: "Failed to delete category" };
    }
}

// ============================================================================
// SUBCATEGORY ACTIONS
// ============================================================================

export async function createSubcategory(
    parentId: string,
    data: { name: string; slug: string; description?: string }
) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Check for duplicate slug
        const { data: existing } = await supabase
            .from("categories")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("slug", data.slug)
            .single();

        let finalSlug = data.slug;
        if (existing) {
            finalSlug = `${data.slug}-${Date.now()}`;
        }

        // Get max sort order
        const { data: maxOrder } = await supabase
            .from("categories")
            .select("sort_order")
            .eq("parent_id", parentId)
            .eq("tenant_id", tenantId)
            .order("sort_order", { ascending: false })
            .limit(1)
            .single();

        const sortOrder = (maxOrder?.sort_order || 0) + 1;

        const { data: category, error } = await supabase
            .from("categories")
            .insert({
                tenant_id: tenantId,
                parent_id: parentId,
                name: data.name,
                slug: finalSlug,
                description: data.description || null,
                sort_order: sortOrder,
            })
            .select()
            .single();

        if (error) {
            return { success: false, error: "Failed to create subcategory" };
        }

        revalidatePath(`/dashboard/categories/${parentId}`);
        revalidatePath("/dashboard/categories");
        return { success: true, data: category };
    } catch (error) {
        console.error("Failed to create subcategory:", error);
        return { success: false, error: "Failed to create subcategory" };
    }
}

export async function deleteSubcategory(subcategoryId: string, parentId: string) {
    const result = await deleteCategoryById(subcategoryId);
    if (result.success) {
        revalidatePath(`/dashboard/categories/${parentId}`);
    }
    return result;
}

// ============================================================================
// PRODUCT ACTIONS (for category)
// ============================================================================

export async function getCategoryProducts(categoryId: string, page = 1, limit = 20) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const offset = (page - 1) * limit;

        const { data: products, error, count } = await supabase
            .from("products")
            .select("id, name, slug, sku, price, images, status, created_at", { count: "exact" })
            .eq("category_id", categoryId)
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            return { success: false, error: "Failed to fetch products", data: [], total: 0 };
        }

        return {
            success: true,
            data: (products || []).map(p => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                sku: p.sku,
                price: parseFloat(p.price || "0"),
                image: (p.images as string[])?.[0] || null,
                status: p.status as "draft" | "active" | "archived",
                createdAt: p.created_at,
            })),
            total: count || 0,
        };
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return { success: false, error: "Failed to fetch products", data: [], total: 0 };
    }
}

export async function removeProductFromCategory(productId: string, categoryId: string) {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { error } = await supabase
            .from("products")
            .update({ category_id: null, updated_at: new Date().toISOString() })
            .eq("id", productId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to remove product" };
        }

        revalidatePath(`/dashboard/categories/${categoryId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to remove product:", error);
        return { success: false, error: "Failed to remove product" };
    }
}
