import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sizes = ["XS", "S", "M", "L", "XL"];
const colors = ["Black", "White", "Navy"];
const reviews = [
  { author: "Alex", rating: 5, text: "Perfect fit!" },
  { author: "Sam", rating: 4, text: "Great quality, runs slightly large." },
];

function ProductDetail() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-muted rounded-lg aspect-square flex items-center justify-center text-6xl">👕</div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Classic Cotton Tee</h1>
          <p className="text-2xl font-semibold">$29.99</p>
          <p className="text-muted-foreground">Premium organic cotton t-shirt with a relaxed fit. Soft, breathable, and built to last.</p>
          <div>
            <p className="font-medium mb-2">Size</p>
            <div className="flex gap-2">{sizes.map((s) => <Button key={s} variant="outline" size="sm">{s}</Button>)}</div>
          </div>
          <div>
            <p className="font-medium mb-2">Color</p>
            <div className="flex gap-2">{colors.map((c) => <Button key={c} variant="outline" size="sm">{c}</Button>)}</div>
          </div>
          <Button size="lg" className="w-full">Add to Cart</Button>
        </div>
      </div>
      <section className="py-8">
        <h2 className="text-xl font-semibold mb-4">Reviews</h2>
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.author} className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">{r.author}</span>
                <Badge variant="secondary">{"★".repeat(r.rating)}</Badge>
              </div>
              <p className="text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta = { title: "Pages/Store/ProductDetail", component: ProductDetail, parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;
export const Default: Story = {};
