import { requireUser } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenantKyc } from "@/db/schema/tenant-kyc";
import { eq } from "drizzle-orm";
import { ShieldCheck, Clock, AlertCircle } from "lucide-react";
import VerificationForm from "./verification-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verification | Settings" };

export default async function VerificationPage() {
  const user = await requireUser();
  const [kyc] = await db.select().from(tenantKyc).where(eq(tenantKyc.tenantId, user.tenantId)).limit(1);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Store Verification</h2>
        <p className="text-xs text-muted-foreground">
          Required under Nepal's E-Commerce Act 2081 to publish your store.
          {kyc?.status !== "verified" && " You can set up products and design your store while we review."}
        </p>
      </div>

      {/* Status */}
      {kyc?.status === "verified" && (
        <div className="rounded-lg bg-success/10 p-4 flex items-center gap-3" role="status">
          <ShieldCheck className="size-4 text-success shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-success">Verified</p>
            <p className="text-xs text-success/80">
              Your store is live. Verified {kyc.verifiedAt?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.
            </p>
          </div>
        </div>
      )}

      {kyc?.status === "pending" && (
        <div className="rounded-lg bg-warning/10 p-4 flex items-center gap-3" role="status">
          <Clock className="size-4 text-warning shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-warning">Under Review</p>
            <p className="text-xs text-warning/80">We're reviewing your submission. This usually takes 1–2 business days.</p>
          </div>
        </div>
      )}

      {kyc?.status === "rejected" && (
        <div className="rounded-lg bg-destructive/10 p-4 flex items-center gap-3" role="alert">
          <AlertCircle className="size-4 text-destructive shrink-0" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-destructive">Changes Needed</p>
            <p className="text-xs text-destructive/80">{kyc.rejectionReason || "Please update your details and resubmit."}</p>
          </div>
        </div>
      )}

      {/* Form — primary action, shown first for new/rejected */}
      {kyc?.status !== "verified" && kyc?.status !== "pending" && (
        <VerificationForm existing={kyc ? {
          fullName: kyc.fullName, phone: kyc.phone, businessType: kyc.businessType,
          businessAddress: kyc.businessAddress, panNumber: kyc.panNumber,
          registrationNumber: kyc.registrationNumber,
        } : undefined} />
      )}

      {/* Submitted details — read-only when pending/verified */}
      {(kyc?.status === "pending" || kyc?.status === "verified") && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium mb-3">Submitted Details</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              ["Full Name", kyc.fullName],
              ["Phone", kyc.phone],
              ["Business Type", kyc.businessType === "company" ? "Company" : "Individual"],
              ["PAN Number", kyc.panNumber.replace(/^(\d{3})/, "***").slice(0, 9)],
              ["Address", kyc.businessAddress],
              ...(kyc.registrationNumber ? [["Registration No.", kyc.registrationNumber]] : []),
            ].map(([label, value]) => (
              <div key={label as string}>
                <p className="text-muted-foreground">{label}</p>
                <p className="font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fine print */}
      <p className="text-[10px] text-muted-foreground">
        Your PAN number is encrypted and only visible to platform administrators. 
        All online sellers in Nepal must verify their identity under the E-Commerce Act 2081. 
        Non-compliance may result in fines up to NPR 500,000.
      </p>
    </div>
  );
}
