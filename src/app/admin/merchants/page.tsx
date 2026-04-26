import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { sql, desc } from "drizzle-orm";
import MerchantsClient from "./merchants-client";
import { requireAdmin } from "../_lib/auth";
import { requirePermission } from "../_lib/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Merchants | Admin" };

export default async function MerchantsPage() {
  await requirePermission("view_merchants");

  // Single query: all merchants with aggregated stats via LEFT JOIN
  const merchantList = await db.execute<{
    id: string; name: string; slug: string; created_at: string | null;
    settings: Record<string, unknown> | null;
    order_count: string; revenue: string; product_count: string;
  }>(sql`
    SELECT
      t.id, t.name, t.slug, t.created_at, t.settings,
      COALESCE(o.order_count, 0) AS order_count,
      COALESCE(o.revenue, 0) AS revenue,
      COALESCE(p.product_count, 0) AS product_count
    FROM tenants t
    LEFT JOIN (
      SELECT tenant_id, count(*) AS order_count,
             SUM(CASE WHEN payment_status = 'paid' THEN total::numeric ELSE 0 END) AS revenue
      FROM orders GROUP BY tenant_id
    ) o ON o.tenant_id = t.id
    LEFT JOIN (
      SELECT tenant_id, count(*) AS product_count
      FROM products GROUP BY tenant_id
    ) p ON p.tenant_id = t.id
    ORDER BY t.created_at DESC
    LIMIT 100
  `);

  const totalRevenue = merchantList.reduce((sum, m) => sum + Number(m.revenue), 0).toString();

  const serialized = merchantList.map(m => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    createdAt: m.created_at,
    orderCount: Number(m.order_count),
    revenue: m.revenue,
    productCount: Number(m.product_count),
    suspended: !!m.settings?.suspended,
  }));

  return <MerchantsClient merchants={serialized} totalRevenue={totalRevenue} />;
}
