import type { Meta, StoryObj } from '@storybook/nextjs';
import { Toggle } from './toggle';
import { Bold, Italic, Underline } from 'lucide-react';

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: () => <Toggle aria-label="Toggle bold"><Bold /></Toggle>,
};

export const WithText: Story = {
  render: () => <Toggle aria-label="Toggle italic"><Italic /> Italic</Toggle>,
};

export const Outline: Story = {
  render: () => <Toggle variant="outline" aria-label="Toggle underline"><Underline /></Toggle>,
};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Toggle size="sm" aria-label="Small"><Bold /></Toggle>
      <Toggle size="default" aria-label="Default"><Bold /></Toggle>
      <Toggle size="lg" aria-label="Large"><Bold /></Toggle>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => <Toggle disabled aria-label="Disabled"><Bold /></Toggle>,
};
