import { Metadata } from "next";
import { auth } from "./_lib/queries";
import { AttributesClient } from "./attributes-client";
import { getAttributes } from "./attribute-actions";

export const metadata: Metadata = {
    title: "Attributes | Dashboard",
    description: "Manage product attributes like Size, Color, Material.",
};

interface AttributesPageProps {
    searchParams: Promise<{
        search?: string;
        inputType?: string;
        sortBy?: string;
        sortOrder?: string;
    }>;
}

export default async function AttributesPage({ searchParams }: AttributesPageProps) {
    await auth();
    const params = await searchParams;

    const { attributes, stats } = await getAttributes({
        search: params.search,
        inputType: params.inputType as "dropdown" | "multiselect" | "text" | "numeric" | "boolean" | "swatch" | "all" | undefined,
        sortBy: params.sortBy as "name" | "created_at" | "input_type" | undefined,
        sortOrder: params.sortOrder as "asc" | "desc" | undefined,
    });

    return (
        <AttributesClient
            attributes={attributes}
            stats={stats}
            filters={{
                search: params.search,
                inputType: params.inputType,
                sortBy: params.sortBy,
                sortOrder: params.sortOrder,
            }}
        />
    );
}
