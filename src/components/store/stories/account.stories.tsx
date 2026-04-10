import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
  { id: "#1042", date: "2026-03-15", total: "$89.99", status: "Delivered" },
  { id: "#1038", date: "2026-03-02", total: "$179.97", status: "Shipped" },
  { id: "#1025", date: "2026-02-18", total: "$39.99", status: "Processing" },
];
const navItems = ["Profile", "Orders"];

function Account({ tab = "Profile" }: { tab?: string }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Account</h1>
      <div className="grid md:grid-cols-[200px_1fr] gap-8">
        <nav className="space-y-1">
          {navItems.map((n) => (
            <Button key={n} variant={n === tab ? "secondary" : "ghost"} className="w-full justify-start">{n}</Button>
          ))}
        </nav>
        <div>
          {tab === "Profile" && (
            <div className="space-y-4 max-w-md">
              <div><label className="text-sm font-medium">Name</label><Input defaultValue="Jane Doe" /></div>
              <div><label className="text-sm font-medium">Email</label><Input defaultValue="jane@example.com" /></div>
              <div><label className="text-sm font-medium">Phone</label><Input defaultValue="+1 555-0123" /></div>
              <Button>Save Changes</Button>
            </div>
          )}
          {tab === "Orders" && (
            <Table>
              <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Date</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id}><TableCell>{o.id}</TableCell><TableCell>{o.date}</TableCell><TableCell>{o.total}</TableCell><TableCell><Badge variant="outline">{o.status}</Badge></TableCell></TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof Account> = { title: "Pages/Store/Account", component: Account, parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof Account>;
export const Profile: Story = { args: { tab: "Profile" } };
export const Orders: Story = { args: { tab: "Orders" } };
