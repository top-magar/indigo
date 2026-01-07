import type { Meta, StoryObj } from "@storybook/nextjs";
import { MobileBottomNav } from "./mobile-bottom-nav";

const meta: Meta<typeof MobileBottomNav> = {
    title: "Dashboard/MobileNav/MobileBottomNav",
    component: MobileBottomNav,
    parameters: {
        layout: "fullscreen",
        viewport: {
            defaultViewport: "mobile1",
        },
        // Disable the default padding
        docs: {
            story: {
                inline: false,
                iframeHeight: 200,
            },
        },
    },
    tags: ["autodocs"],
    decorators: [
        (Story) => (
            <div className="relative min-h-[200px] bg-background">
                {/* Content placeholder */}
                <div className="p-4 pb-20">
                    <p className="text-sm text-muted-foreground">
                        Scroll down to see the fixed bottom navigation
                    </p>
                </div>
                <Story />
            </div>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof MobileBottomNav>;

export const Default: Story = {
    args: {},
};

export const WithPendingOrders: Story = {
    args: {
        pendingOrdersCount: 5,
    },
};

export const WithManyPendingOrders: Story = {
    args: {
        pendingOrdersCount: 150,
    },
};

export const WithLowStock: Story = {
    args: {
        lowStockCount: 12,
    },
};

export const WithAllBadges: Story = {
    args: {
        pendingOrdersCount: 8,
        lowStockCount: 3,
        pendingReturnsCount: 2,
    },
};

export const NoBadges: Story = {
    args: {
        pendingOrdersCount: 0,
        lowStockCount: 0,
        pendingReturnsCount: 0,
    },
};

// Interactive story showing the sheet
export const WithSheetOpen: Story = {
    args: {
        pendingOrdersCount: 5,
        lowStockCount: 3,
    },
    parameters: {
        docs: {
            description: {
                story: 'Click the "More" button to open the navigation sheet.',
            },
        },
    },
};
