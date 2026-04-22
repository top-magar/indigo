"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Globe, RefreshCw } from "lucide-react";
import { AddDomainDialog, DomainCard } from "@/components/dashboard/domains";

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

  const getStatusBadge = (status: string) => (
    <Badge className={`text-[10px] px-1.5 py-0 capitalize ${STATUS_STYLE[status] || "bg-muted text-muted-foreground"}`}>
      {status}
    </Badge>
  );

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Domains</h1>
          <p className="text-xs text-muted-foreground">Connect a custom domain to your storefront</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} size="sm">
          <Plus className="size-3.5" />
          Add Domain
        </Button>
      </div>

      {loading ? (
        <div className="rounded-lg border divide-y">
          {[1, 2].map(i => (
            <div key={i} className="p-4 flex items-center gap-3">
              <Skeleton className="size-9 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-40" />
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
            Add a custom domain to give your store a professional URL
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
              showInstructions={newDomainInstructions?.domain.id === domain.id}
              instructions={newDomainInstructions?.domain.id === domain.id ? newDomainInstructions.instructions : undefined}
              onRemoved={() => handleDomainRemoved(domain.id)}
              onUpdated={handleDomainUpdated}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}

      <AddDomainDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onDomainAdded={handleDomainAdded} />
    </div>
  );
}
