"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Phone, Banknote, CreditCard, Truck, Package, CheckCircle2, AlertTriangle, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/shared/utils";
import { getPaymentMethodLabel, type PaymentMethod, type OrderTransaction, type Fulfillment, type OrderLine } from "../../_lib/types";

// ─── Verification Banner ─────────────────────────────────

export function VerificationBanner({ customerName, customerPhone, orderId, total, currency }: {
  customerName: string; customerPhone: string; orderId: string; total: number; currency: string;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();

  const handleVerify = () => start(async () => {
    try {
      const { updateOrderStatus } = await import("../../actions");
      const fd = new FormData();
      fd.set("orderId", orderId);
      fd.set("status", "confirmed");
      await updateOrderStatus(fd);
      toast.success("Order verified");
      router.refresh();
    } catch { toast.error("Failed to verify"); }
  });

  return (
    <div className="rounded-lg border border-warning/30 bg-warning/5 p-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warning/10">
          <Phone className="size-4 text-warning" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">COD verification required</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Call {customerName} to confirm this {formatCurrency(total, currency)} order
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" variant="outline" className="gap-1.5" asChild>
              <a href={`tel:${customerPhone}`}>
                <Phone className="size-3.5" /> {customerPhone}
              </a>
            </Button>
            <Button size="sm" onClick={handleVerify} disabled={isPending}>
              {isPending ? "Verifying…" : "Mark Verified"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Payment Card ────────────────────────────────────────

const PAYMENT_METHOD_ICONS: Record<string, typeof CreditCard> = {
  cod: Banknote, esewa: CreditCard, khalti: CreditCard,
  stripe: CreditCard, bank_transfer: CreditCard, fonepay: CreditCard,
};

export function PaymentCard({ method, status, total, currency, transactions = [], orderId }: {
  method: PaymentMethod | string; status: string; total: number; currency: string;
  transactions?: OrderTransaction[]; orderId: string;
}) {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const Icon = PAYMENT_METHOD_ICONS[method] || CreditCard;

  const paid = transactions.filter(t => t.type === "capture" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const refunded = transactions.filter(t => t.type === "refund" && t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const netPaid = paid - refunded;
  const isCod = method === "cod";
  const needsCollection = isCod && status === "pending" && netPaid < total;

  const handleCollect = () => start(async () => {
    try {
      const { markAsPaid } = await import("../../order-actions");
      await markAsPaid(orderId);
      toast.success("Payment collected");
      router.refresh();
    } catch { toast.error("Failed to mark as paid"); }
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Icon className="size-4 text-muted-foreground" />
            Payment
          </CardTitle>
          <Badge className={cn("text-xs",
            status === "paid" && "bg-success/10 text-success",
            status === "pending" && "bg-warning/10 text-warning",
            status === "refunded" && "bg-muted text-muted-foreground",
            status === "failed" && "bg-destructive/10 text-destructive",
          )}>
            {status === "paid" ? "Paid" : status === "pending" ? (isCod ? "COD Pending" : "Unpaid") : status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Method + Amount */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{getPaymentMethodLabel(method)}</span>
          <span className="font-medium tabular-nums">{formatCurrency(total, currency)}</span>
        </div>

        {/* Transactions */}
        {transactions.length > 0 && (
          <>
            <Separator />
            <div className="space-y-1.5">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {tx.type === "capture" ? "Paid" : tx.type === "refund" ? "Refunded" : tx.type}
                    {tx.reference && <span className="ml-1 font-mono text-muted-foreground/60">#{tx.reference.slice(-6)}</span>}
                  </span>
                  <span className={cn("tabular-nums", tx.type === "refund" && "text-destructive")}>
                    {tx.type === "refund" ? "-" : ""}{formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
              {refunded > 0 && (
                <div className="flex items-center justify-between text-xs font-medium pt-1 border-t">
                  <span>Net paid</span>
                  <span className="tabular-nums">{formatCurrency(netPaid, currency)}</span>
                </div>
              )}
            </div>
          </>
        )}

        {/* Actions */}
        {needsCollection && (
          <Button size="sm" className="w-full gap-1.5" onClick={handleCollect} disabled={isPending}>
            <Banknote className="size-3.5" />
            {isPending ? "Collecting…" : "Mark as Collected"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Fulfillment Card ────────────────────────────────────

const FULFILLMENT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground" },
  packing: { label: "Packing", className: "bg-info/10 text-info" },
  ready: { label: "Ready", className: "bg-info/10 text-info" },
  shipped: { label: "Shipped", className: "bg-ds-teal-700/10 text-ds-teal-700" },
  in_transit: { label: "In Transit", className: "bg-ds-teal-700/10 text-ds-teal-700" },
  out_for_delivery: { label: "Out for Delivery", className: "bg-warning/10 text-warning" },
  delivered: { label: "Delivered", className: "bg-success/10 text-success" },
  delivery_failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
  returned: { label: "Returned", className: "bg-destructive/10 text-destructive" },
};

export function FulfillmentCard({ fulfillments, lines, currency, orderId }: {
  fulfillments: Fulfillment[]; lines: OrderLine[]; currency: string; orderId: string;
}) {
  // Split items into fulfilled and unfulfilled
  const fulfilledItemIds = new Set(fulfillments.flatMap(f => f.items.map(i => i.order_item_id)));
  const unfulfilledLines = lines.filter(l => !fulfilledItemIds.has(l.id));

  return (
    <div className="space-y-3">
      {/* Existing fulfillments */}
      {fulfillments.map((f, i: number) => {
        const st = FULFILLMENT_STATUS_LABELS[f.status] || FULFILLMENT_STATUS_LABELS.pending;
        const fLines = f.items.map((fi: { order_item_id: string }) => lines.find(l => l.id === fi.order_item_id)).filter(Boolean) as OrderLine[];

        return (
          <Card key={f.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Truck className="size-4 text-muted-foreground" />
                  Fulfillment #{i + 1}
                </CardTitle>
                <Badge className={cn("text-xs", st.className)}>{st.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Line items */}
              <div className="space-y-2">
                {fLines.map(line => (
                  <div key={line.id} className="flex items-center gap-3">
                    {line.productImage ? (
                      <img src={line.productImage} alt="" className="size-9 rounded-md object-cover border" />
                    ) : (
                      <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                        <Package className="size-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{line.productName}</p>
                      <p className="text-xs text-muted-foreground">Qty: {line.quantity}</p>
                    </div>
                    <span className="text-sm tabular-nums">{formatCurrency(line.totalPrice, currency)}</span>
                  </div>
                ))}
              </div>

              {/* Tracking */}
              {f.tracking_number && (
                <>
                  <Separator />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" />
                    {f.courier_name && <span>{f.courier_name}</span>}
                    <span className="font-mono">{f.tracking_number}</span>
                  </div>
                </>
              )}

              {/* Rider info */}
              {f.rider_name && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Rider: {f.rider_name}</span>
                  {f.rider_phone && (
                    <a href={`tel:${f.rider_phone}`} className="text-primary hover:underline flex items-center gap-1">
                      <Phone className="size-3" /> {f.rider_phone}
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Unfulfilled items */}
      {unfulfilledLines.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                Unfulfilled
                <span className="text-xs text-muted-foreground font-normal">{unfulfilledLines.length} item{unfulfilledLines.length > 1 ? "s" : ""}</span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {unfulfilledLines.map(line => (
              <div key={line.id} className="flex items-center gap-3">
                {line.productImage ? (
                  <img src={line.productImage} alt="" className="size-9 rounded-md object-cover border" />
                ) : (
                  <div className="size-9 rounded-md bg-muted flex items-center justify-center">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{line.productName}</p>
                  <p className="text-xs text-muted-foreground">Qty: {line.quantity}</p>
                </div>
                <span className="text-sm tabular-nums">{formatCurrency(line.totalPrice, currency)}</span>
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full mt-2 gap-1.5" asChild>
              <a href={`/dashboard/orders/${orderId}?action=fulfill`}>
                <Truck className="size-3.5" /> Create Fulfillment
              </a>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* All fulfilled, no unfulfilled */}
      {unfulfilledLines.length === 0 && fulfillments.length > 0 && fulfillments.every(f => f.status === "delivered") && (
        <div className="flex items-center gap-2 text-sm text-success px-1">
          <CheckCircle2 className="size-4" /> All items delivered
        </div>
      )}
    </div>
  );
}
