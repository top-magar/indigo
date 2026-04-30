import { requireUser } from "@/lib/auth";
import { getTenantPlanLimits } from "@/lib/plan-limits";
import { getDomains } from "@/infrastructure/services/domain";
import { Lock } from "lucide-react";
import Link from "next/link";
import DomainsClient from "./domains-client";

export default async function DomainsPage() {
  const user = await requireUser();
  const limits = await getTenantPlanLimits(user.tenantId);

  if (limits.planName === "Free") {
    return (
      <div className="max-w-2xl flex flex-col items-center justify-center py-24 gap-4">
        <div className="size-12 rounded-md bg-muted flex items-center justify-center">
          <Lock className="size-5 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold tracking-tight">Custom domains require a paid plan</h2>
          <p className="text-xs text-muted-foreground mt-1">Upgrade to Growth to connect your own domain.</p>
        </div>
        <Link href="/dashboard/settings/billing" className="text-xs font-medium underline hover:no-underline">View plans →</Link>
      </div>
    );
  }

  let initialDomains: Parameters<typeof DomainsClient>[0]["initialDomains"] = [];
  try {
    const raw = await getDomains();
    initialDomains = raw.map(d => ({ ...d, createdAt: d.createdAt instanceof Date ? d.createdAt.toISOString() : d.createdAt, verifiedAt: d.verifiedAt instanceof Date ? d.verifiedAt.toISOString() : d.verifiedAt })) as typeof initialDomains;
  } catch {}

  return <DomainsClient initialDomains={initialDomains} />;
}
