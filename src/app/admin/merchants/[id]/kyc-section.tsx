"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Clock, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { approveVerification, rejectVerification } from "../actions";
import type { TenantKyc } from "@/db/schema/tenant-kyc";

export function KycSection({ kyc, tenantId }: { kyc: TenantKyc | undefined; tenantId: string }) {
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState("");

  if (!kyc) {
    return (
      <div className="rounded-lg border border-dashed p-4 flex items-center gap-3">
        <AlertTriangle className="size-4 text-muted-foreground" />
        <p className="text-xs text-muted-foreground">Merchant has not submitted verification yet</p>
      </div>
    );
  }

  const statusIcon = { verified: ShieldCheck, pending: Clock, rejected: XCircle }[kyc.status];
  const statusColor = { verified: "text-success", pending: "text-warning", rejected: "text-destructive" }[kyc.status];
  const Icon = statusIcon;

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`size-4 ${statusColor}`} />
          <p className="text-sm font-medium">Verification</p>
        </div>
        <Badge className={`text-[10px] ${
          kyc.status === "verified" ? "bg-success/10 text-success" :
          kyc.status === "pending" ? "bg-warning/10 text-warning" :
          "bg-destructive/10 text-destructive"
        }`}>{kyc.status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><p className="text-muted-foreground">Name</p><p className="font-medium">{kyc.fullName}</p></div>
        <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{kyc.phone}</p></div>
        <div><p className="text-muted-foreground">Type</p><p className="font-medium capitalize">{kyc.businessType}</p></div>
        <div><p className="text-muted-foreground">PAN</p><p className="font-medium">{kyc.panNumber}</p></div>
        <div className="col-span-2"><p className="text-muted-foreground">Address</p><p className="font-medium">{kyc.businessAddress}</p></div>
        {kyc.registrationNumber && <div className="col-span-2"><p className="text-muted-foreground">Registration No.</p><p className="font-medium">{kyc.registrationNumber}</p></div>}
      </div>

      {kyc.status === "pending" && (
        <div className="flex items-center gap-2 pt-2 border-t">
          <Button size="sm" onClick={() => startTransition(async () => {
            const r = await approveVerification(tenantId);
            if (r.error) toast.error(r.error); else toast.success("Merchant verified");
          })} disabled={isPending}>Approve</Button>
          <Input placeholder="Rejection reason" value={reason} onChange={e => setReason(e.target.value)} className="flex-1 h-8 text-xs" />
          <Button size="sm" variant="outline" onClick={() => {
            if (!reason.trim()) { toast.error("Enter a rejection reason"); return; }
            startTransition(async () => {
              const r = await rejectVerification(tenantId, reason);
              if (r.error) toast.error(r.error); else { toast.success("Verification rejected"); setReason(""); }
            });
          }} disabled={isPending}>Reject</Button>
        </div>
      )}

      {kyc.rejectionReason && kyc.status === "rejected" && (
        <p className="text-xs text-destructive">Reason: {kyc.rejectionReason}</p>
      )}
    </div>
  );
}
