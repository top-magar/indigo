import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AttributeDetailClient } from "./attribute-detail-client";
import { getAttributeDetail } from "../attribute-actions";

export const metadata: Metadata = {
    title: "Attribute Details | Dashboard",
    description: "View and manage attribute details.",
};

interface AttributeDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function AttributeDetailPage({ params }: AttributeDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const result = await getAttributeDetail(id);

    if (!result.success || !result.data) {
        notFound();
    }

    return <AttributeDetailClient attribute={result.data} />;
}
