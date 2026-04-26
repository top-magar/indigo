import { db } from "@/infrastructure/db";
import { tenantKyc } from "@/db/schema/tenant-kyc";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ShieldAlert, ArrowRight } from "lucide-react";

export async function VerificationBanner({ tenantId }: { tenantId: string }) {
  const [kyc] = await db.select({ status: tenantKyc.status })
    .from(tenantKyc).where(eq(tenantKyc.tenantId, tenantId)).limit(1);

  // Don't show if verified
  if (kyc?.status === "verified") return null;

  const message = !kyc
    ? "Verify your store to start selling. Your store won't be visible to customers until verified."
    : kyc.status === "pending"
    ? "Your verification is under review. We'll notify you once it's approved."
    : "Your verification was rejected. Please update your information and resubmit.";

  const showLink = !kyc || kyc.status === "rejected";

  return (
    <div className="mb-4 rounded-lg bg-warning/10 p-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <ShieldAlert className="size-4 text-warning shrink-0" />
        <p className="text-xs text-warning">{message}</p>
      </div>
      {showLink && (
        <Link href="/dashboard/settings/verification" className="flex items-center gap-1 text-xs font-medium text-warning hover:underline shrink-0">
          Verify now <ArrowRight className="size-3" />
        </Link>
      )}
    </div>
  );
}
