import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./switch";
import { Label } from "./label";

const meta: Meta<typeof Switch> = { component: Switch, title: "UI/Switch" };
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = { args: {} };
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="notifications" />
      <Label htmlFor="notifications">Enable notifications</Label>
    </div>
  ),
};
export const Small: Story = { args: { size: "sm" } };
