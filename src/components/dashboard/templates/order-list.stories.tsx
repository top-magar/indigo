import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";

const meta: Meta = { title: "Pages/Dashboard/OrderList", parameters: { layout: "padded" } };
export default meta;

const stats = [
  { label: "Pending", value: 12 },
  { label: "Processing", value: 8 },
  { label: "Shipped", value: 24 },
  { label: "Delivered", value: 156 },
];

const orders = [
  { id: "ORD-001", customer: "Alice Johnson", total: "$129.99", status: "pending", date: "2026-04-09" },
  { id: "ORD-002", customer: "Bob Smith", total: "$89.50", status: "processing", date: "2026-04-08" },
  { id: "ORD-003", customer: "Carol White", total: "$249.00", status: "shipped", date: "2026-04-07" },
  { id: "ORD-004", customer: "Dan Brown", total: "$59.99", status: "delivered", date: "2026-04-06" },
];

const statusVariant = (s: string) =>
  s === "delivered" ? "default" : s === "shipped" ? "secondary" : s === "pending" ? "outline" : "destructive";

export const Default: StoryObj = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold">Orders</h1>
        <Button size="sm"><Plus className="size-3.5 mr-1.5" />New Order</Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}><CardContent className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-semibold">{s.value}</p></CardContent></Card>
        ))}
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input placeholder="Search orders..." className="pl-8 h-8 text-xs" />
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-xs">
          <thead><tr className="border-b text-muted-foreground">
            <th className="p-3 text-left font-medium">Order #</th>
            <th className="p-3 text-left font-medium">Customer</th>
            <th className="p-3 text-left font-medium">Total</th>
            <th className="p-3 text-left font-medium">Status</th>
            <th className="p-3 text-left font-medium">Date</th>
          </tr></thead>
          <tbody>{orders.map((o) => (
            <tr key={o.id} className="border-b last:border-0 hover:bg-muted/50">
              <td className="p-3 font-mono font-medium">{o.id}</td>
              <td className="p-3">{o.customer}</td>
              <td className="p-3">{o.total}</td>
              <td className="p-3"><Badge variant={statusVariant(o.status)} className="text-[10px]">{o.status}</Badge></td>
              <td className="p-3 text-muted-foreground">{o.date}</td>
            </tr>
          ))}</tbody>
        </table>
      </CardContent></Card>
    </div>
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <div className="space-y-3">
      <h1 className="text-sm font-semibold">Orders</h1>
      <Card><CardContent className="py-16 text-center">
        <p className="text-sm font-medium">No orders yet</p>
        <p className="text-xs text-muted-foreground mt-1">Orders will appear here once placed.</p>
      </CardContent></Card>
    </div>
  ),
};
