import { Metadata } from "next";
import { notFound } from "next/navigation";
import { auth } from "../_lib/queries";
import { AttributeDetailClient } from "./attribute-detail-client";
import { getAttributeDetail } from "../attribute-actions";

export const metadata: Metadata = {
    title: "Attribute Details | Dashboard",
    description: "View and manage attribute details.",
};

export default async function AttributeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await auth();

    const result = await getAttributeDetail(id);
    if (!result.success || !result.data) notFound();

    return <AttributeDetailClient attribute={result.data} />;
}
