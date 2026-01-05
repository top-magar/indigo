import type { Meta, StoryObj } from '@storybook/nextjs';
import { Timeline, TimelineEvent, TimelineNote, TimelineDateGroup } from './timeline';

const meta: Meta<typeof Timeline> = {
  title: 'Dashboard/Timeline',
  component: Timeline,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Default: Story = {
  render: () => (
    <Timeline className="w-[400px]">
      <TimelineDateGroup label="Today" />
      <TimelineEvent
        title="Order placed"
        date={new Date()}
        actor={{ name: 'John Doe', type: 'user' }}
      />
      <TimelineEvent
        title="Payment received"
        date={new Date(Date.now() - 3600000)}
        actor={{ name: 'System', type: 'system' }}
        isLastInGroup
      />
    </Timeline>
  ),
};

export const WithNotes: Story = {
  render: () => (
    <Timeline className="w-[400px]">
      <TimelineNote
        id="1"
        message="Customer requested express shipping."
        date={new Date()}
        actor={{ name: 'Support Agent', type: 'user' }}
      />
      <TimelineEvent
        title="Order shipped"
        date={new Date(Date.now() - 7200000)}
        isLastInGroup
      />
    </Timeline>
  ),
};
