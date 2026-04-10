import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";

const meta: Meta<typeof Label> = { component: Label, title: "UI/Label" };
export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = { args: { children: "Email address" } };
export const WithHtmlFor: Story = { args: { children: "Username", htmlFor: "username" } };
