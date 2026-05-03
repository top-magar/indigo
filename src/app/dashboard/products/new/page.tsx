import { auth, getNewProductData } from "../_lib/queries";
import { NewProductClient } from "./new-product-client";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { categories } from "@/db/schema/products";
import { eq } from "drizzle-orm";

export default async function NewProductPage() {
    const { supabase, tenantId } = await auth();
    const [data, tenant] = await Promise.all([
        getNewProductData(tenantId, supabase),
        db.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.id, tenantId)).limit(1).then(r => r[0]),
    ]);

    // Auto-create 'General' category if none exist (first-product zero-friction)
    if (data.categories.length === 0) {
        const [created] = await db.insert(categories).values({
            tenantId, name: "General", slug: "general",
        }).returning({ id: categories.id, name: categories.name, slug: categories.slug });
        if (created) data.categories.push(created);
    }

    return (
        <NewProductClient 
            categories={data.categories} 
            collections={data.collections}
            storeSlug={tenant?.slug ?? ""}
        />
    );
}
