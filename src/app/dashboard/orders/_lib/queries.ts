import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import type { OrderRow, OrderStats, ReturnRow, ReturnStats } from "./types";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
  if (!data?.tenant_id) redirect("/login");

  return { supabase, tenantId: data.tenant_id, userId: user.id };
}

export async function getTenantCurrency(supabase: Awaited<ReturnType<typeof createClient>>, tenantId: string) {
  const { data } = await supabase.from("tenants").select("currency").eq("id", tenantId).single();
  return data?.currency || "USD";
}

// ─── Orders ──────────────────────────────────────────────

interface OrderFilters {
  search?: string;
  status?: string;
  payment?: string;
  from?: string;
  to?: string;
  sort?: string;
  order?: string;
  page?: string;
  pageSize?: string;
}

export async function getOrders(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>, params: OrderFilters) {
  const page = parseInt(params.page || "1") - 1;
  const perPage = parseInt(params.pageSize || "20");

  let query = supabase
    .from("orders")
    .select("*, order_items(id)", { count: "exact" })
    .eq("tenant_id", tenantId)
    .order(params.sort || "created_at", { ascending: params.order === "asc" })
    .range(page * perPage, (page + 1) * perPage - 1);

  if (params.search) {
    query = query.or(`order_number.ilike.%${params.search}%,customer_name.ilike.%${params.search}%,customer_email.ilike.%${params.search}%`);
  }
  if (params.status && params.status !== "all") {
    const s = params.status.split(",");
    query = s.length === 1 ? query.eq("status", s[0]) : query.in("status", s);
  }
  if (params.payment && params.payment !== "all") {
    const p = params.payment.split(",");
    query = p.length === 1 ? query.eq("payment_status", p[0]) : query.in("payment_status", p);
  }
  if (params.from) query = query.gte("created_at", params.from);
  if (params.to) query = query.lte("created_at", params.to);

  const { data, count } = await query;

  const orders: OrderRow[] = (data || []).map(o => ({
    id: o.id, order_number: o.order_number, status: o.status,
    payment_status: o.payment_status || "pending",
    fulfillment_status: o.fulfillment_status || "unfulfilled",
    customer_id: o.customer_id, customer_name: o.customer_name,
    customer_email: o.customer_email,
    total: parseFloat(o.total || "0"), subtotal: parseFloat(o.subtotal || "0"),
    shipping_total: parseFloat(o.shipping_total || "0"), tax_total: parseFloat(o.tax_total || "0"),
    currency: o.currency || "USD",
    items_count: Array.isArray(o.order_items) ? o.order_items.length : 0,
    created_at: o.created_at, updated_at: o.updated_at,
  }));

  return { orders, totalCount: count ?? 0 };
}

export async function getOrderStats(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<OrderStats> {
  const [
    { count: total }, { count: pending }, { count: processing },
    { count: shipped }, { count: completed }, { count: cancelled },
    { count: unpaid }, { data: revenueData },
  ] = await Promise.all([
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "pending"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "processing"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "shipped"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "completed"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("status", "cancelled"),
    supabase.from("orders").select("*", { count: "exact", head: true }).eq("tenant_id", tenantId).eq("payment_status", "pending"),
    supabase.from("orders").select("total").eq("tenant_id", tenantId).eq("payment_status", "paid"),
  ]);

  const revenue = (revenueData || []).reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
  const t = total ?? 0;

  return {
    total: t, pending: pending ?? 0, processing: processing ?? 0,
    shipped: shipped ?? 0, completed: completed ?? 0, cancelled: cancelled ?? 0,
    revenue, unpaid: unpaid ?? 0, avgOrderValue: t > 0 ? revenue / t : 0,
  };
}

// ─── Order Detail ────────────────────────────────────────

export async function getOrderDetail(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>, orderId: string) {
  const { data: order, error } = await supabase
    .from("orders").select("*, order_items (*), order_events (*)")
    .eq("id", orderId).eq("tenant_id", tenantId).single();

  if (error || !order) return null;

  // Adjacent orders for prev/next nav
  const [{ data: prev }, { data: next }, customer] = await Promise.all([
    supabase.from("orders").select("id").eq("tenant_id", tenantId)
      .gt("created_at", order.created_at).order("created_at", { ascending: true }).limit(1).single(),
    supabase.from("orders").select("id").eq("tenant_id", tenantId)
      .lt("created_at", order.created_at).order("created_at", { ascending: false }).limit(1).single(),
    order.customer_id
      ? supabase.from("customers").select("*").eq("id", order.customer_id).single().then(r => r.data)
      : Promise.resolve(null),
  ]);

  return { order, customer, prevOrderId: prev?.id, nextOrderId: next?.id };
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
  let count = 0;
  let stats: ReturnStats = { total: 0, requested: 0, approved: 0, processing: 0, completed: 0, rejected: 0, totalRefunded: 0 };

  try {
    let query = supabase
      .from("returns")
      .select(`*, order:orders (id, order_number, total, currency), customer:customers (id, email, first_name, last_name), return_items (*, order_item:order_items (id, product_name, product_image, quantity, unit_price))`, { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range(page * perPage, (page + 1) * perPage - 1);

    if (params.status && params.status !== "all") query = query.eq("status", params.status);
    if (params.search) query = query.or(`reason.ilike.%${params.search}%`);

    const { data, count: c, error } = await query;
    if (!error) {
      returns = data || [];
      count = c || 0;

      const { data: sd } = await supabase.from("returns").select("status, refund_amount").eq("tenant_id", tenantId);
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

  return { returns: returns as ReturnRow[], totalCount: count, stats };
}
