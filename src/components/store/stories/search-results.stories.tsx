import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

const results = [
  { name: "Classic Tee", price: "$29.99", img: "👕" },
  { name: "Denim Jacket", price: "$89.99", img: "🧥" },
  { name: "Canvas Bag", price: "$39.99", img: "👜" },
];
const filterCategories = ["Tops", "Outerwear", "Shoes", "Accessories"];

function SearchResults({ noResults = false }: { noResults?: boolean }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6"><Input placeholder="Search products..." className="max-w-md" /></div>
      <div className="grid md:grid-cols-[220px_1fr] gap-8">
        <aside className="space-y-4">
          <div>
            <p className="font-medium mb-2">Price Range</p>
            <div className="flex gap-2"><Input placeholder="Min" /><Input placeholder="Max" /></div>
          </div>
          <div>
            <p className="font-medium mb-2">Categories</p>
            <div className="space-y-2">
              {filterCategories.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm"><Checkbox />{c}</label>
              ))}
            </div>
          </div>
          <Button className="w-full">Apply Filters</Button>
        </aside>
        <div>
          {noResults ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-lg font-medium">No results found</p>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {results.map((p) => (
                <Card key={p.name}>
                  <CardContent className="pt-4 text-center">
                    <div className="text-5xl mb-3">{p.img}</div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-muted-foreground">{p.price}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof SearchResults> = { title: "Pages/Store/SearchResults", component: SearchResults, parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof SearchResults>;
export const Default: Story = {};
export const NoResults: Story = { args: { noResults: true } };
