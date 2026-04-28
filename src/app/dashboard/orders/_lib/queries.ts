import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { sanitizeSearch } from "@/shared/utils/sanitize";
import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { orders, orderItems, orderEvents } from "@/db/schema/orders";
import { customers } from "@/db/schema/customers";
import { eq, and, asc, desc, ilike, or, gte, lte, inArray, count, sql, gt, lt } from "drizzle-orm";
import type { OrderRow, OrderStats, ReturnRow, ReturnStats } from "./types";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const { user, supabase } = await getAuthenticatedClient();
  return { supabase, tenantId: user.tenantId, userId: user.id };
}

export async function getTenantCurrency(_supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string) {
  const [row] = await db.select({ currency: tenants.currency }).from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  return row?.currency || "USD";
}

// ─── Orders ──────────────────────────────────────────────

interface OrderFilters {
  search?: string;
  status?: string;
  payment?: string;
  fulfillment?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: string;
  page?: string;
  pageSize?: string;
}

export async function getOrders(tenantId: string, _supabase: Awaited<ReturnType<typeof createClient>>, params: OrderFilters) {
  const page = parseInt(params.page || "1") - 1;
  const perPage = parseInt(params.pageSize || "20");

  const conditions: ReturnType<typeof eq>[] = [eq(orders.tenantId, tenantId)];

  if (params.search) {
    const term = `%${sanitizeSearch(params.search)}%`;
    conditions.push(or(
      ilike(orders.orderNumber, term),
      ilike(orders.customerName, term),
      ilike(orders.customerEmail, term),
    )!);
  }
  if (params.status && params.status !== "all") {
    const s = params.status.split(",");
    conditions.push(s.length === 1 ? eq(orders.status, s[0] as any) : inArray(orders.status, s as any));
  }
  if (params.payment && params.payment !== "all") {
    const p = params.payment.split(",");
    conditions.push(p.length === 1 ? eq(orders.paymentStatus, p[0] as any) : inArray(orders.paymentStatus, p as any));
  }
  if (params.fulfillment && params.fulfillment !== "all") {
    const f = params.fulfillment.split(",");
    conditions.push(f.length === 1 ? eq(orders.fulfillmentStatus, f[0] as any) : inArray(orders.fulfillmentStatus, f as any));
  }
  if (params.from) conditions.push(gte(orders.createdAt, new Date(params.from)));
  if (params.to) conditions.push(lte(orders.createdAt, new Date(params.to)));

  const sortCol = params.sort || "created_at";
  const sortDir = params.order === "asc" ? asc : desc;
  const sortField = sortCol === "order_number" ? orders.orderNumber
    : sortCol === "total" ? orders.total
    : sortCol === "status" ? orders.status
    : orders.createdAt;

  const where = and(...conditions);

  // Get orders + item count
  const [data, [countRow]] = await Promise.all([
    db.select({
      id: orders.id, orderNumber: orders.orderNumber, status: orders.status,
      paymentStatus: orders.paymentStatus, fulfillmentStatus: orders.fulfillmentStatus,
      customerId: orders.customerId, customerName: orders.customerName,
      customerEmail: orders.customerEmail, total: orders.total, subtotal: orders.subtotal,
      shippingTotal: orders.shippingTotal, taxTotal: orders.taxTotal,
      currency: orders.currency, itemsCount: orders.itemsCount,
      createdAt: orders.createdAt, updatedAt: orders.updatedAt,
    }).from(orders).where(where).orderBy(sortDir(sortField))
      .limit(perPage).offset(page * perPage),
    db.select({ value: count() }).from(orders).where(where),
  ]);

  const orderRows: OrderRow[] = data.map(o => ({
    id: o.id, order_number: o.orderNumber, status: o.status,
    payment_status: o.paymentStatus || "pending",
    fulfillment_status: o.fulfillmentStatus || "unfulfilled",
    customer_id: o.customerId, customer_name: o.customerName,
    customer_email: o.customerEmail,
    total: parseFloat(o.total || "0"), subtotal: parseFloat(o.subtotal || "0"),
    shipping_total: parseFloat(o.shippingTotal || "0"), tax_total: parseFloat(o.taxTotal || "0"),
    currency: o.currency || "USD",
    items_count: o.itemsCount || 0,
    created_at: o.createdAt instanceof Date ? o.createdAt.toISOString() : o.createdAt,
    updated_at: o.updatedAt instanceof Date ? o.updatedAt.toISOString() : o.updatedAt,
  }));

  return { orders: orderRows, totalCount: countRow?.value ?? 0 };
}

