import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";
import { Plus, Trash2 } from "lucide-react";

const meta: Meta<typeof Button> = { component: Button, title: "UI/Button" };
export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = { args: { children: "Button" } };
export const Secondary: Story = { args: { variant: "secondary", children: "Secondary" } };
export const Destructive: Story = { args: { variant: "destructive", children: "Delete" } };
export const Outline: Story = { args: { variant: "outline", children: "Outline" } };
export const Ghost: Story = { args: { variant: "ghost", children: "Ghost" } };
export const WithIcon: Story = { args: { children: <><Plus className="size-3.5" /> Add Item</> } };
export const IconOnly: Story = { args: { variant: "ghost", size: "icon", children: <Trash2 className="size-3.5" /> } };
export const Large: Story = { args: { size: "lg", children: "Large" } };
export const Small: Story = { args: { size: "sm", children: "Small" } };
