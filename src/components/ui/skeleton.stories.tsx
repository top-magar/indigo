import type { Meta, StoryObj } from '@storybook/nextjs';
import { Skeleton, SkeletonText, SkeletonAvatar, SkeletonCard, SkeletonTable, SkeletonList } from './skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Skeleton',
  component: Skeleton,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-[250px]" />,
};

export const Text: Story = {
  render: () => <SkeletonText lines={3} className="w-[300px]" />,
};

export const Avatar: Story = {
  render: () => (
    <div className="flex gap-4">
      <SkeletonAvatar size="sm" />
      <SkeletonAvatar size="md" />
      <SkeletonAvatar size="lg" />
    </div>
  ),
};

export const Card: Story = {
  render: () => <SkeletonCard className="w-[350px]" />,
};

export const Table: Story = {
  render: () => <SkeletonTable rows={3} columns={4} />,
};

export const List: Story = {
  render: () => <SkeletonList items={3} />,
};
