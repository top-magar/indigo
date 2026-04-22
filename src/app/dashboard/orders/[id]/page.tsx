import { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetailClient, type Order } from "./order-detail-client";
import { auth, getOrderDetail } from "../_lib/queries";

export const metadata: Metadata = {
  title: "Order Details | Dashboard",
  description: "View and manage order details.",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, tenantId } = await auth();

  const result = await getOrderDetail(tenantId, supabase, id);
  if (!result) notFound();

  const { order, customer, prevOrderId, nextOrderId } = result;

  const transformedOrder = {
    id: order.id,
    orderNumber: order.order_number,
    status: order.status,
    paymentStatus: order.payment_status,
    fulfillmentStatus: order.fulfillment_status,
    customer: {
      id: order.customer_id,
      email: order.customer_email || "",
      firstName: customer?.first_name || order.customer_name?.split(" ")[0],
      lastName: customer?.last_name || order.customer_name?.split(" ").slice(1).join(" "),
      phone: customer?.phone,
      avatarUrl: customer?.avatar_url,
      isGuest: !order.customer_id,
      totalOrders: customer?.orders_count,
      totalSpent: customer?.total_spent ? parseFloat(customer.total_spent) : undefined,
    },
    shippingAddress: order.shipping_address as Record<string, string> | null,
    billingAddress: order.billing_address as Record<string, string> | null,
    lines: ((order.order_items ?? []) as Array<Record<string, unknown>>).map(item => ({
      id: item.id as string,
      productName: item.product_name as string,
      productSku: item.product_sku as string | null,
      productImage: item.product_image as string | null,
      quantity: item.quantity as number,
      quantityFulfilled: (item.quantity_fulfilled as number) || 0,
      unitPrice: parseFloat(String(item.unit_price)),
      totalPrice: parseFloat(String(item.total_price)),
    })),
    subtotal: parseFloat(order.subtotal),
    discountTotal: parseFloat(order.discount_total || "0"),
    shippingTotal: parseFloat(order.shipping_total || "0"),
    taxTotal: parseFloat(order.tax_total || "0"),
    total: parseFloat(order.total),
    currency: order.currency || "USD",
    customerNote: order.customer_note,
    internalNotes: order.internal_notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    events: ((order.order_events ?? []) as Array<Record<string, unknown>>)
      .sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
      .map(e => ({ id: e.id as string, type: e.type as string, message: e.message as string, createdAt: e.created_at as string, user: e.user_email as string | null })),
    tags: ((order.metadata as Record<string, unknown>)?.tags as string[]) ?? [],
  };

  return <OrderDetailClient order={transformedOrder as unknown as Order} prevOrderId={prevOrderId} nextOrderId={nextOrderId} />;
}
