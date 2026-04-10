import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react";

const meta: Meta = { title: "Pages/Dashboard/Analytics", parameters: { layout: "padded" } };
export default meta;

const stats = [
  { label: "Revenue", value: "$12,489", icon: DollarSign },
  { label: "Orders", value: "284", icon: ShoppingCart },
  { label: "Customers", value: "1,204", icon: Users },
  { label: "Avg. Order", value: "$43.97", icon: TrendingUp },
];

const topProducts = [
  { name: "Classic T-Shirt", sold: 142, revenue: "$4,258.58" },
  { name: "Denim Jacket", sold: 67, revenue: "$6,029.33" },
  { name: "Running Shoes", sold: 53, revenue: "$6,359.47" },
  { name: "Wool Beanie", sold: 98, revenue: "$1,959.02" },
];

export const Default: StoryObj = {
  render: () => (
    <div className="space-y-3">
      <h1 className="text-sm font-semibold">Analytics</h1>
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card key={s.label}><CardContent className="p-3 flex items-center gap-3">
            <div className="rounded-md bg-muted p-2"><s.icon className="size-4 text-muted-foreground" /></div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-semibold">{s.value}</p></div>
          </CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Revenue Over Time</CardTitle></CardHeader>
        <CardContent className="p-3">
          <div className="h-48 rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">Chart placeholder</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="p-3 pb-0"><CardTitle className="text-xs font-medium">Top Products</CardTitle></CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead><tr className="border-b text-muted-foreground">
              <th className="p-3 text-left font-medium">Product</th>
              <th className="p-3 text-left font-medium">Sold</th>
              <th className="p-3 text-right font-medium">Revenue</th>
            </tr></thead>
            <tbody>{topProducts.map((p) => (
              <tr key={p.name} className="border-b last:border-0 hover:bg-muted/50">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3">{p.sold}</td>
                <td className="p-3 text-right">{p.revenue}</td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  ),
};
