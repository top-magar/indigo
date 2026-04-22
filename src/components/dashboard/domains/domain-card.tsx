"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Globe, Trash2, RefreshCw, ChevronDown, CheckCircle, AlertCircle, Clock, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/shared/utils";

interface DomainRecord {
  id: string; tenantId: string; domain: string; verificationToken: string;
  verificationMethod: string; status: string; vercelDomainId: string | null;
  errorMessage: string | null; createdAt: string; verifiedAt: string | null;
}

interface DnsInstructions {
  method: string;
  records: Array<{ type: string; name: string; value: string }>;
  instructions: string;
}

interface DomainCardProps {
  domain: DomainRecord;
  showInstructions?: boolean;
  instructions?: DnsInstructions;
  onRemoved: () => void;
  onUpdated: (domain: DomainRecord) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

const STATUS_ICON = {
  active: <CheckCircle className="size-4 text-success" />,
  verified: <CheckCircle className="size-4 text-info" />,
  pending: <Clock className="size-4 text-warning" />,
  failed: <AlertCircle className="size-4 text-destructive" />,
} as Record<string, React.ReactNode>;

export function DomainCard({ domain, showInstructions = false, instructions, onRemoved, onUpdated, getStatusBadge }: DomainCardProps) {
  const [verifying, setVerifying] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [dnsOpen, setDnsOpen] = useState(showInstructions);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyError(null);
    try {
      const res = await fetch(`/api/dashboard/domains/${domain.id}/verify`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.success) { setVerifyError(data.error || "Verification failed"); return; }
      if (data.domain) onUpdated(data.domain);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);
    try {
      const res = await fetch(`/api/dashboard/domains/${domain.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to remove");
      onRemoved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to remove domain");
    } finally {
      setRemoving(false);
    }
  };

  const isPending = domain.status === "pending" || domain.status === "failed";

  return (
    <div className="p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          {STATUS_ICON[domain.status] || <Globe className="size-4 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{domain.domain}</p>
            {getStatusBadge(domain.status)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            Added {new Date(domain.createdAt).toLocaleDateString()}
            {domain.status === "pending" && " · Waiting for DNS verification"}
            {domain.status === "active" && " · SSL active"}
            {domain.status === "verified" && " · Provisioning SSL"}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {isPending && (
            <Button variant="outline" size="icon" className="size-8" onClick={handleVerify} disabled={verifying}>
              {verifying ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            </Button>
          )}
          {domain.status === "verified" && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleVerify} disabled={verifying}>
              {verifying ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
              Check SSL
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                <Trash2 className="size-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Domain</AlertDialogTitle>
                <AlertDialogDescription>
                  Remove <strong>{domain.domain}</strong>? This disconnects it from your storefront.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRemove} disabled={removing} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {removing ? "Removing…" : "Remove"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Error */}
      {domain.status === "failed" && domain.errorMessage && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="size-3.5" />
          <AlertDescription className="text-xs">{domain.errorMessage}</AlertDescription>
        </Alert>
      )}

      {verifyError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="size-3.5" />
          <AlertDescription className="text-xs">{verifyError}</AlertDescription>
        </Alert>
      )}

      {/* DNS Instructions */}
      {isPending && (
        <Collapsible open={dnsOpen} onOpenChange={setDnsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className={cn("size-3 transition-transform", dnsOpen && "rotate-180")} />
            DNS Configuration
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            <DnsPanel domain={domain.domain} />
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}

function DnsRecord({ type, name, value }: { type: string; name: string; value: string }) {
  return (
    <div className="grid grid-cols-[60px_1fr_1fr] gap-2 text-xs">
      <div>
        <p className="text-[10px] text-muted-foreground mb-0.5">Type</p>
        <code className="bg-background px-1.5 py-0.5 rounded border text-[11px]">{type}</code>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground mb-0.5">Name</p>
        <code className="bg-background px-1.5 py-0.5 rounded border text-[11px] block truncate">{name}</code>
      </div>
      <div className="min-w-0 flex items-end gap-1">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground mb-0.5">Value</p>
          <code className="bg-background px-1.5 py-0.5 rounded border text-[11px] block truncate">{value}</code>
        </div>
        <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => { navigator.clipboard.writeText(value); toast.success("Copied"); }}>
          <Copy className="size-3" />
        </Button>
      </div>
    </div>
  );
}

function DnsPanel({ domain }: { domain: string }) {
  return (
    <div className="rounded-md border bg-muted/30 p-3 space-y-3">
      <div className="space-y-2">
        <p className="text-[11px] font-medium">CNAME Record (recommended)</p>
        <DnsRecord type="CNAME" name={domain} value="cname.vercel-dns.com" />
      </div>
      <div className="space-y-2">
        <p className="text-[11px] font-medium">A Record (alternative)</p>
        <DnsRecord type="A" name="@" value="76.76.21.21" />
      </div>
      <p className="text-[10px] text-muted-foreground">DNS changes can take up to 48 hours to propagate.</p>
    </div>
  );
}
