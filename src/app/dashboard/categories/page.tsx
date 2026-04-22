import { auth, getCategoriesWithCounts } from "./_lib/queries";
import { CategoriesClient } from "./categories-client";

export default async function CategoriesPage() {
    const { supabase, tenantId } = await auth();
    const categories = await getCategoriesWithCounts(tenantId, supabase);

    return <CategoriesClient categories={categories} />;
}
