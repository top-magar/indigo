import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  { label: "Confirmed", date: "Apr 5", done: true },
  { label: "Processing", date: "Apr 6", done: true },
  { label: "Shipped", date: "Apr 8", done: true },
  { label: "Delivered", date: "Apr 10", done: false },
];
const orderItems = [
  { name: "Classic Tee", qty: 2, price: "$29.99", img: "👕" },
  { name: "Canvas Bag", qty: 1, price: "$39.99", img: "👜" },
];

function OrderTracking({ showResult = false }: { showResult?: boolean }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Track Your Order</h1>
      {!showResult ? (
        <Card className="max-w-md mx-auto">
          <CardHeader><CardTitle>Order Lookup</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><label className="text-sm font-medium">Order Number</label><Input placeholder="#1042" /></div>
            <div><label className="text-sm font-medium">Email</label><Input type="email" placeholder="you@example.com" /></div>
            <Button className="w-full">Track Order</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="font-semibold">Order #1042</span>
            <Badge variant="secondary">In Transit</Badge>
            <span className="text-muted-foreground text-sm">Tracking: 1Z999AA10123456784</span>
          </div>
          <div className="flex gap-4">
            {steps.map((s, i) => (
              <div key={s.label} className="flex items-center gap-2">
                <div className={`size-3 rounded-full ${s.done ? "bg-primary" : "bg-muted"}`} />
                <div><p className="text-sm font-medium">{s.label}</p><p className="text-xs text-muted-foreground">{s.date}</p></div>
                {i < steps.length - 1 && <div className={`h-px w-8 ${s.done ? "bg-primary" : "bg-muted"}`} />}
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h2 className="font-semibold">Items</h2>
            {orderItems.map((i) => (
              <div key={i.name} className="flex items-center gap-3 border rounded-lg p-3">
                <span className="text-2xl">{i.img}</span>
                <div className="flex-1"><p className="font-medium">{i.name}</p><p className="text-muted-foreground text-sm">Qty: {i.qty}</p></div>
                <p className="font-semibold">{i.price}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const meta: Meta<typeof OrderTracking> = { title: "Pages/Store/OrderTracking", component: OrderTracking, parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof OrderTracking>;
export const Lookup: Story = { args: { showResult: false } };
export const Result: Story = { args: { showResult: true } };
