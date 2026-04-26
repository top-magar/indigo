import { db } from "@/infrastructure/db";
import { tenants } from "@/db/schema/tenants";
import { tenantKyc } from "@/db/schema/tenant-kyc";
import { orders } from "@/db/schema/orders";
import { products } from "@/db/schema/products";
import { customers } from "@/db/schema/customers";
import { users } from "@/db/schema/users";
import { eq, count, sql, desc, gte, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/shared/utils";
import { KycSection } from "./kyc-section";
import { requirePermission } from "../../_lib/permissions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Merchant Detail | Admin" };

export default async function MerchantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("view_merchants");
  const { id } = await params;
  const [tenant] = await db.select({
    id: tenants.id,
    name: tenants.name,
    slug: tenants.slug,
    currency: tenants.currency,
    settings: tenants.settings,
    createdAt: tenants.createdAt,
  }).from(tenants).where(eq(tenants.id, id)).limit(1);
  if (!tenant) notFound();

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [
    [{ value: totalOrders }],
    [{ value: totalRevenue }],
    [{ value: totalProducts }],
    [{ value: totalCustomers }],
    [{ value: recentRevenue }],
    teamMembers,
    latestOrders,
  ] = await Promise.all([
    db.select({ value: count() }).from(orders).where(eq(orders.tenantId, id)),
    db.select({ value: sql<string>`COALESCE(SUM(${orders.total}), 0)` }).from(orders).where(eq(orders.tenantId, id)),
    db.select({ value: count() }).from(products).where(eq(products.tenantId, id)),
    db.select({ value: count() }).from(customers).where(eq(customers.tenantId, id)),
    db.select({ value: sql<string>`COALESCE(SUM(${orders.total}), 0)` }).from(orders).where(and(eq(orders.tenantId, id), gte(orders.createdAt, thirtyDaysAgo))),
    db.select({ id: users.id, email: users.email, fullName: users.fullName, role: users.role }).from(users).where(eq(users.tenantId, id)),
    db.select({ id: orders.id, orderNumber: orders.orderNumber, total: orders.total, status: orders.status, createdAt: orders.createdAt }).from(orders).where(eq(orders.tenantId, id)).orderBy(desc(orders.createdAt)).limit(5),
  ]);

  // KYC status
  const [kyc] = await db.select().from(tenantKyc).where(eq(tenantKyc.tenantId, id)).limit(1);

  const currency = tenant.currency || "NPR";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/merchants" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3">
          <ArrowLeft className="size-3.5" /> Back to Merchants
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-muted flex items-center justify-center">
              <Store className="size-5 text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight">{tenant.name}</h1>
                {!!(tenant.settings as Record<string, unknown> | null)?.suspended && (
                  <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{tenant.slug}.indigo.store</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/store/${tenant.slug}`} target="_blank">
                <ExternalLink className="size-3.5" /> View Store
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "All-time Revenue", value: formatCurrency(Number(totalRevenue), currency) },
          { label: "Last 30 Days", value: formatCurrency(Number(recentRevenue), currency) },
          { label: "Orders", value: totalOrders },
          { label: "Products", value: totalProducts },
        ].map(s => (
          <div key={s.label} className="rounded-lg border p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-semibold tracking-tight tabular-nums mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        {/* Team */}
        <div className="rounded-lg border">
          <div className="p-3 border-b"><p className="text-sm font-medium">Team ({teamMembers.length})</p></div>
          <div className="divide-y">
            {teamMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold text-muted-foreground">
                    {(m.fullName?.[0] || m.email[0]).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.fullName || m.email}</p>
                    <p className="text-[11px] text-muted-foreground">{m.email}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">{m.role}</Badge>
              </div>
            ))}
            {teamMembers.length === 0 && <p className="p-4 text-xs text-muted-foreground text-center">No team members</p>}
          </div>
        </div>

        {/* Recent orders */}
        <div className="rounded-lg border">
          <div className="p-3 border-b"><p className="text-sm font-medium">Recent Orders</p></div>
          <div className="divide-y">
            {latestOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-medium">{o.orderNumber}</p>
                  <p className="text-[11px] text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium tabular-nums">{formatCurrency(Number(o.total), currency)}</p>
                  <Badge variant="outline" className="text-[10px] capitalize">{o.status}</Badge>
                </div>
              </div>
            ))}
            {latestOrders.length === 0 && <p className="p-4 text-xs text-muted-foreground text-center">No orders yet</p>}
          </div>
        </div>
      </div>

      {/* KYC Verification */}
      <KycSection kyc={kyc} tenantId={id} />

      {/* Store metadata */}
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium mb-3">Store Details</p>
        <div className="grid grid-cols-2 gap-y-2 text-xs">
          <div><span className="text-muted-foreground">ID:</span> <span className="font-mono text-[11px]">{tenant.id}</span></div>
          <div><span className="text-muted-foreground">Slug:</span> {tenant.slug}</div>
          <div><span className="text-muted-foreground">Currency:</span> {currency}</div>
          <div><span className="text-muted-foreground">Customers:</span> {totalCustomers}</div>
          <div><span className="text-muted-foreground">Created:</span> {tenant.createdAt ? new Date(tenant.createdAt).toLocaleString() : "—"}</div>
        </div>
      </div>
    </div>
  );
}
