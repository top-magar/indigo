import { notFound } from "next/navigation";
import { getDiscount } from "../../actions";
import { VoucherDetailClient } from "./voucher-detail-client";

interface VoucherDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function VoucherDetailPage({ params }: VoucherDetailPageProps) {
    const { id } = await params;
    const result = await getDiscount(id);

    if (!result.success || !result.data) {
        notFound();
    }

    const voucher = result.data;

    // Ensure it's a voucher
    if (voucher.kind !== "voucher") {
        notFound();
    }

    return <VoucherDetailClient voucher={voucher} />;
}