export async function getOrderStats(tenantId: string, _supabase: Awaited<ReturnType<typeof createClient>>): Promise<OrderStats> {
  const stats = await db.select({
    status: orders.status,
    cnt: count(),
    paidRevenue: sql<string>`COALESCE(SUM(CASE WHEN ${orders.paymentStatus} = 'paid' THEN ${orders.total} ELSE 0 END), 0)`,
    unpaidCnt: sql<string>`SUM(CASE WHEN ${orders.paymentStatus} = 'pending' THEN 1 ELSE 0 END)`,
  }).from(orders).where(eq(orders.tenantId, tenantId)).groupBy(orders.status);

  let total = 0, pending = 0, processing = 0, shipped = 0, completed = 0, cancelled = 0, revenue = 0, unpaid = 0;
  for (const row of stats) {
    const cnt = Number(row.cnt);
    total += cnt;
    revenue += parseFloat(row.paidRevenue);
    unpaid += Number(row.unpaidCnt);
    switch (row.status) {
      case "pending": pending = cnt; break;
      case "processing": processing = cnt; break;
      case "shipped": shipped = cnt; break;
      case "completed": completed = cnt; break;
      case "cancelled": cancelled = cnt; break;
    }
  }

  return {
    total, pending, processing, shipped, completed, cancelled,
    revenue, unpaid, avgOrderValue: total > 0 ? revenue / total : 0,
    conversionRate: 0, repeatCustomerRate: 0,
  };
}

// ─── Order Detail ────────────────────────────────────────

export async function getOrderDetail(tenantId: string, _supabase: Awaited<ReturnType<typeof createClient>>, orderId: string) {
  const [order] = await db.select().from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.tenantId, tenantId))).limit(1);

  if (!order) return null;

  const [items, events] = await Promise.all([
    db.select().from(orderItems).where(and(eq(orderItems.orderId, orderId), eq(orderItems.tenantId, tenantId))),
    db.select().from(orderEvents).where(and(eq(orderEvents.orderId, orderId), eq(orderEvents.tenantId, tenantId))),
  ]);

  // Adjacent orders for prev/next nav
  const [[prev], [next]] = await Promise.all([
    db.select({ id: orders.id }).from(orders)
      .where(and(eq(orders.tenantId, tenantId), gt(orders.createdAt, order.createdAt)))
      .orderBy(asc(orders.createdAt)).limit(1),
    db.select({ id: orders.id }).from(orders)
      .where(and(eq(orders.tenantId, tenantId), lt(orders.createdAt, order.createdAt)))
      .orderBy(desc(orders.createdAt)).limit(1),
  ]);

  let customer = null;
  if (order.customerId) {
    const [c] = await db.select().from(customers)
      .where(eq(customers.id, order.customerId)).limit(1);
    customer = c || null;
  }

  // Transform to snake_case shape expected by consumers
  const orderOut = {
    ...order,
    tenant_id: order.tenantId, order_number: order.orderNumber,
    payment_status: order.paymentStatus, fulfillment_status: order.fulfillmentStatus,
    customer_id: order.customerId, customer_email: order.customerEmail,
    customer_name: order.customerName, customer_note: order.customerNote,
    internal_notes: order.internalNotes, discount_total: order.discountTotal,
    shipping_total: order.shippingTotal, tax_total: order.taxTotal,
    items_count: order.itemsCount, shipping_address: order.shippingAddress,
    billing_address: order.billingAddress, shipping_method: order.shippingMethod,
    shipping_carrier: order.shippingCarrier, discount_id: order.discountId,
    discount_code: order.discountCode, discount_name: order.discountName,
    stripe_payment_intent_id: order.stripePaymentIntentId,
    created_at: order.createdAt instanceof Date ? order.createdAt.toISOString() : order.createdAt,
    updated_at: order.updatedAt instanceof Date ? order.updatedAt.toISOString() : order.updatedAt,
    order_items: items.map(i => ({
      ...i,
      tenant_id: i.tenantId, order_id: i.orderId, product_id: i.productId,
      variant_id: i.variantId, product_name: i.productName, product_sku: i.productSku,
      product_image: i.productImage, variant_title: i.variantTitle,
      unit_price: i.unitPrice, total_price: i.totalPrice,
      quantity_fulfilled: i.quantityFulfilled, tax_rate: i.taxRate,
      tax_amount: i.taxAmount, discount_amount: i.discountAmount,
      created_at: i.createdAt instanceof Date ? i.createdAt.toISOString() : i.createdAt,
    })),
    order_events: events.map(e => ({
      ...e,
      tenant_id: e.tenantId, order_id: e.orderId,
      user_id: e.userId, user_name: e.userName,
      created_at: e.createdAt instanceof Date ? e.createdAt.toISOString() : e.createdAt,
    })),
  };

  // Transform customer to snake_case
  const customerOut = customer ? {
    ...customer,
    tenant_id: customer.tenantId, first_name: customer.firstName,
    last_name: customer.lastName, accepts_marketing: customer.acceptsMarketing,
    is_active: customer.isActive, last_login: customer.lastLogin,
    country_code: customer.countryCode, private_metadata: customer.privateMetadata,
    password_hash: customer.passwordHash,
    created_at: customer.createdAt instanceof Date ? customer.createdAt.toISOString() : customer.createdAt,
    updated_at: customer.updatedAt instanceof Date ? customer.updatedAt.toISOString() : customer.updatedAt,
  } : null;

  return { order: orderOut, customer: customerOut, prevOrderId: prev?.id, nextOrderId: next?.id };
}

