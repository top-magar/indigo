import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { OrderDetailClient, type Order } from "./order-detail-client";

export const metadata: Metadata = {
  title: "Order Details | Dashboard",
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

  // Fetch prev/next order IDs for navigation
  const [{ data: prevOrder }, { data: nextOrder }] = await Promise.all([
    supabase.from("orders").select("id").eq("tenant_id", membership.tenant_id)
      .gt("created_at", order.created_at).order("created_at", { ascending: true }).limit(1).single(),
    supabase.from("orders").select("id").eq("tenant_id", membership.tenant_id)
      .lt("created_at", order.created_at).order("created_at", { ascending: false }).limit(1).single(),
  ]);

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
    shippingAddress: order.shipping_address as { addressLine1: string; addressLine2?: string; city: string; state?: string; postalCode?: string; country: string; phone?: string } | null,
    billingAddress: order.billing_address as { addressLine1: string; addressLine2?: string; city: string; state?: string; postalCode?: string; country: string; phone?: string } | null,
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
      .sort((a, b) => 
        new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
      )
      .map(event => ({
        id: event.id as string,
        type: event.type as string,
        message: event.message as string,
        createdAt: event.created_at as string,
        user: event.user_email as string | null,
      })),
    tags: ((order.metadata as Record<string, unknown>)?.tags as string[]) ?? [],
  };

  return <OrderDetailClient order={transformedOrder as Order} prevOrderId={prevOrder?.id} nextOrderId={nextOrder?.id} />;
}