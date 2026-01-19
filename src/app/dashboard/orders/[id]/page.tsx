import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { OrderDetailClient } from "./order-detail-client";

export const metadata: Metadata = {
  title: "Order Details | Indigo Dashboard",
  description: "View and manage order details.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user and tenant
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: membership } = await supabase
    .from("tenant_memberships")
    .select("tenant_id, role")
    .eq("user_id", user.id)
    .single();

  if (!membership) redirect("/onboarding");

  // Fetch order with items and events
  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      *,
      order_items (*),
      order_events (*)
    `)
    .eq("id", id)
    .eq("tenant_id", membership.tenant_id)
    .single();

  if (error || !order) {
    notFound();
  }

  // Fetch customer details if exists
  let customer = null;
  if (order.customer_id) {
    const { data } = await supabase
      .from("customers")
      .select("*")
      .eq("id", order.customer_id)
      .single();
    customer = data;
  }

  // Transform data for client component
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
    shippingAddress: order.shipping_address as any,
    billingAddress: order.billing_address as any,
    lines: (order.order_items || []).map((item: any) => ({
      id: item.id,
      productName: item.product_name,
      productSku: item.product_sku,
      productImage: item.product_image,
      quantity: item.quantity,
      quantityFulfilled: item.quantity_fulfilled || 0,
      unitPrice: parseFloat(item.unit_price),
      totalPrice: parseFloat(item.total_price),
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
    events: (order.order_events || [])
      .sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .map((event: any) => ({
        id: event.id,
        type: event.event_type,
        message: event.message,
        createdAt: event.created_at,
        user: event.user_email,
      })),
  };

  return <OrderDetailClient order={transformedOrder} />;
}