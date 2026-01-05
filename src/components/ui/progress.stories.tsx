import type { Meta, StoryObj } from '@storybook/nextjs';
import { Progress } from './progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => <Progress value={33} className="w-[300px]" />,
};

export const Complete: Story = {
  render: () => <Progress value={100} className="w-[300px]" />,
};

export const Empty: Story = {
  render: () => <Progress value={0} className="w-[300px]" />,
};

export const Various: Story = {
  render: () => (
    <div className="w-[300px] space-y-4">
      <Progress value={25} />
      <Progress value={50} />
      <Progress value={75} />
      <Progress value={100} />
    </div>
  ),
};
