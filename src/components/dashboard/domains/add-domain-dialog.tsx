"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { HugeiconsIcon } from "@hugeicons/react";
import { 
  Globe02Icon, 
  InformationCircleIcon,
  Loading03Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons";

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

interface AddDomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDomainAdded: (domain: DomainRecord, instructions: DnsInstructions) => void;
}

export function AddDomainDialog({
  open,
  onOpenChange,
  onDomainAdded,
}: AddDomainDialogProps) {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [instructions, setInstructions] = useState<DnsInstructions | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!domain.trim()) {
      setError("Please enter a domain");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: domain.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add domain");
      }

      setSuccess(true);
      setInstructions(data.instructions);
      onDomainAdded(data.domain, data.instructions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add domain");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDomain("");
    setError(null);
    setSuccess(false);
    setInstructions(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Globe02Icon} className="w-5 h-5" />
            Add Custom Domain
          </DialogTitle>
          <DialogDescription>
            Connect your own domain to your storefront. You&apos;ll need to configure DNS records with your domain provider.
          </DialogDescription>
        </DialogHeader>

        {!success ? (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  placeholder="store.yourdomain.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Enter your domain without http:// or https://
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Alert>
                <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
                <AlertTitle>DNS Configuration Required</AlertTitle>
                <AlertDescription>
                  After adding your domain, you&apos;ll need to configure DNS records. We support both CNAME and A record configurations.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !domain.trim()}>
                {loading ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Domain"
                )}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="space-y-4 py-4">
            <Alert className="border-green-500/20 bg-green-500/10">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Domain Added Successfully</AlertTitle>
              <AlertDescription>
                Your domain has been added. Now configure your DNS records to complete the setup.
              </AlertDescription>
            </Alert>

            {instructions && (
              <DnsInstructionsDisplay instructions={instructions} domain={domain} />
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

interface DnsInstructionsDisplayProps {
  instructions: DnsInstructions;
  domain: string;
}

function DnsInstructionsDisplay({ instructions, domain }: DnsInstructionsDisplayProps) {
  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">DNS Configuration</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Add the following DNS record with your domain provider:
        </p>
      </div>

      {/* CNAME Record Instructions */}
      <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">CNAME Record (Recommended)</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Type</p>
            <code className="bg-background px-2 py-1 rounded text-xs">CNAME</code>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Name</p>
            <code className="bg-background px-2 py-1 rounded text-xs break-all">{domain}</code>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Value</p>
            <code className="bg-background px-2 py-1 rounded text-xs">cname.vercel-dns.com</code>
          </div>
        </div>
      </div>

      {/* A Record Alternative */}
      <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">A Record (Alternative)</span>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Type</p>
            <code className="bg-background px-2 py-1 rounded text-xs">A</code>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Name</p>
            <code className="bg-background px-2 py-1 rounded text-xs">@</code>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Value</p>
            <code className="bg-background px-2 py-1 rounded text-xs">76.76.21.21</code>
          </div>
        </div>
      </div>

      <Alert>
        <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
        <AlertDescription className="text-xs">
          DNS changes can take up to 48 hours to propagate. After configuring your DNS, click &quot;Verify&quot; on the domain card to check the status.
        </AlertDescription>
      </Alert>
    </div>
  );
}
