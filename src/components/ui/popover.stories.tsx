import type { Meta, StoryObj } from '@storybook/nextjs';
import { Popover, PopoverTrigger, PopoverContent, PopoverHeader, PopoverTitle, PopoverDescription } from './popover';
import { Button } from './button';

const meta: Meta<typeof Popover> = {
  title: 'UI/Popover',
  component: Popover,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Open Popover</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Popover Title</PopoverTitle>
          <PopoverDescription>This is a popover description.</PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
};

export const Positions: Story = {
  render: () => (
    <div className="flex gap-4">
      <Popover>
        <PopoverTrigger asChild><Button variant="outline">Top</Button></PopoverTrigger>
        <PopoverContent side="top">Top popover</PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild><Button variant="outline">Bottom</Button></PopoverTrigger>
        <PopoverContent side="bottom">Bottom popover</PopoverContent>
      </Popover>
    </div>
  ),
};
