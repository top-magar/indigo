import type { Meta, StoryObj } from "@storybook/react";
import { EntityFormCard } from "./entity-form-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const meta: Meta<typeof EntityFormCard> = {
  component: EntityFormCard,
  title: "Templates/EntityFormCard",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof EntityFormCard>;

export const Default: Story = {
  render: () => (
    <EntityFormCard title="Basic Information" description="Product name and description" className="w-[500px]">
      <div className="space-y-2">
        <Label className="text-xs">Name</Label>
        <Input placeholder="Product name" />
      </div>
      <div className="space-y-2">
        <Label className="text-xs">Description</Label>
        <Input placeholder="Short description" />
      </div>
    </EntityFormCard>
  ),
};
