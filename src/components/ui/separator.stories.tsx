import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = { component: Separator, title: "UI/Separator" };
export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = { args: {} };
export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-4">
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};
