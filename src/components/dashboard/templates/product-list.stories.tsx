import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Search, Download } from "lucide-react";

const meta: Meta = {
  title: "Pages/Product List",
  parameters: { layout: "padded" },
};
export default meta;

const mockProducts = [
  { id: 1, name: "Classic T-Shirt", sku: "TSH-001", price: "$29.99", stock: 142, status: "active" },
  { id: 2, name: "Denim Jacket", sku: "JKT-002", price: "$89.99", stock: 23, status: "active" },
  { id: 3, name: "Running Shoes", sku: "SHO-003", price: "$119.99", stock: 0, status: "draft" },
  { id: 4, name: "Wool Beanie", sku: "HAT-004", price: "$19.99", stock: 5, status: "active" },
  { id: 5, name: "Leather Belt", sku: "BLT-005", price: "$39.99", stock: 67, status: "archived" },
];

export const Default: StoryObj = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold">Products</h1>
          <p className="text-xs text-muted-foreground">{mockProducts.length} products</p>
        </div>
        <Button size="sm"><Plus className="size-3.5 mr-1.5" />Add Product</Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-8 h-8 text-xs" />
        </div>
        <Button variant="outline" size="sm"><Download className="size-3.5 mr-1.5" />Export</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="p-3 w-8"><Checkbox /></th>
                <th className="p-3 text-left font-medium">Product</th>
                <th className="p-3 text-left font-medium">SKU</th>
                <th className="p-3 text-left font-medium">Price</th>
                <th className="p-3 text-left font-medium">Stock</th>
                <th className="p-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((p) => (
                <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50">
                  <td className="p-3"><Checkbox /></td>
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3 text-muted-foreground font-mono">{p.sku}</td>
                  <td className="p-3">{p.price}</td>
                  <td className="p-3">
                    <span className={p.stock === 0 ? "text-destructive" : p.stock < 10 ? "text-warning" : ""}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <Badge variant={p.status === "active" ? "default" : p.status === "draft" ? "secondary" : "outline"} className="text-[10px]">
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  ),
};

export const Empty: StoryObj = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold">Products</h1>
        <Button size="sm"><Plus className="size-3.5 mr-1.5" />Add Product</Button>
      </div>
      <Card>
        <CardContent className="py-16 text-center">
          <p className="text-sm font-medium">No products yet</p>
          <p className="text-xs text-muted-foreground mt-1">Add your first product to get started.</p>
          <Button size="sm" className="mt-4"><Plus className="size-3.5 mr-1.5" />Add Product</Button>
        </CardContent>
      </Card>
    </div>
  ),
};
