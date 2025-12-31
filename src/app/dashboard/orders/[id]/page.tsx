import { notFound } from "next/navigation";
import { getOrder } from "../order-actions";
import { OrderDetailClient } from "./order-detail-client";

type PageProps = {
    params: Promise<{ id: string }>;
};

export default async function OrderDetailPage(props: PageProps) {
    const { id } = await props.params;

    const result = await getOrder(id);

    if (!result.success || !result.data) {
        return notFound();
    }

    return <OrderDetailClient order={result.data} />;
}
