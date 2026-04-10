import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

const meta: Meta = { title: "Pages/Dashboard/CustomerList", parameters: { layout: "padded" } };
export default meta;

const stats = [
  { label: "Total Customers", value: "1,204" },
  { label: "New This Month", value: "48" },
  { label: "Active", value: "892" },
  { label: "Avg. Lifetime Value", value: "$342" },
];

const customers = [
  { name: "Alice Johnson", email: "alice@example.com", orders: 12, spent: "$1,429.88", joined: "2025-01-15" },
  { name: "Bob Smith", email: "bob@example.com", orders: 5, spent: "$449.50", joined: "2025-06-22" },
  { name: "Carol White", email: "carol@example.com", orders: 28, spent: "$3,210.00", joined: "2024-11-03" },
  { name: "Dan Brown", email: "dan@example.com", orders: 2, spent: "$119.98", joined: "2026-03-10" },
];

export const Default: StoryObj = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold">Customers</h1>
        <Button size="sm"><Plus className="size-3.5 mr-1.5" />Add Customer</Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}><CardContent className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-semibold">{s.value}</p></CardContent></Card>
        ))}
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input placeholder="Search customers..." className="pl-8 h-8 text-xs" />
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-xs">
          <thead><tr className="border-b text-muted-foreground">
            <th className="p-3 text-left font-medium">Name</th>
            <th className="p-3 text-left font-medium">Email</th>
            <th className="p-3 text-left font-medium">Orders</th>
            <th className="p-3 text-left font-medium">Total Spent</th>
            <th className="p-3 text-left font-medium">Joined</th>
          </tr></thead>
          <tbody>{customers.map((c) => (
            <tr key={c.email} className="border-b last:border-0 hover:bg-muted/50">
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3 text-muted-foreground">{c.email}</td>
              <td className="p-3">{c.orders}</td>
              <td className="p-3">{c.spent}</td>
              <td className="p-3 text-muted-foreground">{c.joined}</td>
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
      <h1 className="text-sm font-semibold">Customers</h1>
      <Card><CardContent className="py-16 text-center">
        <p className="text-sm font-medium">No customers yet</p>
        <p className="text-xs text-muted-foreground mt-1">Customers will appear here after their first order.</p>
      </CardContent></Card>
    </div>
  ),
};
