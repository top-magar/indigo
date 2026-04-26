import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getTenantPlanLimits } from "@/lib/plan-limits";
import { getPaymentSettings } from "./actions";
import { PaymentsSettingsClient } from "./payments-settings-client";
import { Lock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Payment Settings | Dashboard",
  description: "Configure payment methods and bank details.",
};

export default async function PaymentsSettingsPage() {
  const user = await requireUser();
  const limits = await getTenantPlanLimits(user.tenantId);

  const { settings, error } = await getPaymentSettings();
  if (error === "Unauthorized" || error === "No tenant") redirect("/login");

  return (
    <div className="space-y-6">
      <PaymentsSettingsClient initialSettings={settings} isFreeTier={limits.planName === "Free"} />

      {limits.planName === "Free" && (
        <div className="rounded-lg border border-dashed p-4 flex items-start gap-3">
          <Lock className="size-4 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Online payment integrations require a paid plan</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upgrade to Growth to connect payment gateways and accept online payments. Free plan supports Cash on Delivery only.
            </p>
            <Link href="/dashboard/settings/billing" className="text-xs font-medium underline hover:no-underline mt-1 inline-block">View plans →</Link>
          </div>
        </div>
      )}
    </div>
  );
}
