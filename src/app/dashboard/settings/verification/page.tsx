import { requireUser } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { tenantKyc } from "@/db/schema/tenant-kyc";
import { eq } from "drizzle-orm";
import { ShieldCheck, Clock, XCircle, AlertTriangle } from "lucide-react";
import VerificationForm from "./verification-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Verification | Settings" };

export default async function VerificationPage() {
  const user = await requireUser();

  const [kyc] = await db.select()
    .from(tenantKyc).where(eq(tenantKyc.tenantId, user.tenantId)).limit(1);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Store Verification</h2>
        <p className="text-xs text-muted-foreground">Verify your identity to publish your store and start selling</p>
      </div>

      {/* Status banner */}
      {kyc?.status === "verified" && (
        <div className="rounded-lg bg-success/10 p-4 flex items-start gap-3">
          <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-success">Store Verified</p>
            <p className="text-xs text-success/80">Your store is verified and live. Verified on {kyc.verifiedAt?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.</p>
          </div>
        </div>
      )}

      {kyc?.status === "pending" && (
        <div className="rounded-lg bg-warning/10 p-4 flex items-start gap-3">
          <Clock className="size-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">Verification Pending</p>
            <p className="text-xs text-warning/80">We're reviewing your submission. This usually takes 1-2 business days.</p>
          </div>
        </div>
      )}

      {kyc?.status === "rejected" && (
        <div className="rounded-lg bg-destructive/10 p-4 flex items-start gap-3">
          <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Verification Rejected</p>
            <p className="text-xs text-destructive/80">{kyc.rejectionReason || "Please update your information and resubmit."}</p>
          </div>
        </div>
      )}

      {/* Why verification */}
      {!kyc && (
        <div className="rounded-lg border border-dashed p-4 flex items-start gap-3">
          <AlertTriangle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Why do I need to verify?</p>
            <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <li>• Required by Nepal E-Commerce Act 2081 for all online sellers</li>
              <li>• Builds trust with your customers</li>
              <li>• Your store can't go live until verified</li>
              <li>• Your PAN number is kept confidential</li>
            </ul>
          </div>
        </div>
      )}

      {/* What you can/can't do before verification */}
      {kyc?.status !== "verified" && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium mb-3">Before Verification</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-success mb-1.5">✓ You can</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Set up your store (name, logo, theme)</li>
                <li>• Add products and categories</li>
                <li>• Configure payment methods</li>
                <li>• Build pages with the visual editor</li>
                <li>• Invite team members</li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-medium text-destructive mb-1.5">✗ You cannot</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Publish your store (customers can't see it)</li>
                <li>• Accept orders or payments</li>
                <li>• Process COD, eSewa, or Khalti transactions</li>
                <li>• Use a custom domain</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Nepal E-Commerce Act 2081 */}
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-xs font-medium mb-2">Nepal E-Commerce Act 2081 (2025)</p>
        <p className="text-xs text-muted-foreground">
          Under the Electronic Commerce Act 2081, all online sellers in Nepal must register with the 
          Department of Commerce, Supplies and Consumer Protection (DoCSCP) and display their business 
          registration details, PAN/VAT number, and contact information on their platform. 
          Non-compliance may result in fines of NPR 20,000 to NPR 500,000.
        </p>
        <div className="flex flex-wrap gap-3 mt-2">
          <a href="https://giwmscdnone.gov.np/media/files/E-Commerce%20Act%2C%202081_yr7k9o5.pdf" target="_blank" rel="noopener noreferrer" className="text-xs text-foreground underline hover:no-underline">Official Act (PDF) →</a>
          <a href="https://shrigo.com/blogs/1175-e-commerce-registration-process-in-nepal-2025-everything-you-need-to-know" target="_blank" rel="noopener noreferrer" className="text-xs text-foreground underline hover:no-underline">Registration guide →</a>
          <a href="https://notarynepal.com/blog/e-commerce-act-nepal-2025" target="_blank" rel="noopener noreferrer" className="text-xs text-foreground underline hover:no-underline">Key rules & penalties →</a>
        </div>
      </div>

      {kyc?.status !== "verified" && kyc?.status !== "pending" && (
        <VerificationForm existing={kyc ? {
          fullName: kyc.fullName, phone: kyc.phone, businessType: kyc.businessType,
          businessAddress: kyc.businessAddress, panNumber: kyc.panNumber,
          registrationNumber: kyc.registrationNumber,
        } : undefined} />
      )}

      {/* Submitted details (read-only when pending/verified) */}
      {(kyc?.status === "pending" || kyc?.status === "verified") && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium mb-3">Submitted Information</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div><p className="text-muted-foreground">Full Name</p><p className="font-medium">{kyc.fullName}</p></div>
            <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{kyc.phone}</p></div>
            <div><p className="text-muted-foreground">Business Type</p><p className="font-medium capitalize">{kyc.businessType}</p></div>
            <div><p className="text-muted-foreground">Address</p><p className="font-medium">{kyc.businessAddress}</p></div>
            <div><p className="text-muted-foreground">PAN Number</p><p className="font-medium">{kyc.panNumber}</p></div>
            {kyc.registrationNumber && <div><p className="text-muted-foreground">Registration No.</p><p className="font-medium">{kyc.registrationNumber}</p></div>}
          </div>
        </div>
      )}
    </div>
  );
}
