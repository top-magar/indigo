import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta: Meta<typeof Checkbox> = { component: Checkbox, title: "UI/Checkbox" };
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = { args: {} };
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms</Label>
    </div>
  ),
};
export const Checked: Story = { args: { defaultChecked: true } };
