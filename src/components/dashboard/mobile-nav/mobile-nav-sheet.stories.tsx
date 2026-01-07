import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { MobileNavSheet } from "./mobile-nav-sheet";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof MobileNavSheet> = {
    title: "Dashboard/MobileNav/MobileNavSheet",
    component: MobileNavSheet,
    parameters: {
        layout: "fullscreen",
        viewport: {
            defaultViewport: "mobile1",
        },
    },
    tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MobileNavSheet>;

// Interactive wrapper component
function SheetDemo({
    lowStockCount = 0,
    pendingReturnsCount = 0,
}: {
    lowStockCount?: number;
    pendingReturnsCount?: number;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-[400px] p-4 bg-background">
            <Button onClick={() => setOpen(true)}>Open Navigation Sheet</Button>
            <MobileNavSheet
                open={open}
                onOpenChange={setOpen}
                lowStockCount={lowStockCount}
                pendingReturnsCount={pendingReturnsCount}
            />
        </div>
    );
}

export const Default: Story = {
    render: () => <SheetDemo />,
};

export const WithLowStockBadge: Story = {
    render: () => <SheetDemo lowStockCount={8} />,
};

export const WithAllBadges: Story = {
    render: () => <SheetDemo lowStockCount={5} pendingReturnsCount={2} />,
};

// Pre-opened state for documentation
export const OpenState: Story = {
    args: {
        open: true,
        onOpenChange: () => {},
        lowStockCount: 3,
    },
    decorators: [
        (Story) => (
            <div className="min-h-[600px] bg-background">
                <Story />
            </div>
        ),
    ],
};
