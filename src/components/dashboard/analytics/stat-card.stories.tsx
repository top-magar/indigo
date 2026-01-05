import type { Meta, StoryObj } from '@storybook/nextjs';
import { StatCard } from './stat-card';
import { DollarSignIcon, UsersIcon, ShoppingCartIcon, TrendingUpIcon } from 'lucide-react';

const meta: Meta<typeof StatCard> = {
  title: 'Dashboard/StatCard',
  component: StatCard,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof StatCard>;

export const Default: Story = {
  args: {
    title: 'Total Revenue',
    value: '$45,231.89',
    subtitle: 'from last month',
  },
};

export const WithTrendUp: Story = {
  args: {
    title: 'Total Revenue',
    value: '$45,231.89',
    trend: { value: 20.1, direction: 'up' },
    subtitle: 'from last month',
  },
};

export const WithTrendDown: Story = {
  args: {
    title: 'Bounce Rate',
    value: '42.5%',
    trend: { value: 5.2, direction: 'down' },
    subtitle: 'from last week',
  },
};

export const Grid: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 w-[600px]">
      <StatCard title="Revenue" value="$12,345" trend={{ value: 12, direction: 'up' }} />
      <StatCard title="Orders" value="1,234" trend={{ value: 8, direction: 'up' }} />
      <StatCard title="Customers" value="567" trend={{ value: 3, direction: 'down' }} />
      <StatCard title="Avg Order" value="$89.50" subtitle="per order" />
    </div>
  ),
};
