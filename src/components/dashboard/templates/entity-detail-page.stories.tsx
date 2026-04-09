import type { Meta, StoryObj } from "@storybook/react";
import { EntityDetailPage } from "./entity-detail-page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const meta: Meta<typeof EntityDetailPage> = {
  component: EntityDetailPage,
  title: "Templates/EntityDetailPage",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof EntityDetailPage>;

export const Default: Story = {
  args: {
    backHref: "/dashboard/products",
    backLabel: "Products",
    title: "Premium T-Shirt",
    subtitle: "SKU: TSH-001",
    status: <Badge className="bg-success/10 text-success">Active</Badge>,
    actions: <><Button variant="outline">Discard</Button><Button>Save</Button></>,
    children: <div className="rounded-lg border p-8 text-center text-xs text-muted-foreground">Main content cards</div>,
    sidebar: <div className="rounded-lg border p-8 text-center text-xs text-muted-foreground">Sidebar cards</div>,
  },
};
