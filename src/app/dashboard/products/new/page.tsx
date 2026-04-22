import { auth, getNewProductData } from "../_lib/queries";
import { NewProductClient } from "./new-product-client";

export default async function NewProductPage() {
    const { supabase, tenantId } = await auth();
    const { categories, collections } = await getNewProductData(tenantId, supabase);

    return (
        <NewProductClient 
            categories={categories} 
            collections={collections}
        />
    );
}
