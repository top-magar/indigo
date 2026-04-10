import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";

const meta: Meta = { title: "Pages/Dashboard/ReviewList", parameters: { layout: "padded" } };
export default meta;

const reviews = [
  { customer: "Alice Johnson", product: "Classic T-Shirt", rating: 5, sentiment: "positive", approved: true },
  { customer: "Bob Smith", product: "Denim Jacket", rating: 3, sentiment: "neutral", approved: true },
  { customer: "Carol White", product: "Running Shoes", rating: 1, sentiment: "negative", approved: false },
  { customer: "Dan Brown", product: "Wool Beanie", rating: 4, sentiment: "positive", approved: true },
];

const sentimentVariant = (s: string) =>
  s === "positive" ? "default" : s === "negative" ? "destructive" : "secondary";

export const Default: StoryObj = {
  render: () => (
    <div className="space-y-3">
      <h1 className="text-sm font-semibold">Reviews</h1>
      <Card><CardContent className="p-0">
        <table className="w-full text-xs">
          <thead><tr className="border-b text-muted-foreground">
            <th className="p-3 text-left font-medium">Customer</th>
            <th className="p-3 text-left font-medium">Product</th>
            <th className="p-3 text-left font-medium">Rating</th>
            <th className="p-3 text-left font-medium">Sentiment</th>
            <th className="p-3 text-left font-medium">Approved</th>
          </tr></thead>
          <tbody>{reviews.map((r) => (
            <tr key={`${r.customer}-${r.product}`} className="border-b last:border-0 hover:bg-muted/50">
              <td className="p-3 font-medium">{r.customer}</td>
              <td className="p-3">{r.product}</td>
              <td className="p-3">
                <span className="inline-flex gap-0.5">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={`size-3 ${i < r.rating ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                  ))}
                </span>
              </td>
              <td className="p-3"><Badge variant={sentimentVariant(r.sentiment)} className="text-[10px]">{r.sentiment}</Badge></td>
              <td className="p-3"><Switch size="sm" defaultChecked={r.approved} /></td>
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
      <h1 className="text-sm font-semibold">Reviews</h1>
      <Card><CardContent className="py-16 text-center">
        <p className="text-sm font-medium">No reviews yet</p>
        <p className="text-xs text-muted-foreground mt-1">Customer reviews will appear here.</p>
      </CardContent></Card>
    </div>
  ),
};
