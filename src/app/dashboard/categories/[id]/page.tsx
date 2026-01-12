import { createClient } from "@/infrastructure/supabase/server";
import { redirect, notFound } from "next/navigation";
import { getCategoryDetail, getCategoryBreadcrumbs } from "../category-actions";
import { CategoryDetailClient } from "./category-detail-client";

export default async function CategoryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) redirect("/login");

    const [categoryResult, breadcrumbs] = await Promise.all([
        getCategoryDetail(id),
        getCategoryBreadcrumbs(id),
    ]);

    if (!categoryResult.success || !categoryResult.data) {
        notFound();
    }

    return (
        <CategoryDetailClient
            initialCategory={categoryResult.data}
            breadcrumbs={breadcrumbs}
        />
    );
}
