import { notFound } from "next/navigation";
import { auth } from "../_lib/queries";
import { getCategoryDetail, getCategoryBreadcrumbs } from "../category-actions";
import { CategoryDetailClient } from "./category-detail-client";

export default async function CategoryDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    await auth();

    const [categoryResult, breadcrumbs] = await Promise.all([
        getCategoryDetail(id),
        getCategoryBreadcrumbs(id),
    ]);

    if (!categoryResult.success || !categoryResult.data) notFound();

    return (
        <CategoryDetailClient
            initialCategory={categoryResult.data}
            breadcrumbs={breadcrumbs}
        />
    );
}
