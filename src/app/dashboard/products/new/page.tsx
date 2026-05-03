import { auth, getNewProductData } from "../_lib/queries";
import { NewProductClient } from "./new-product-client";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { eq } from "drizzle-orm";

export default async function NewProductPage() {
    const { supabase, tenantId } = await auth();
    const [{ categories, collections }, tenant] = await Promise.all([
        getNewProductData(tenantId, supabase),
        db.select({ slug: tenants.slug }).from(tenants).where(eq(tenants.id, tenantId)).limit(1).then(r => r[0]),
    ]);

    return (
        <NewProductClient 
            categories={categories} 
            collections={collections}
            storeSlug={tenant?.slug ?? ""}
        />
    );
}
