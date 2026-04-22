import { auth, getCollections } from "./_lib/queries";
import { CollectionsClient } from "./collections-client";

export default async function CollectionsPage() {
    const { supabase, tenantId } = await auth();
    const collections = await getCollections(tenantId, supabase);

    return <CollectionsClient collections={collections} />;
}
