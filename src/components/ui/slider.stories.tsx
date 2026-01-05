import type { Meta, StoryObj } from '@storybook/nextjs';
import { Slider } from './slider';

const meta: Meta<typeof Slider> = {
  title: 'UI/Slider',
  component: Slider,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => <Slider defaultValue={[50]} max={100} step={1} className="w-[300px]" />,
};

export const Range: Story = {
  render: () => <Slider defaultValue={[25, 75]} max={100} step={1} className="w-[300px]" />,
};

export const Disabled: Story = {
  render: () => <Slider defaultValue={[50]} max={100} disabled className="w-[300px]" />,
};

export const Vertical: Story = {
  render: () => <Slider defaultValue={[50]} max={100} orientation="vertical" className="h-[200px]" />,
};
