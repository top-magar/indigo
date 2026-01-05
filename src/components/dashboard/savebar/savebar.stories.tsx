import type { Meta, StoryObj } from '@storybook/nextjs';
import { Savebar } from './savebar';

const meta: Meta<typeof Savebar> = {
  title: 'Dashboard/Savebar',
  component: Savebar,
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Savebar>;

export const Default: Story = {
  args: {
    show: true,
    onDiscard: () => {},
    onSave: () => {},
  },
};

export const WithDelete: Story = {
  args: {
    show: true,
    onDiscard: () => {},
    onSave: () => {},
    onDelete: () => {},
  },
};

export const Saving: Story = {
  args: {
    show: true,
    isSaving: true,
    onDiscard: () => {},
    onSave: () => {},
  },
};

export const WithErrors: Story = {
  args: {
    show: true,
    hasErrors: true,
    onDiscard: () => {},
    onSave: () => {},
  },
};
