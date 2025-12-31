import { notFound } from "next/navigation";
import { getDiscount } from "../../actions";
import { SaleDetailClient } from "./sale-detail-client";

interface SaleDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function SaleDetailPage({ params }: SaleDetailPageProps) {
    const { id } = await params;
    const result = await getDiscount(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const sale = result.data;

    // Ensure it's a sale
    if (sale.kind !== "sale") {
        notFound();
    }

    return <SaleDetailClient sale={sale} />;
}
