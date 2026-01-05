import type { Meta, StoryObj } from '@storybook/nextjs';
import { BulkActionsBar, StickyBulkActionsBar } from './bulk-actions-bar';
import { Button } from '@/components/ui/button';

const meta: Meta<typeof BulkActionsBar> = {
  title: 'Dashboard/BulkActionsBar',
  component: BulkActionsBar,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BulkActionsBar>;

export const Default: Story = {
  args: {
    selectedCount: 5,
    onClear: () => {},
    itemLabel: 'item',
    children: (
      <>
        <Button size="sm" variant="outline">Export</Button>
        <Button size="sm" variant="destructive">Delete</Button>
      </>
    ),
  },
};

export const SingleItem: Story = {
  args: {
    selectedCount: 1,
    onClear: () => {},
    itemLabel: 'product',
    children: <Button size="sm" variant="outline">Edit</Button>,
  },
};

export const Sticky: Story = {
  render: () => (
    <div className="h-[200px] relative">
      <StickyBulkActionsBar selectedCount={3} onClear={() => {}} itemLabel="order">
        <Button size="sm" variant="outline">Export</Button>
        <Button size="sm" variant="destructive">Cancel</Button>
      </StickyBulkActionsBar>
    </div>
  ),
};
