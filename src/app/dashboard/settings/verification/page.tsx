import { requireUser } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenantKyc } from "@/db/schema/tenant-kyc";
import { eq } from "drizzle-orm";
import { ShieldCheck, Clock, XCircle } from "lucide-react";
import VerificationForm from "./verification-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verification | Settings" };

function StatusBanner({ kyc }: { kyc: typeof tenantKyc.$inferSelect }) {
  if (kyc.status === "verified") return (
    <div className="rounded-lg bg-success/10 p-4 flex items-start gap-3" role="status">
      <ShieldCheck className="size-4 text-success shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-success">Store Verified</p>
        <p className="text-xs text-success/80">Verified on {kyc.verifiedAt?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}. Your store is live.</p>
      </div>
    </div>
  );
  if (kyc.status === "pending") return (
    <div className="rounded-lg bg-warning/10 p-4 flex items-start gap-3" role="status">
      <Clock className="size-4 text-warning shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-warning">Under Review</p>
        <p className="text-xs text-warning/80">We'll review your submission within 1–2 business days.</p>
      </div>
    </div>
  );
  if (kyc.status === "rejected") return (
    <div className="rounded-lg bg-destructive/10 p-4 flex items-start gap-3" role="alert">
      <XCircle className="size-4 text-destructive shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-destructive">Changes Needed</p>
        <p className="text-xs text-destructive/80">{kyc.rejectionReason || "Update your details below and resubmit."}</p>
      </div>
    </div>
  );
  return null;
}

function SubmittedDetails({ kyc }: { kyc: typeof tenantKyc.$inferSelect }) {
  const fields = [
    ["Full Name", kyc.fullName],
    ["Phone", kyc.phone],
    ["Business Type", kyc.businessType],
    ["Address", kyc.businessAddress],
    ["PAN Number", kyc.panNumber],
    ...(kyc.registrationNumber ? [["Registration No.", kyc.registrationNumber]] : []),
  ] as const;

  return (
    <div className="rounded-lg border p-4">
      <p className="text-sm font-medium mb-3">Submitted Details</p>
      <div className="grid grid-cols-2 gap-3 text-xs">
        {fields.map(([label, value]) => (
          <div key={label}>
            <p className="text-muted-foreground">{label}</p>
            <p className="font-medium capitalize">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function VerificationPage() {
  const user = await requireUser();
  const [kyc] = await db.select()
    .from(tenantKyc).where(eq(tenantKyc.tenantId, user.tenantId)).limit(1);

  const showForm = !kyc || kyc.status === "rejected";

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Store Verification</h2>
        <p className="text-xs text-muted-foreground">
          Required under Nepal's E-Commerce Act 2081 to publish your store and accept payments.
          {!kyc && " You can set up products and design your store while we review."}
        </p>
      </div>

      {kyc && <StatusBanner kyc={kyc} />}

      {showForm && (
        <VerificationForm existing={kyc ? {
          fullName: kyc.fullName, phone: kyc.phone, businessType: kyc.businessType,
          businessAddress: kyc.businessAddress, panNumber: kyc.panNumber,
          registrationNumber: kyc.registrationNumber,
        } : undefined} />
      )}

      {(kyc?.status === "pending" || kyc?.status === "verified") && (
        <SubmittedDetails kyc={kyc} />
      )}

      {showForm && (
        <p className="text-[10px] text-muted-foreground">
          Your PAN is stored securely and only visible to platform administrators. Non-compliance with the E-Commerce Act 2081 may result in fines of NPR 20,000–500,000.
        </p>
      )}
    </div>
  );
}
