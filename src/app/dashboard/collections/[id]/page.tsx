import { createClient } from "@/infrastructure/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getCollectionDetail } from "../collection-actions";
import { CollectionDetailClient } from "./collection-detail-client";

export default async function CollectionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/auth/login");

    const result = await getCollectionDetail(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return <CollectionDetailClient initialCollection={result.data} />;
}
