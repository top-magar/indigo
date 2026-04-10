import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Printer, Truck } from "lucide-react";

const meta: Meta = { title: "Pages/Dashboard/OrderDetail", parameters: { layout: "padded" } };
export default meta;

const items = [
  { name: "Classic T-Shirt", qty: 2, price: "$29.99" },
  { name: "Denim Jacket", qty: 1, price: "$89.99" },
  { name: "Wool Beanie", qty: 3, price: "$19.99" },
];

const timeline = [
  { label: "Order placed", date: "Apr 6, 2026 10:30 AM" },
  { label: "Payment confirmed", date: "Apr 6, 2026 10:32 AM" },
  { label: "Shipped", date: "Apr 7, 2026 2:15 PM" },
];

export const Default: StoryObj = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-sm font-semibold">ORD-001</h1>
          <Badge variant="secondary" className="text-[10px]">shipped</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Printer className="size-3.5 mr-1.5" />Print</Button>
          <Button size="sm"><Truck className="size-3.5 mr-1.5" />Track</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3">
        <div className="space-y-3">
          <Card><CardContent className="p-0">
            <table className="w-full text-xs">
              <thead><tr className="border-b text-muted-foreground">
                <th className="p-3 text-left font-medium">Item</th>
                <th className="p-3 text-left font-medium">Qty</th>
                <th className="p-3 text-right font-medium">Price</th>
              </tr></thead>
              <tbody>{items.map((i) => (
                <tr key={i.name} className="border-b last:border-0">
                  <td className="p-3 font-medium">{i.name}</td>
                  <td className="p-3">{i.qty}</td>
                  <td className="p-3 text-right">{i.price}</td>
                </tr>
              ))}</tbody>
            </table>
          </CardContent></Card>
          <Card><CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Timeline</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-2">
              {timeline.map((t) => (
                <div key={t.label} className="flex items-start gap-2 text-xs">
                  <div className="mt-1 size-1.5 rounded-full bg-primary shrink-0" />
                  <div><p className="font-medium">{t.label}</p><p className="text-muted-foreground">{t.date}</p></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <div className="space-y-3">
          <Card><CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Customer</CardTitle></CardHeader>
            <CardContent className="p-3 text-xs space-y-1">
              <p className="font-medium">Alice Johnson</p>
              <p className="text-muted-foreground">alice@example.com</p>
            </CardContent>
          </Card>
          <Card><CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Payment</CardTitle></CardHeader>
            <CardContent className="p-3 text-xs space-y-1">
              <p>Visa •••• 4242</p>
              <p className="font-medium">$209.94</p>
            </CardContent>
          </Card>
          <Card><CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Shipping</CardTitle></CardHeader>
            <CardContent className="p-3 text-xs space-y-1">
              <p>123 Main St</p>
              <p className="text-muted-foreground">Portland, OR 97201</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  ),
};
