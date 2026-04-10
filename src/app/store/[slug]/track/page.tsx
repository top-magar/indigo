"use client";

import { useState, useTransition } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Truck, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { cn } from "@/shared/utils";

interface OrderResult {
  id: string;
  order_number: string;
  status: string;
  total: string;
  currency: string;
  created_at: string;
  items: { id: string; product_name: string; quantity: number; unit_price: string }[];
  fulfillments: { id: string; status: string; tracking_number: string | null; tracking_url: string | null; shipped_at: string | null }[];
}

const steps = [
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "processing", label: "Processing", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
] as const;

function getStepIndex(status: string, fulfillments: OrderResult["fulfillments"]): number {
  if (fulfillments.some((f) => f.status === "delivered")) return 3;
  if (fulfillments.some((f) => f.status === "shipped")) return 2;
  if (status === "processing" || status === "confirmed") return 1;
  return 0;
}

export default function TrackPage() {
  const { slug } = useParams<{ slug: string }>();
  const [order, setOrder] = useState<OrderResult | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    const orderNumber = formData.get("orderNumber") as string;
    const email = formData.get("email") as string;
    if (!orderNumber || !email) { setError("Both fields are required"); return; }

    startTransition(async () => {
      setError("");
      const supabase = createClient();
      const { data: tenant } = await supabase.from("tenants").select("id").eq("slug", slug).single();
      if (!tenant) { setError("Store not found"); return; }

      const { data } = await supabase
        .from("orders")
        .select("id, order_number, status, total, currency, created_at, customer_email, order_items(id, product_name, quantity, unit_price), fulfillments(id, status, tracking_number, tracking_url, shipped_at)")
        .eq("tenant_id", tenant.id)
        .eq("order_number", orderNumber)
        .single();

      if (!data || data.customer_email?.toLowerCase() !== email.toLowerCase()) {
        setError("Order not found. Check your order number and email.");
        return;
      }
      setOrder({
        id: data.id,
        order_number: data.order_number,
        status: data.status,
        total: data.total,
        currency: data.currency || "USD",
        created_at: data.created_at,
        items: data.order_items ?? [],
        fulfillments: data.fulfillments ?? [],
      });
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="text-xl font-semibold text-center mb-8">Track Your Order</h1>

        {!order ? (
          <Card>
            <CardContent className="p-6">
              <form action={handleSubmit} className="space-y-4">
                {error && <p className="text-xs text-destructive">{error}</p>}
                <div>
                  <label className="text-xs font-medium mb-1 block">Order Number</label>
                  <Input name="orderNumber" placeholder="e.g. ORD-1234" required />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block">Email Address</label>
                  <Input name="email" type="email" placeholder="The email used for the order" required />
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Looking up..." : "Track Order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-sm font-semibold">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">Placed {new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm font-semibold">{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currency }).format(parseFloat(order.total))}</p>
                </div>

                {/* Timeline */}
                <div className="flex items-center justify-between mb-6">
                  {steps.map((step, i) => {
                    const current = getStepIndex(order.status, order.fulfillments);
                    const done = i <= current;
                    return (
                      <div key={step.key} className="flex flex-col items-center gap-1 flex-1">
                        <div className={cn("flex items-center justify-center size-8 rounded-full border-2", done ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/20 text-muted-foreground/30")}>
                          <step.icon className="size-4" />
                        </div>
                        <span className={cn("text-[10px]", done ? "text-foreground font-medium" : "text-muted-foreground")}>{step.label}</span>
                        {i < steps.length - 1 && <div className={cn("absolute h-0.5 w-full", done ? "bg-primary" : "bg-muted")} style={{ display: "none" }} />}
                      </div>
                    );
                  })}
                </div>

                {/* Tracking */}
                {order.fulfillments.filter((f) => f.tracking_number).map((f) => (
                  <div key={f.id} className="rounded-lg bg-muted p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">Tracking: {f.tracking_number}</p>
                      {f.shipped_at && <p className="text-[10px] text-muted-foreground">Shipped {new Date(f.shipped_at).toLocaleDateString()}</p>}
                    </div>
                    {f.tracking_url && (
                      <a href={f.tracking_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                        Track <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-sm font-semibold mb-3">Items</h3>
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b last:border-0 text-sm">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span className="text-muted-foreground">{new Intl.NumberFormat("en-US", { style: "currency", currency: order.currency }).format(parseFloat(item.unit_price) * item.quantity)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Button variant="outline" className="w-full" onClick={() => setOrder(null)}>Track Another Order</Button>
          </div>
        )}
      </div>
    </div>
  );
}
