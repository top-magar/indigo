import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { orders } from "@/db/schema/orders";
import { products } from "@/db/schema/products";
import { auditLogs } from "@/db/schema/audit-logs";
import { count, sql, desc, gte } from "drizzle-orm";
import { formatCurrency } from "@/shared/utils";
import Link from "next/link";
import { requireAdmin } from "./_lib/auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Overview | Admin" };

export default async function AdminOverviewPage() {
  await requireAdmin();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  // Batch 1: simple counts
  const [
    [{ value: totalMerchants }],
    [{ value: totalOrders }],
    [{ value: totalProducts }],
  ] = await Promise.all([
    db.select({ value: count() }).from(tenants),
    db.select({ value: count() }).from(orders),
    db.select({ value: count() }).from(products),
  ]);

  // Batch 2: aggregates + lists (sequential to avoid pool exhaustion)
  const [{ value: newMerchants }] = await db.select({ value: count() }).from(tenants).where(gte(tenants.createdAt, thirtyDaysAgo));
  const [{ value: totalRevenue }] = await db.select({ value: sql<string>`COALESCE(SUM(${orders.total}), 0)` }).from(orders);
  const [{ value: recentRevenue }] = await db.select({ value: sql<string>`COALESCE(SUM(${orders.total}), 0)` }).from(orders).where(gte(orders.createdAt, thirtyDaysAgo));

  const recentTenants = await db.select({ id: tenants.id, name: tenants.name, slug: tenants.slug, createdAt: tenants.createdAt })
    .from(tenants).orderBy(desc(tenants.createdAt)).limit(5);

  const recentOrders = await db.select({
    id: orders.id, orderNumber: orders.orderNumber, total: orders.total,
    status: orders.status, createdAt: orders.createdAt,
  }).from(orders).orderBy(desc(orders.createdAt)).limit(6);

  const dailyRevenue = await db.select({
    day: sql<string>`TO_CHAR(${orders.createdAt}, 'Mon DD')`,
    revenue: sql<string>`COALESCE(SUM(${orders.total}), 0)`,
  }).from(orders)
    .where(gte(orders.createdAt, new Date(Date.now() - 14 * 86400000)))
    .groupBy(sql`DATE(${orders.createdAt}), TO_CHAR(${orders.createdAt}, 'Mon DD')`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  const recentAuditLogs = await db.select({
    id: auditLogs.id, action: auditLogs.action, userId: auditLogs.userId,
    entityType: auditLogs.entityType, newValues: auditLogs.newValues,
    metadata: auditLogs.metadata, createdAt: auditLogs.createdAt,
  }).from(auditLogs).where(sql`${auditLogs.metadata}->>'source' = 'admin'`).orderBy(desc(auditLogs.createdAt)).limit(8);

  // Build chart bars
  const maxRevenue = Math.max(...dailyRevenue.map(d => Number(d.revenue)), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Platform Overview</h1>
        <p className="text-xs text-muted-foreground">Real-time metrics across all merchants</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Merchants", value: totalMerchants, sub: `+${newMerchants} this month` },
          { label: "Total GMV", value: formatCurrency(Number(totalRevenue), "NPR"), sub: `${formatCurrency(Number(recentRevenue), "NPR")} last 30d` },
          { label: "Orders", value: totalOrders },
          { label: "Products", value: totalProducts },
        ].map(m => (
          <div key={m.label} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{m.label}</p>
            <p className="text-lg font-semibold tracking-tight tabular-nums mt-1">{m.value}</p>
            {m.sub && <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>}
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium">Platform Revenue (14 days)</p>
            <p className="text-xs text-muted-foreground">{formatCurrency(Number(recentRevenue), "NPR")} total</p>
          </div>
        </div>
        {dailyRevenue.length > 0 ? (
          <div className="flex items-end gap-1.5" style={{ height: 120 }}>
            {dailyRevenue.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm bg-foreground/80 hover:bg-foreground transition-colors min-h-[2px]"
                  style={{ height: `${Math.max((Number(d.revenue) / maxRevenue) * 100, 2)}%` }}
                  title={`${d.day}: ${formatCurrency(Number(d.revenue), "NPR")}`}
                />
                <span className="text-[10px] text-muted-foreground truncate w-full text-center">{d.day?.split(" ")[1]}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-8">No revenue data yet</p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {/* Recent merchants */}
        <div className="rounded-lg border">
          <div className="flex items-center justify-between p-4 border-b">
            <p className="text-sm font-medium">New Merchants</p>
            <Link href="/admin/merchants" className="text-xs text-muted-foreground hover:text-foreground">View all →</Link>
          </div>
          <div className="divide-y">
            {recentTenants.map(t => (
              <Link key={t.id} href={`/admin/merchants/${t.id}`} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-md bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                    {t.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.slug}.indigo.store</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t.createdAt ? new Date(t.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                </p>
              </Link>
            ))}
            {recentTenants.length === 0 && <p className="p-4 text-xs text-muted-foreground text-center">No merchants yet</p>}
          </div>
        </div>

        {/* Recent orders */}
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <p className="text-sm font-medium">Recent Orders (All Stores)</p>
          </div>
          <div className="divide-y">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums">{formatCurrency(Number(o.total), "NPR")}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{o.status}</p>
                </div>
              </div>
            ))}
            {recentOrders.length === 0 && <p className="p-4 text-xs text-muted-foreground text-center">No orders yet</p>}
          </div>
        </div>
      </div>

      {/* Audit Log */}
      {recentAuditLogs.length > 0 && (
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <p className="text-sm font-medium">Recent Admin Activity</p>
          </div>
          <div className="divide-y">
            {recentAuditLogs.map(log => {
              const meta = log.metadata as Record<string, unknown> | null;
              const vals = log.newValues as Record<string, unknown> | null;
              return (
                <div key={log.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">{((meta?.actorEmail as string) ?? "admin").split("@")[0]}</span>
                      <span className="text-muted-foreground"> {(log.action ?? "").replace(".", " → ")}</span>
                      {!!vals?.targetName && <span className="font-medium"> {String(vals.targetName)}</span>}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground shrink-0">
                    {log.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
