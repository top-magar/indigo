import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NewProductClient } from "./new-product-client";

export default async function NewProductPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    // Fetch categories from database
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("tenant_id", userData.tenant_id)
        .order("sort_order", { ascending: true });

    // Fetch collections from database
    const { data: collections } = await supabase
        .from("collections")
        .select("id, name, slug")
        .eq("tenant_id", userData.tenant_id)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

    return (
        <NewProductClient 
            categories={categories || []} 
            collections={collections || []}
        />
    );
}
