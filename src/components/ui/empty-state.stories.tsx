import type { Meta, StoryObj } from '@storybook/nextjs';
import { EmptyState, NoResults, NoRecords } from './empty-state';

const meta: Meta<typeof EmptyState> = {
  title: 'UI/EmptyState',
  component: EmptyState,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: 'No items found',
    description: 'Get started by creating your first item.',
    action: { label: 'Create Item', onClick: () => {} },
  },
};

export const Small: Story = {
  args: {
    title: 'No data',
    description: 'Nothing to display.',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    title: 'Welcome!',
    description: 'Start building something amazing.',
    action: { label: 'Get Started', onClick: () => {} },
    size: 'lg',
  },
};

export const SearchNoResults: Story = {
  render: () => <NoResults onClear={() => {}} />,
};

export const EmptyCollection: Story = {
  render: () => (
    <NoRecords
      title="No products yet"
      message="Add your first product to get started"
      action={{ label: 'Add Product', onClick: () => {} }}
    />
  ),
};
