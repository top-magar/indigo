import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CollectionsClient } from "./collections-client";

export default async function CollectionsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    // Fetch collections with product count
    const { data: collections } = await supabase
        .from("collections")
        .select(`
            *,
            collection_products(count)
        `)
        .eq("tenant_id", userData.tenant_id)
        .order("sort_order", { ascending: true });

    // Transform to include products_count
    const collectionsWithCount = (collections || []).map(c => ({
        ...c,
        products_count: c.collection_products?.[0]?.count || 0,
    }));

    return <CollectionsClient collections={collectionsWithCount} />;
}
