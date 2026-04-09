import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./input";

const meta: Meta<typeof Input> = { component: Input, title: "UI/Input" };
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: "Enter text..." } };
export const WithValue: Story = { args: { defaultValue: "Hello world" } };
export const Disabled: Story = { args: { placeholder: "Disabled", disabled: true } };
export const TypeEmail: Story = { args: { type: "email", placeholder: "email@example.com" } };
export const TypeNumber: Story = { args: { type: "number", placeholder: "0" } };
