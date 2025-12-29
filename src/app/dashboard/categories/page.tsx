import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CategoriesClient } from "./categories-client";
import type { CategoryWithCount } from "./actions";

export default async function CategoriesPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    // Fetch categories with product counts
    const { data: categories } = await supabase
        .from("categories")
        .select(`
            *,
            products:products(count)
        `)
        .eq("tenant_id", userData.tenant_id)
        .order("sort_order", { ascending: true });

    // Transform to include counts
    const categoriesWithCounts: CategoryWithCount[] = (categories || []).map(cat => {
        const childrenCount = (categories || []).filter(c => c.parent_id === cat.id).length;
        return {
            ...cat,
            products_count: cat.products?.[0]?.count || 0,
            children_count: childrenCount,
        };
    });

    return <CategoriesClient categories={categoriesWithCounts} />;
}
