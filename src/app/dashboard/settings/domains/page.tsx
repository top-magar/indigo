"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Globe, RefreshCw, ExternalLink, Copy, Shield } from "lucide-react";
import { toast } from "sonner";
import { AddDomainDialog, DomainCard } from "@/components/dashboard/domains";

import { createClient } from "@/infrastructure/supabase/client";

interface DomainRecord {
  id: string;
  tenantId: string;
  domain: string;
  verificationToken: string;
  verificationMethod: string;
  status: string;
  vercelDomainId: string | null;
  errorMessage: string | null;
  createdAt: string;
  verifiedAt: string | null;
  isPrimary?: boolean;
}

interface DnsInstructions {
  method: string;
  records: Array<{ type: string; name: string; value: string }>;
  instructions: string;
}

const STATUS_STYLE: Record<string, string> = {
  active: "bg-success/10 text-success",
  verified: "bg-info/10 text-info",
  pending: "bg-warning/10 text-warning",
  failed: "bg-destructive/10 text-destructive",
};

export default function DomainsSettingsPage() {
  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newDomainInstructions, setNewDomainInstructions] = useState<{
    domain: DomainRecord;
    instructions: DnsInstructions;
  } | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/dashboard/domains");
      if (!res.ok) throw new Error("Failed to fetch domains");
      setDomains((await res.json()).domains || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load domains");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDomains(); }, [fetchDomains]);

  const handleDomainAdded = (domain: DomainRecord, instructions: DnsInstructions) => {
    setDomains(prev => [...prev, domain]);
    setNewDomainInstructions({ domain, instructions });
    setAddDialogOpen(false);
  };

  const handleDomainRemoved = (domainId: string) => {
    setDomains(prev => prev.filter(d => d.id !== domainId));
    if (newDomainInstructions?.domain.id === domainId) setNewDomainInstructions(null);
  };

  const handleDomainUpdated = (updated: DomainRecord) => {
    setDomains(prev => prev.map(d => d.id === updated.id ? updated : d));
  };

  const handleSetPrimary = async (domainId: string) => {
    try {
      const res = await fetch(`/api/dashboard/domains/${domainId}/primary`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to set primary domain");
      setDomains(prev => prev.map(d => ({ ...d, isPrimary: d.id === domainId })));
      toast.success("Primary domain updated");
    } catch {
      toast.error("Failed to set primary domain");
    }
  };

  const getStatusBadge = (status: string) => (
    <Badge className={`text-[10px] px-1.5 py-0 capitalize ${STATUS_STYLE[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </Badge>
  );

  const activeDomains = domains.filter(d => d.status === "active").length;
  const pendingDomains = domains.filter(d => d.status === "pending" || d.status === "failed").length;

  const [storeSlug, setStoreSlug] = useState("your-store");

  useEffect(() => {
    async function fetchSlug() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from("users").select("tenant_id").eq("id", user.id).single();
      if (!data?.tenant_id) return;
      const { data: tenant } = await supabase.from("tenants").select("slug").eq("id", data.tenant_id).single();
      if (tenant?.slug) setStoreSlug(tenant.slug);
    }
    fetchSlug();
  }, []);


  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Domains</h1>
          <p className="text-xs text-muted-foreground">Connect custom domains to your storefront</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} size="sm">
          <Plus className="size-3.5" />
          Add Domain
        </Button>
      </div>

      {/* Default subdomain — always visible */}
      <div className="rounded-lg border">
        <div className="p-4 flex items-center gap-3">
          <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
            <Shield className="size-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{storeSlug}.indigo.com</p>
              <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">Default</Badge>
            </div>
            <p className="text-xs text-muted-foreground">Free subdomain · Always active · SSL included</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="outline" size="icon" className="size-8" onClick={() => { navigator.clipboard.writeText(`https://${storeSlug}.indigo.com`); toast.success("Copied"); }}>
              <Copy className="size-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="size-8" asChild>
              <a href={`https://${storeSlug}.indigo.com`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-3.5" /></a>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar — only when domains exist */}
      {domains.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span><span className="font-medium text-foreground tabular-nums">{domains.length}</span> custom domain{domains.length !== 1 ? "s" : ""}</span>
          {activeDomains > 0 && <span><span className="font-medium text-success tabular-nums">{activeDomains}</span> active</span>}
          {pendingDomains > 0 && <span><span className="font-medium text-warning tabular-nums">{pendingDomains}</span> pending</span>}
        </div>
      )}

      {/* Domain list */}
      {loading ? (
        <div className="rounded-lg border divide-y">
          {[1, 2].map(i => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="size-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-sm text-destructive mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchDomains}>
            <RefreshCw className="size-3.5" />
            Retry
          </Button>
        </div>
      ) : domains.length === 0 ? (
        <div className="rounded-lg border p-10 text-center">
          <div className="mx-auto size-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <Globe className="size-4 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium mb-1">No custom domains</p>
          <p className="text-xs text-muted-foreground mb-4 max-w-xs mx-auto">
            Add a custom domain to give your store a professional URL. Your free subdomain above will always work.
          </p>
          <Button onClick={() => setAddDialogOpen(true)} size="sm">
            <Plus className="size-3.5" />
            Add Domain
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border divide-y">
          {domains.map(domain => (
            <DomainCard
              key={domain.id}
              domain={domain}
              isPrimary={domain.isPrimary ?? false}
              showInstructions={newDomainInstructions?.domain.id === domain.id}
              instructions={newDomainInstructions?.domain.id === domain.id ? newDomainInstructions.instructions : undefined}
              onRemoved={() => handleDomainRemoved(domain.id)}
              onUpdated={handleDomainUpdated}
              onSetPrimary={() => handleSetPrimary(domain.id)}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}

      {/* Info footer */}
      <p className="text-[10px] text-muted-foreground text-center">
        SSL certificates are automatically provisioned and renewed via Let&apos;s Encrypt. DNS changes can take up to 48 hours.
      </p>

      <AddDomainDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onDomainAdded={handleDomainAdded} />
    </div>
  );
}
