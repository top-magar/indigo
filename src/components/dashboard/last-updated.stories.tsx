import type { Meta, StoryObj } from "@storybook/nextjs";
import { LastUpdated, LastUpdatedInline } from "./last-updated";

const meta: Meta<typeof LastUpdated> = {
    title: "Dashboard/LastUpdated",
    component: LastUpdated,
    parameters: {
        layout: "centered",
    },
    tags: ["autodocs"],
    argTypes: {
        timestamp: {
            control: "date",
            description: "The timestamp when data was last updated",
        },
        onRefresh: {
            action: "refresh",
            description: "Callback function to refresh data",
        },
        isRefreshing: {
            control: "boolean",
            description: "Whether a refresh is currently in progress",
        },
        staleThreshold: {
            control: { type: "number", min: 1, max: 60 },
            description: "Minutes after which data is considered stale",
        },
        showRefreshButton: {
            control: "boolean",
            description: "Show the refresh button",
        },
        size: {
            control: "select",
            options: ["sm", "default"],
            description: "Size variant",
        },
    },
};

export default meta;
type Story = StoryObj<typeof LastUpdated>;

// Helper to create timestamps
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000);

export const Default: Story = {
    args: {
        timestamp: minutesAgo(2),
        showRefreshButton: true,
        staleThreshold: 5,
    },
};

export const JustUpdated: Story = {
    args: {
        timestamp: new Date(),
        showRefreshButton: true,
    },
};

export const StaleData: Story = {
    args: {
        timestamp: minutesAgo(10),
        showRefreshButton: true,
        staleThreshold: 5,
    },
};

export const Refreshing: Story = {
    args: {
        timestamp: minutesAgo(3),
        isRefreshing: true,
        showRefreshButton: true,
    },
};

export const SmallSize: Story = {
    args: {
        timestamp: minutesAgo(1),
        size: "sm",
        showRefreshButton: true,
    },
};

export const WithoutRefreshButton: Story = {
    args: {
        timestamp: minutesAgo(2),
        showRefreshButton: false,
    },
};

export const CustomStaleThreshold: Story = {
    args: {
        timestamp: minutesAgo(15),
        staleThreshold: 30,
        showRefreshButton: true,
    },
};

// Inline variant stories
export const InlineVariant: StoryObj<typeof LastUpdatedInline> = {
    render: () => (
        <div className="flex items-center gap-2 text-sm">
            <span>Orders</span>
            <span className="text-muted-foreground">-</span>
            <LastUpdatedInline timestamp={minutesAgo(3)} />
        </div>
    ),
};

export const InlineStale: StoryObj<typeof LastUpdatedInline> = {
    render: () => (
        <div className="flex items-center gap-2 text-sm">
            <span>Revenue</span>
            <span className="text-muted-foreground">-</span>
            <LastUpdatedInline timestamp={minutesAgo(10)} isStale />
        </div>
    ),
};
