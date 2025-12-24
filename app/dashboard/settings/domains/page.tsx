"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Globe02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
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
      const response = await fetch("/api/dashboard/domains");
      if (!response.ok) {
        throw new Error("Failed to fetch domains");
      }
      const data = await response.json();
      setDomains(data.domains || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load domains");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleDomainAdded = (domain: DomainRecord, instructions: DnsInstructions) => {
    setDomains((prev) => [...prev, domain]);
    setNewDomainInstructions({ domain, instructions });
    setAddDialogOpen(false);
  };

  const handleDomainRemoved = (domainId: string) => {
    setDomains((prev) => prev.filter((d) => d.id !== domainId));
    if (newDomainInstructions?.domain.id === domainId) {
      setNewDomainInstructions(null);
    }
  };

  const handleDomainUpdated = (updatedDomain: DomainRecord) => {
    setDomains((prev) =>
      prev.map((d) => (d.id === updatedDomain.id ? updatedDomain : d))
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-500/20">Active</Badge>;
      case "verified":
        return <Badge variant="default" className="bg-blue-500/10 text-blue-600 border-blue-500/20">Verified</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Custom Domains"
        description="Connect your own domain to your storefront"
      >
        <Button onClick={() => setAddDialogOpen(true)}>
          <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
          Add Domain
        </Button>
      </PageHeader>

      {/* Domain List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button variant="outline" onClick={fetchDomains}>
                <HugeiconsIcon icon={RefreshIcon} className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : domains.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <HugeiconsIcon icon={Globe02Icon} className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No custom domains</h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                Add a custom domain to give your storefront a professional look with your own branding.
              </p>
              <Button onClick={() => setAddDialogOpen(true)}>
                <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                Add Your First Domain
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              showInstructions={newDomainInstructions?.domain.id === domain.id}
              instructions={
                newDomainInstructions?.domain.id === domain.id
                  ? newDomainInstructions.instructions
                  : undefined
              }
              onRemoved={() => handleDomainRemoved(domain.id)}
              onUpdated={handleDomainUpdated}
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
      )}

      {/* Add Domain Dialog */}
      <AddDomainDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onDomainAdded={handleDomainAdded}
      />
    </div>
  );
}
