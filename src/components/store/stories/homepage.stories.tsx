import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const products = [
  { name: "Classic Tee", price: "$29.99", img: "👕" },
  { name: "Denim Jacket", price: "$89.99", img: "🧥" },
  { name: "Running Shoes", price: "$119.99", img: "👟" },
  { name: "Canvas Bag", price: "$39.99", img: "👜" },
];
const categories = ["New Arrivals", "Men", "Women", "Accessories", "Sale"];

function Homepage() {
  return (
    <div className="max-w-7xl mx-auto px-4">
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Spring Collection 2026</h1>
        <p className="text-muted-foreground mb-6">Discover the latest trends</p>
        <Button size="lg">Shop Now</Button>
      </section>
      <section className="py-8">
        <h2 className="text-2xl font-semibold mb-4">Featured Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <Card key={p.name}>
              <CardContent className="pt-4 text-center">
                <div className="text-5xl mb-3">{p.img}</div>
                <p className="font-medium">{p.name}</p>
                <p className="text-muted-foreground">{p.price}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="py-8">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Button key={c} variant="outline">{c}</Button>
          ))}
        </div>
      </section>
    </div>
  );
}

const meta: Meta = { title: "Pages/Store/Homepage", component: Homepage, parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;
export const Default: Story = {};
