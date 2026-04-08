"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle2, Info, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RiskCounts {
  high: number;
  medium: number;
  low: number;
  none: number;
}

interface WellArchitectedWidgetProps {
  workloadName?: string;
  riskCounts?: RiskCounts;
  lastReviewDate?: string;
  enabled?: boolean;
}

export function WellArchitectedWidget({
  workloadName = "Not configured",
  riskCounts,
  lastReviewDate,
  enabled = false,
}: WellArchitectedWidgetProps) {
  if (!enabled) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <Shield className="h-6 w-6 text-brand/80" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold tracking-[-0.28px] text-foreground">
                AWS Well-Architected Tool
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Review your architecture against AWS best practices
              </p>
              <Button asChild className="mt-3">
                <Link href="/dashboard/settings/aws">
                  Enable Now
                  <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalRisks = riskCounts
    ? riskCounts.high + riskCounts.medium + riskCounts.low
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-brand/80" />
            </div>
            <CardTitle className="text-sm font-semibold tracking-[-0.28px] text-foreground">
              Architecture Review
            </CardTitle>
          </div>
          <Button asChild variant="ghost" className="h-7 text-xs">
            <Link href="/dashboard/architecture">
              View Report
              <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Workload Info */}
        <div>
          <p className="text-xs text-muted-foreground">Workload</p>
          <p className="text-sm font-medium text-foreground mt-0.5">
            {workloadName}
          </p>
          {lastReviewDate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Last reviewed {new Date(lastReviewDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Risk Summary */}
        {riskCounts && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Risks</span>
              <span className="font-semibold text-foreground tabular-nums">
                {totalRisks}
              </span>
            </div>

            {/* Risk Breakdown */}
            <div className="space-y-1.5">
              {riskCounts.high > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-destructive" />
                    <span className="text-muted-foreground">High Risk</span>
                  </div>
                  <Badge className="h-5 px-1.5 min-w-[20px] justify-center border-0 bg-destructive/10 text-destructive tabular-nums">
                    {riskCounts.high}
                  </Badge>
                </div>
              )}

              {riskCounts.medium > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <Info className="h-3 w-3 text-warning" />
                    <span className="text-muted-foreground">Medium Risk</span>
                  </div>
                  <Badge className="h-5 px-1.5 min-w-[20px] justify-center border-0 bg-warning/10 text-warning tabular-nums">
                    {riskCounts.medium}
                  </Badge>
                </div>
              )}

              {riskCounts.low > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-info" />
                    <span className="text-muted-foreground">Low Risk</span>
                  </div>
                  <Badge className="h-5 px-1.5 min-w-[20px] justify-center border-0 bg-info/10 text-info tabular-nums">
                    {riskCounts.low}
                  </Badge>
                </div>
              )}

              {totalRisks === 0 && (
                <div className="flex items-center gap-2 p-2 rounded-md bg-success/10">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-xs text-success font-medium">
                    No risks identified
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
