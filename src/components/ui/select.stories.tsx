import type { Meta, StoryObj } from "@storybook/react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./select";

const meta: Meta<typeof Select> = { component: Select, title: "UI/Select" };
export default meta;
type Story = StoryObj<typeof Select>;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="one">Option One</SelectItem>
        <SelectItem value="two">Option Two</SelectItem>
        <SelectItem value="three">Option Three</SelectItem>
      </SelectContent>
    </Select>
  ),
};
