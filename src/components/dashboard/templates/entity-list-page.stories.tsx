import type { Meta, StoryObj } from "@storybook/react";
import { EntityListPage } from "./entity-list-page";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof EntityListPage> = {
  component: EntityListPage,
  title: "Templates/EntityListPage",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof EntityListPage>;

export const Default: Story = {
  args: {
    title: "Products",
    description: "Manage your product catalog",
    actions: <Button><Package className="size-3.5" /> Add Product</Button>,
    stats: [
      { label: "Total Products", value: 142 },
      { label: "Active", value: 98 },
      { label: "Draft", value: 44 },
      { label: "Revenue", value: "NPR 1.2M" },
    ],
    children: <div className="rounded-lg border p-8 text-center text-xs text-muted-foreground">DataTable goes here</div>,
  },
};

export const Minimal: Story = {
  args: {
    title: "Orders",
    children: <div className="rounded-lg border p-8 text-center text-xs text-muted-foreground">Content</div>,
  },
};
