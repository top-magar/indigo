import type { Meta, StoryObj } from '@storybook/nextjs';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './collapsible';
import { Button } from './button';

const meta: Meta = {
  title: 'UI/Collapsible',
  component: Collapsible,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: function Render() {
    return (
      <Collapsible className="w-[350px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">Click to expand</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">Toggle</Button>
          </CollapsibleTrigger>
        </div>
        <div className="rounded-md border px-4 py-2 text-sm">Always visible</div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-2 text-sm">Hidden content 1</div>
          <div className="rounded-md border px-4 py-2 text-sm">Hidden content 2</div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};
