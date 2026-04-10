import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Download } from "lucide-react";

const meta: Meta = { title: "Pages/Dashboard/InventoryList", parameters: { layout: "padded" } };
export default meta;

const inventory = [
  { name: "Classic T-Shirt", sku: "TSH-001", stock: 142, warehouse: "Portland" },
  { name: "Denim Jacket", sku: "JKT-002", stock: 8, warehouse: "Portland" },
  { name: "Running Shoes", sku: "SHO-003", stock: 0, warehouse: "Seattle" },
  { name: "Wool Beanie", sku: "HAT-004", stock: 5, warehouse: "Portland" },
  { name: "Leather Belt", sku: "BLT-005", stock: 67, warehouse: "Seattle" },
];

const stockColor = (n: number) => n === 0 ? "text-destructive" : n < 10 ? "text-yellow-600" : "text-green-600";

export const Default: StoryObj = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold">Inventory</h1>
        <Button variant="outline" size="sm"><Download className="size-3.5 mr-1.5" />Export</Button>
      </div>
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
        <Input placeholder="Search inventory..." className="pl-8 h-8 text-xs" />
      </div>
      <Card><CardContent className="p-0">
        <table className="w-full text-xs">
          <thead><tr className="border-b text-muted-foreground">
            <th className="p-3 text-left font-medium">Product</th>
            <th className="p-3 text-left font-medium">SKU</th>
            <th className="p-3 text-left font-medium">Stock</th>
            <th className="p-3 text-left font-medium">Warehouse</th>
          </tr></thead>
          <tbody>{inventory.map((i) => (
            <tr key={i.sku} className="border-b last:border-0 hover:bg-muted/50">
              <td className="p-3 font-medium">{i.name}</td>
              <td className="p-3 text-muted-foreground font-mono">{i.sku}</td>
              <td className={`p-3 font-medium ${stockColor(i.stock)}`}>{i.stock}</td>
              <td className="p-3">{i.warehouse}</td>
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
      <h1 className="text-sm font-semibold">Inventory</h1>
      <Card><CardContent className="py-16 text-center">
        <p className="text-sm font-medium">No inventory items</p>
        <p className="text-xs text-muted-foreground mt-1">Add products to track inventory levels.</p>
      </CardContent></Card>
    </div>
  ),
};
