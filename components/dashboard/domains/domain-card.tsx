"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Globe02Icon,
  Delete02Icon,
  RefreshIcon,
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  AlertCircleIcon,
  Clock01Icon,
  Loading03Icon,
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

interface DomainCardProps {
  domain: DomainRecord;
  showInstructions?: boolean;
  instructions?: DnsInstructions;
  onRemoved: () => void;
  onUpdated: (domain: DomainRecord) => void;
  getStatusBadge: (status: string) => React.ReactNode;
}

export function DomainCard({
  domain,
  showInstructions = false,
  instructions,
  onRemoved,
  onUpdated,
  getStatusBadge,
}: DomainCardProps) {
  const [verifying, setVerifying] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [instructionsOpen, setInstructionsOpen] = useState(showInstructions);

  const handleVerify = async () => {
    setVerifying(true);
    setVerifyError(null);

    try {
      const response = await fetch(`/api/dashboard/domains/${domain.id}/verify`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setVerifyError(data.error || "Verification failed");
        return;
      }

      if (data.domain) {
        onUpdated(data.domain);
      }
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleRemove = async () => {
    setRemoving(true);

    try {
      const response = await fetch(`/api/dashboard/domains/${domain.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to remove domain");
      }

      onRemoved();
    } catch (err) {
      console.error("Failed to remove domain:", err);
    } finally {
      setRemoving(false);
    }
  };

  const getStatusIcon = () => {
    switch (domain.status) {
      case "active":
        return <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-green-600" />;
      case "verified":
        return <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-5 h-5 text-blue-600" />;
      case "pending":
        return <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 text-yellow-600" />;
      case "failed":
        return <HugeiconsIcon icon={AlertCircleIcon} className="w-5 h-5 text-destructive" />;
      default:
        return <HugeiconsIcon icon={Globe02Icon} className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusMessage = () => {
    switch (domain.status) {
      case "active":
        return "Your domain is active and SSL is ready.";
      case "verified":
        return "Domain verified. SSL certificate is being provisioned.";
      case "pending":
        return "Waiting for DNS verification. Configure your DNS records and click Verify.";
      case "failed":
        return domain.errorMessage || "Verification failed. Please check your DNS configuration.";
      default:
        return "Unknown status";
    }
  };

  const getErrorRemediation = () => {
    if (!domain.errorMessage) return null;

    const error = domain.errorMessage.toLowerCase();
    
    if (error.includes("cname") && error.includes("not found")) {
      return "Add a CNAME record pointing to cname.vercel-dns.com";
    }
    if (error.includes("wrong value") || error.includes("instead of")) {
      return "Update your CNAME record to point to cname.vercel-dns.com";
    }
    if (error.includes("propagation") || error.includes("timeout")) {
      return "DNS changes can take up to 48 hours. Please wait and try again.";
    }
    if (error.includes("vercel api")) {
      return "There was an issue with the Vercel API. Please try again later.";
    }
    
    return "Check your DNS configuration and try again.";
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <CardTitle className="text-lg font-semibold">{domain.domain}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Added {new Date(domain.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(domain.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Message */}
        <div className="flex items-start gap-2 text-sm">
          <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">{getStatusMessage()}</span>
        </div>

        {/* Error with Remediation */}
        {domain.status === "failed" && domain.errorMessage && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertDescription className="space-y-2">
              <p>{domain.errorMessage}</p>
              {getErrorRemediation() && (
                <p className="font-medium">How to fix: {getErrorRemediation()}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Verification Error */}
        {verifyError && (
          <Alert variant="destructive">
            <HugeiconsIcon icon={AlertCircleIcon} className="h-4 w-4" />
            <AlertDescription>{verifyError}</AlertDescription>
          </Alert>
        )}

        {/* DNS Instructions (Collapsible) */}
        {(domain.status === "pending" || domain.status === "failed") && (
          <Collapsible open={instructionsOpen} onOpenChange={setInstructionsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>DNS Configuration Instructions</span>
                <HugeiconsIcon 
                  icon={ArrowDown01Icon} 
                  className={`w-4 h-4 transition-transform ${instructionsOpen ? "rotate-180" : ""}`} 
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <DnsInstructionsPanel domain={domain.domain} />
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t">
          {(domain.status === "pending" || domain.status === "failed" || domain.status === "verified") && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleVerify}
              disabled={verifying}
            >
              {verifying ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <HugeiconsIcon icon={RefreshIcon} className="w-4 h-4 mr-2" />
                  {domain.status === "verified" ? "Check SSL Status" : "Verify"}
                </>
              )}
            </Button>
          )}

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
                Remove
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Domain</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove <strong>{domain.domain}</strong>? This action cannot be undone and will disconnect the domain from your storefront.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleRemove}
                  disabled={removing}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {removing ? "Removing..." : "Remove Domain"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function DnsInstructionsPanel({ domain }: { domain: string }) {
  return (
    <div className="space-y-4 p-4 rounded-lg bg-muted/50">
      <p className="text-sm text-muted-foreground">
        Configure one of the following DNS records with your domain provider:
      </p>

      {/* CNAME Record */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Option 1: CNAME Record (Recommended)</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Type</p>
            <code className="bg-background px-2 py-1 rounded text-xs block">CNAME</code>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Name</p>
            <code className="bg-background px-2 py-1 rounded text-xs block break-all">{domain}</code>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Value</p>
            <code className="bg-background px-2 py-1 rounded text-xs block">cname.vercel-dns.com</code>
          </div>
        </div>
      </div>

      {/* A Record */}
      <div className="space-y-2">
        <p className="text-sm font-medium">Option 2: A Record</p>
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs mb-1">Type</p>
            <code className="bg-background px-2 py-1 rounded text-xs block">A</code>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Name</p>
            <code className="bg-background px-2 py-1 rounded text-xs block">@</code>
          </div>
          <div>
            <p className="text-muted-foreground text-xs mb-1">Value</p>
            <code className="bg-background px-2 py-1 rounded text-xs block">76.76.21.21</code>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: DNS changes can take up to 48 hours to propagate globally.
      </p>
    </div>
  );
}
