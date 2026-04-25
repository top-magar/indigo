import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { orders } from "@/db/schema/orders";
import { eq, count, sql, desc } from "drizzle-orm";
import MerchantsClient from "./merchants-client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Merchants | Admin" };

export default async function MerchantsPage() {
  const [
    [{ value: totalRevenue }],
    merchantList,
  ] = await Promise.all([
    db.select({ value: sql<string>`COALESCE(SUM(${orders.total}::numeric), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")),
    db.select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      createdAt: tenants.createdAt,
      settings: tenants.settings,
      orderCount: sql<number>`(SELECT count(*) FROM orders WHERE orders.tenant_id = ${tenants.id})`,
      revenue: sql<string>`(SELECT COALESCE(SUM(total::numeric), 0) FROM orders WHERE orders.tenant_id = ${tenants.id} AND orders.payment_status = 'paid')`,
      productCount: sql<number>`(SELECT count(*) FROM products WHERE products.tenant_id = ${tenants.id})`,
    }).from(tenants).orderBy(desc(tenants.createdAt)).limit(100),
  ]);

  const serialized = merchantList.map(m => ({
    id: m.id,
    name: m.name,
    slug: m.slug,
    createdAt: m.createdAt?.toISOString() ?? null,
    orderCount: m.orderCount,
    revenue: m.revenue,
    productCount: m.productCount,
    suspended: !!(m.settings as Record<string, unknown> | null)?.suspended,
  }));

  return <MerchantsClient merchants={serialized} totalRevenue={totalRevenue} />;
}
