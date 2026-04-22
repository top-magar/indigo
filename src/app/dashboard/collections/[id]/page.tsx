import { notFound } from "next/navigation";
import { auth } from "../_lib/queries";
import { getCollectionDetail } from "../collection-actions";
import { CollectionDetailClient } from "./collection-detail-client";

export default async function CollectionDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    await auth();

    const result = await getCollectionDetail(id);
    if (!result.success || !result.data) notFound();

    return <CollectionDetailClient initialCollection={result.data} />;
}
