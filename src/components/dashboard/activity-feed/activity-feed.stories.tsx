import type { Meta, StoryObj } from "@storybook/nextjs";
import { ActivityFeed } from "./activity-feed";
import { ActivityItem } from "./activity-item";
import { ActivityFilters } from "./activity-filters";
import { ActivityType, type Activity, type TeamMember } from "./activity-types";

const meta: Meta<typeof ActivityFeed> = {
  title: "Dashboard/ActivityFeed",
  component: ActivityFeed,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[450px] border rounded-lg bg-background shadow-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ActivityFeed>;

// ============================================================================
// ActivityFeed Stories
// ============================================================================

export const Default: Story = {
  args: {
    maxHeight: "500px",
    showFilters: true,
    showHeader: true,
  },
};

export const CompactItems: Story = {
  args: {
    maxHeight: "500px",
    showFilters: true,
    showHeader: true,
    compactItems: true,
  },
};

export const NoHeader: Story = {
  args: {
    maxHeight: "500px",
    showFilters: true,
    showHeader: false,
  },
};

export const NoFilters: Story = {
  args: {
    maxHeight: "500px",
    showFilters: false,
    showHeader: true,
  },
};

export const MinimalView: Story = {
  args: {
    maxHeight: "400px",
    showFilters: false,
    showHeader: false,
    compactItems: true,
  },
};

// ============================================================================
// ActivityItem Stories
// ============================================================================

const mockTeamMembers: TeamMember[] = [
  {
    id: "user-1",
    name: "Sarah Chen",
    email: "sarah@example.com",
    role: "Admin",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
  },
  {
    id: "user-2",
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Sales Manager",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
  },
];

const mockActivities: Activity[] = [
  {
    id: "1",
    type: ActivityType.ORDER_CREATED,
    actor: mockTeamMembers[0],
    message: 'created order ORD-12345 for John Smith',
    target: {
      id: "ORD-12345",
      type: "order",
      name: "ORD-12345",
      href: "/dashboard/orders/ORD-12345",
    },
    createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    read: false,
    href: "/dashboard/orders/ORD-12345",
  },
  {
    id: "2",
    type: ActivityType.COMMENT_ADDED,
    actor: mockTeamMembers[1],
    message: 'commented on ORD-12345: "Hey @Sarah Chen, can you check this order?"',
    mentions: [
      {
        userId: "user-1",
        name: "Sarah Chen",
        startIndex: 35,
        endIndex: 46,
      },
    ],
    target: {
      id: "ORD-12345",
      type: "order",
      name: "ORD-12345",
      href: "/dashboard/orders/ORD-12345",
    },
    createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
    read: false,
    href: "/dashboard/orders/ORD-12345",
  },
  {
    id: "3",
    type: ActivityType.PRODUCT_UPDATED,
    actor: mockTeamMembers[0],
    message: 'updated product "Blue T-Shirt"',
    target: {
      id: "prod-blue-tshirt",
      type: "product",
      name: "Blue T-Shirt",
      href: "/dashboard/products",
    },
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    read: true,
    href: "/dashboard/products",
  },
  {
    id: "4",
    type: ActivityType.CUSTOMER_JOINED,
    actor: {
      id: "cust-1",
      name: "Maria Garcia",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria",
    },
    message: "New customer Maria Garcia joined",
    target: {
      id: "cust-1",
      type: "customer",
      name: "Maria Garcia",
      href: "/dashboard/customers",
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: true,
    href: "/dashboard/customers",
  },
  {
    id: "5",
    type: ActivityType.ORDER_SHIPPED,
    actor: mockTeamMembers[1],
    message: "shipped order ORD-12340",
    target: {
      id: "ORD-12340",
      type: "order",
      name: "ORD-12340",
      href: "/dashboard/orders/ORD-12340",
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    read: true,
    href: "/dashboard/orders/ORD-12340",
  },
  {
    id: "6",
    type: ActivityType.REFUND_PROCESSED,
    actor: mockTeamMembers[0],
    message: "processed refund of $45.99 for order ORD-12335",
    target: {
      id: "ORD-12335",
      type: "order",
      name: "ORD-12335",
      href: "/dashboard/orders/ORD-12335",
    },
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    read: true,
    href: "/dashboard/orders/ORD-12335",
    metadata: { amount: 45.99 },
  },
  {
    id: "7",
    type: ActivityType.REVIEW_RECEIVED,
    actor: {
      id: "cust-2",
      name: "David Wilson",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
    message: 'David Wilson left a 5-star review for "Wireless Headphones"',
    target: {
      id: "prod-wireless-headphones",
      type: "product",
      name: "Wireless Headphones",
      href: "/dashboard/products",
    },
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000), // 2 days ago
    read: true,
    href: "/dashboard/products",
    metadata: { stars: 5 },
  },
];

// Meta for ActivityItem stories (used for documentation)
const _activityItemMeta: Meta<typeof ActivityItem> = {
  title: "Dashboard/ActivityFeed/ActivityItem",
  component: ActivityItem,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4 bg-background border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const ItemDefault: StoryObj<typeof ActivityItem> = {
  render: () => (
    <ActivityItem
      activity={mockActivities[0]}
      onClick={(activity) => console.log("Clicked:", activity.id)}
    />
  ),
};

export const ItemWithMention: StoryObj<typeof ActivityItem> = {
  render: () => (
    <ActivityItem
      activity={mockActivities[1]}
      onClick={(activity) => console.log("Clicked:", activity.id)}
      onMentionClick={(userId, name) => console.log("Mention clicked:", userId, name)}
    />
  ),
};

export const ItemRead: StoryObj<typeof ActivityItem> = {
  render: () => (
    <ActivityItem
      activity={mockActivities[2]}
      onClick={(activity) => console.log("Clicked:", activity.id)}
    />
  ),
};

export const ItemCompact: StoryObj<typeof ActivityItem> = {
  render: () => (
    <ActivityItem
      activity={mockActivities[0]}
      onClick={(activity) => console.log("Clicked:", activity.id)}
      compact
    />
  ),
};

export const ItemNoAvatar: StoryObj<typeof ActivityItem> = {
  render: () => (
    <ActivityItem
      activity={mockActivities[0]}
      onClick={(activity) => console.log("Clicked:", activity.id)}
      showAvatar={false}
    />
  ),
};

export const AllActivityTypes: StoryObj<typeof ActivityItem> = {
  render: () => (
    <div className="space-y-2">
      {mockActivities.map((activity) => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          onClick={(a) => console.log("Clicked:", a.id)}
        />
      ))}
    </div>
  ),
  decorators: [
    (Story) => (
      <div className="w-[450px] p-4 bg-background border rounded-lg max-h-[600px] overflow-auto">
        <Story />
      </div>
    ),
  ],
};

// ============================================================================
// ActivityFilters Stories
// ============================================================================

// Meta for ActivityFilters stories (used for documentation)
const _filtersMeta: Meta<typeof ActivityFilters> = {
  title: "Dashboard/ActivityFeed/ActivityFilters",
  component: ActivityFilters,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4 bg-background border rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export const FiltersDefault: StoryObj<typeof ActivityFilters> = {
  render: () => (
    <ActivityFilters
      filter={{}}
      onFilterChange={(filter) => console.log("Filter changed:", filter)}
      onReset={() => console.log("Reset filters")}
      teamMembers={mockTeamMembers}
    />
  ),
};

export const FiltersCompact: StoryObj<typeof ActivityFilters> = {
  render: () => (
    <ActivityFilters
      filter={{}}
      onFilterChange={(filter) => console.log("Filter changed:", filter)}
      onReset={() => console.log("Reset filters")}
      teamMembers={mockTeamMembers}
      compact
    />
  ),
};

export const FiltersWithActive: StoryObj<typeof ActivityFilters> = {
  render: () => (
    <ActivityFilters
      filter={{ category: "orders", mentionsOnly: true }}
      onFilterChange={(filter) => console.log("Filter changed:", filter)}
      onReset={() => console.log("Reset filters")}
      teamMembers={mockTeamMembers}
    />
  ),
};

export const FiltersNoTeamMembers: StoryObj<typeof ActivityFilters> = {
  render: () => (
    <ActivityFilters
      filter={{}}
      onFilterChange={(filter) => console.log("Filter changed:", filter)}
      onReset={() => console.log("Reset filters")}
    />
  ),
};
