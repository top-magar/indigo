"use client"

import { formatDistanceToNow } from "date-fns"

import { useState, useTransition } from "react"
import { ChevronRight } from "lucide-react"
// Types are defined in the parent order-detail-client.tsx
import type { AIAnalysis } from "../order-detail-client";
type OrderAddress = {
  firstName?: string; lastName?: string; company?: string;
  addressLine1: string; addressLine2?: string;
  city: string; state?: string; postalCode?: string; country: string; phone?: string;
};
type OrderEvent = {
  id: string; type: string; message: string; createdAt: string; user?: string | null;
};
import { AlertTriangle, Brain, Loader2, Phone, Activity, History } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { STATUS_CONFIG } from "../../_components/order-badges"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn, formatCurrency } from "@/shared/utils"

export function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  return (
    <Badge 
      className={cn("gap-1.5 text-sm font-medium border px-3 py-1", config.className)}
    >
      <Icon className="size-3.5" />
      {config.label}
    </Badge>
  );
}

export function SentimentIndicator({ sentiment }: { sentiment: AIAnalysis["sentiment"] }) {
  if (!sentiment) return null;

  const colorMap = {
    positive: "text-success",
    neutral: "text-muted-foreground",
    negative: "text-destructive",
  };

  const bgMap = {
    positive: "bg-success/10",
    neutral: "bg-muted",
    negative: "bg-destructive/10",
  };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
            bgMap[sentiment.label as keyof typeof bgMap],
            colorMap[sentiment.label as keyof typeof colorMap]
          )}>
            <Brain className="size-3.5" />
            {sentiment.label.charAt(0).toUpperCase() + sentiment.label.slice(1)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI Sentiment Analysis</p>
          <p className="text-xs text-muted-foreground">
            Confidence: {Math.round(sentiment.confidence * 100)}%
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AddressCard({ 
  title, 
  address, 
  icon: Icon 
}: { 
  title: string; 
  address?: OrderAddress; 
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (!address) return null;

  const fullName = [address.firstName, address.lastName].filter(Boolean).join(" ");

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-foreground">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-1">
        {fullName && <p className="font-medium">{fullName}</p>}
        {address.company && <p>{address.company}</p>}
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
        </p>
        <p>{address.country}</p>
        {address.phone && (
          <p className="flex items-center gap-1 mt-2 text-muted-foreground">
            <Phone className="size-3.5" />
            {address.phone}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function AIInsightsCard({ analysis }: { analysis?: AIAnalysis }) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted">
                <Brain className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">AI Insights</p>
                <p className="text-xs text-muted-foreground">Smart order analysis</p>
              </div>
            </div>
            <Button
             
              variant="outline"
              className="gap-2"
              onClick={() => setIsGenerating(true)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Brain className="size-4" />
              )}
              Generate Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted">
            <Brain className="size-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-foreground">
              AI Insights
            </CardTitle>
            <CardDescription className="text-xs">
              Smart order analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment & Risk */}
        <div className="flex items-center gap-3">
          {analysis.sentiment && (
            <SentimentIndicator sentiment={analysis.sentiment} />
          )}
          {analysis.riskScore !== undefined && (
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
              analysis.riskScore > 0.7 
                ? "bg-destructive/10 text-destructive"
                : analysis.riskScore > 0.4
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
            )}>
              <AlertTriangle className="size-3.5" />
              Risk: {analysis.riskScore > 0.7 ? "High" : analysis.riskScore > 0.4 ? "Medium" : "Low"}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recommendations
            </p>
            <ul className="space-y-1.5">
              {analysis.recommendations.map((rec: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="size-4 text-info shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Actions */}
        {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Suggested Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.suggestedActions.map((action, i) => (
                <Button
                  key={i}
                 
                  variant={action.priority === "high" ? "default" : "outline"}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function OrderTimeline({ events, orderId }: { events: OrderEvent[]; orderId?: string }) {
  const [comment, setComment] = useState("");
  const [posting, startPosting] = useTransition();

  const handlePost = () => {
    if (!comment.trim() || !orderId) return;
    startPosting(async () => {
      try {
        const { addOrderNote } = await import("../../order-actions");
        await addOrderNote({ orderId, message: comment.trim() });
        setComment("");
        // Events will refresh on next server render
      } catch {}
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-foreground">
            Activity Timeline
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment input */}
        {orderId && (
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handlePost(); }}
              placeholder="Leave a comment…"
              className="flex-1 h-8 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            <Button size="sm" onClick={handlePost} disabled={!comment.trim() || posting}>
              {posting ? "…" : "Post"}
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={cn("flex size-5 items-center justify-center rounded-full", event.type === "note_added" ? "bg-primary/10" : "bg-muted")}>
                  <div className={cn("size-2 rounded-full", event.type === "note_added" ? "bg-primary" : "bg-muted-foreground/50")} />
                </div>
                {index < events.length - 1 && (
                  <div className="w-px flex-1 bg-muted my-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-foreground">{event.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  {event.user && ` • ${event.user}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