// ─── Returns ─────────────────────────────────────────────

interface ReturnFilters {
  page?: string;
  pageSize?: string;
  status?: string;
  search?: string;
}

export async function getReturns(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>, params: ReturnFilters) {
  const page = parseInt(params.page || "1") - 1;
  const perPage = parseInt(params.pageSize || "20");

  let returns: unknown[] = [];
  let returnCount = 0;
  let stats: ReturnStats = { total: 0, requested: 0, approved: 0, processing: 0, completed: 0, rejected: 0, totalRefunded: 0 };

  try {
    // TODO: migrate when schema added for returns, return_items
    let query = supabase
      .from("returns")
      .select(`*, order:orders (id, order_number, total, currency), customer:customers (id, email, first_name, last_name), return_items (*, order_item:order_items (id, product_name, product_image, quantity, unit_price))`, { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range(page * perPage, (page + 1) * perPage - 1);

    if (params.status && params.status !== "all") query = query.eq("status", params.status);
    if (params.search) query = query.or(`reason.ilike.%${sanitizeSearch(params.search)}%`);

    const { data, count: c, error } = await query;
    if (!error) {
      returns = data || [];
      returnCount = c || 0;

      // TODO: migrate when schema added for returns
      const { data: sd } = await supabase.from("returns").select("status, refund_amount").eq("tenant_id", tenantId).limit(5000);
      const statsData = sd || [];
      stats = {
        total: statsData.length,
        requested: statsData.filter(r => r.status === "requested").length,
        approved: statsData.filter(r => r.status === "approved").length,
        processing: statsData.filter(r => ["received", "processing"].includes(r.status)).length,
        completed: statsData.filter(r => ["refunded", "completed"].includes(r.status)).length,
        rejected: statsData.filter(r => ["rejected", "cancelled"].includes(r.status)).length,
        totalRefunded: statsData.filter(r => ["refunded", "completed"].includes(r.status)).reduce((s, r) => s + (r.refund_amount || 0), 0),
      };
    }
  } catch { /* table may not exist */ }

  return { returns: returns as ReturnRow[], totalCount: returnCount, stats };
}
