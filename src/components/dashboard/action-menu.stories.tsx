import type { Meta, StoryObj } from '@storybook/nextjs';
import { ActionMenu, SimpleActionMenu } from './action-menu';

const meta: Meta<typeof ActionMenu> = {
  title: 'Dashboard/ActionMenu',
  component: ActionMenu,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ActionMenu>;

export const Default: Story = {
  args: {
    groups: [
      {
        actions: [
          { label: 'Edit', onClick: () => {} },
          { label: 'Duplicate', onClick: () => {} },
        ],
      },
      {
        actions: [
          { label: 'Delete', variant: 'destructive', onClick: () => {} },
        ],
      },
    ],
  },
};

export const Simple: Story = {
  render: () => (
    <SimpleActionMenu
      actions={[
        { label: 'View', onClick: () => {} },
        { label: 'Edit', onClick: () => {} },
        { label: 'Delete', variant: 'destructive', onClick: () => {} },
      ]}
    />
  ),
};

export const WithDisabled: Story = {
  args: {
    groups: [
      {
        actions: [
          { label: 'Edit', onClick: () => {} },
          { label: 'Archive', disabled: true, disabledTooltip: 'Cannot archive active items' },
        ],
      },
    ],
  },
};
