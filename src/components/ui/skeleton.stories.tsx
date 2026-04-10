import type { Meta, StoryObj } from "@storybook/react";
import { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar } from "./skeleton";

const meta: Meta<typeof Skeleton> = { component: Skeleton, title: "UI/Skeleton" };
export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = { args: { className: "h-4 w-48" } };
export const Shimmer: Story = { args: { className: "h-4 w-48", variant: "shimmer" } };
export const Avatar: Story = { render: () => <SkeletonAvatar size="lg" /> };
export const Card: Story = { render: () => <SkeletonCard /> };
