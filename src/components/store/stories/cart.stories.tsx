import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const items = [
  { name: "Classic Tee", qty: 2, price: "$29.99", img: "👕" },
  { name: "Running Shoes", qty: 1, price: "$119.99", img: "👟" },
];

function Cart({ empty = false }: { empty?: boolean }) {
  if (empty) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🛒</p>
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-4">Add items to get started</p>
        <Button>Continue Shopping</Button>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>
      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          {items.map((i) => (
            <div key={i.name} className="flex items-center gap-4 border rounded-lg p-3">
              <span className="text-3xl">{i.img}</span>
              <div className="flex-1">
                <p className="font-medium">{i.name}</p>
                <p className="text-muted-foreground">Qty: {i.qty}</p>
              </div>
              <p className="font-semibold">{i.price}</p>
            </div>
          ))}
        </div>
        <div className="border rounded-lg p-4 h-fit space-y-3">
          <div className="flex justify-between"><span>Subtotal</span><span>$179.97</span></div>
          <div className="flex justify-between"><span>Shipping</span><span>$9.99</span></div>
          <Separator />
          <div className="flex justify-between font-bold"><span>Total</span><span>$189.96</span></div>
          <Button className="w-full" size="lg">Checkout</Button>
        </div>
      </div>
    </div>
  );
}

const meta: Meta<typeof Cart> = { title: "Pages/Store/Cart", component: Cart, parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj<typeof Cart>;
export const Default: Story = {};
export const Empty: Story = { args: { empty: true } };
