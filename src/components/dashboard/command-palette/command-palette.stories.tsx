import type { Meta, StoryObj } from "@storybook/nextjs";
import * as React from "react";
import {
  Home01Icon,
  ShoppingCart01Icon,
  Package01Icon,
  UserMultipleIcon,
  Settings01Icon,
  Add01Icon,
  AnalyticsUpIcon,
  Layers01Icon,
  Store01Icon,
  Search01Icon,
  RefreshIcon,
} from "@hugeicons/core-free-icons";
import { CommandPalette, type CommandPaletteCommand } from "./command-palette";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

// Sample commands for stories
const sampleCommands: CommandPaletteCommand[] = [
  // Navigation
  {
    id: "nav-dashboard",
    label: "Go to Dashboard",
    description: "View dashboard overview",
    icon: Home01Icon,
    shortcut: ["g", "d"],
    keywords: ["home", "overview"],
    group: "navigation",
    onSelect: () => console.log("Navigate to Dashboard"),
  },
  {
    id: "nav-orders",
    label: "Go to Orders",
    description: "Manage customer orders",
    icon: ShoppingCart01Icon,
    shortcut: ["g", "o"],
    keywords: ["sales", "purchases"],
    group: "navigation",
    onSelect: () => console.log("Navigate to Orders"),
  },
  {
    id: "nav-products",
    label: "Go to Products",
    description: "Manage product catalog",
    icon: Package01Icon,
    shortcut: ["g", "p"],
    keywords: ["items", "catalog"],
    group: "navigation",
    onSelect: () => console.log("Navigate to Products"),
  },
  {
    id: "nav-customers",
    label: "Go to Customers",
    description: "View customer information",
    icon: UserMultipleIcon,
    shortcut: ["g", "c"],
    keywords: ["users", "clients"],
    group: "navigation",
    onSelect: () => console.log("Navigate to Customers"),
  },
  {
    id: "nav-analytics",
    label: "Go to Analytics",
    description: "View reports and insights",
    icon: AnalyticsUpIcon,
    shortcut: ["g", "a"],
    keywords: ["reports", "stats"],
    group: "navigation",
    onSelect: () => console.log("Navigate to Analytics"),
  },
  {
    id: "nav-inventory",
    label: "Go to Inventory",
    description: "Manage stock levels",
    icon: Layers01Icon,
    keywords: ["stock", "warehouse"],
    group: "navigation",
    onSelect: () => console.log("Navigate to Inventory"),
  },
  {
    id: "nav-settings",
    label: "Go to Settings",
    description: "Configure store settings",
    icon: Settings01Icon,
    shortcut: ["g", "s"],
    keywords: ["preferences", "config"],
    group: "navigation",
    onSelect: () => console.log("Navigate to Settings"),
  },

  // Actions
  {
    id: "action-new-product",
    label: "Create New Product",
    description: "Add a new product to your catalog",
    icon: Add01Icon,
    shortcut: ["n", "p"],
    keywords: ["add", "create"],
    group: "actions",
    onSelect: () => console.log("Create new product"),
  },
  {
    id: "action-new-order",
    label: "Create New Order",
    description: "Create a manual order",
    icon: Add01Icon,
    shortcut: ["n", "o"],
    keywords: ["add", "create", "sale"],
    group: "actions",
    onSelect: () => console.log("Create new order"),
  },
  {
    id: "action-search",
    label: "Search Orders",
    description: "Find orders by ID or customer",
    icon: Search01Icon,
    keywords: ["find", "lookup"],
    group: "actions",
    onSelect: () => console.log("Search orders"),
  },
  {
    id: "action-refresh",
    label: "Refresh Data",
    description: "Reload current page data",
    icon: RefreshIcon,
    shortcut: ["mod", "r"],
    keywords: ["reload", "update"],
    group: "actions",
    onSelect: () => console.log("Refresh data"),
  },

  // Settings
  {
    id: "settings-store",
    label: "Store Settings",
    description: "Configure store details",
    icon: Store01Icon,
    keywords: ["shop", "business"],
    group: "settings",
    onSelect: () => console.log("Open store settings"),
  },
];

// Interactive wrapper component
function CommandPaletteDemo({
  commands,
  ...props
}: Omit<React.ComponentProps<typeof CommandPalette>, "open" | "onOpenChange">) {
  const [open, setOpen] = React.useState(false);

  // Listen for keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <Button onClick={() => setOpen(true)} variant="outline">
        Open Command Palette
        <KbdGroup className="ml-2">
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </Button>
      <p className="text-xs text-muted-foreground">
        Or press <Kbd>⌘</Kbd> + <Kbd>K</Kbd> to open
      </p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={commands}
        {...props}
      />
    </div>
  );
}

const meta: Meta<typeof CommandPalette> = {
  title: "Dashboard/CommandPalette",
  component: CommandPalette,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A VS Code/Linear-style command palette for quick navigation and actions. Supports keyboard navigation, search highlighting, and grouped commands.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Whether the command palette is open",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the search input",
    },
    emptyMessage: {
      control: "text",
      description: "Message shown when no results match the search",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

export const Default: Story = {
  render: () => <CommandPaletteDemo commands={sampleCommands} />,
};

export const WithCustomPlaceholder: Story = {
  render: () => (
    <CommandPaletteDemo
      commands={sampleCommands}
      placeholder="What would you like to do?"
    />
  ),
};

export const WithCustomEmptyMessage: Story = {
  render: () => (
    <CommandPaletteDemo
      commands={sampleCommands}
      emptyMessage="No commands match your search. Try something else."
    />
  ),
};

export const NavigationOnly: Story = {
  render: () => (
    <CommandPaletteDemo
      commands={sampleCommands.filter((cmd) => cmd.group === "navigation")}
      groups={[{ id: "navigation", label: "Navigation", priority: 1 }]}
    />
  ),
};

export const ActionsOnly: Story = {
  render: () => (
    <CommandPaletteDemo
      commands={sampleCommands.filter((cmd) => cmd.group === "actions")}
      groups={[{ id: "actions", label: "Quick Actions", priority: 1 }]}
    />
  ),
};

export const WithDisabledCommands: Story = {
  render: () => {
    const commandsWithDisabled = sampleCommands.map((cmd) =>
      cmd.id === "action-new-order"
        ? { ...cmd, disabled: true, description: "Coming soon" }
        : cmd
    );
    return <CommandPaletteDemo commands={commandsWithDisabled} />;
  },
};

export const MinimalCommands: Story = {
  render: () => {
    const minimalCommands: CommandPaletteCommand[] = [
      {
        id: "home",
        label: "Home",
        icon: Home01Icon,
        group: "navigation",
        onSelect: () => console.log("Go home"),
      },
      {
        id: "settings",
        label: "Settings",
        icon: Settings01Icon,
        group: "navigation",
        onSelect: () => console.log("Go to settings"),
      },
    ];
    return <CommandPaletteDemo commands={minimalCommands} />;
  },
};

export const CustomGroups: Story = {
  render: () => {
    const customGroups = [
      { id: "recent", label: "Recent", priority: 1 },
      { id: "favorites", label: "Favorites", priority: 2 },
      { id: "all", label: "All Commands", priority: 3 },
    ];

    const customCommands: CommandPaletteCommand[] = [
      {
        id: "recent-1",
        label: "Orders Page",
        description: "Visited 2 minutes ago",
        icon: ShoppingCart01Icon,
        group: "recent",
        onSelect: () => console.log("Go to orders"),
      },
      {
        id: "recent-2",
        label: "Product #1234",
        description: "Edited 5 minutes ago",
        icon: Package01Icon,
        group: "recent",
        onSelect: () => console.log("Go to product"),
      },
      {
        id: "fav-1",
        label: "Analytics Dashboard",
        icon: AnalyticsUpIcon,
        group: "favorites",
        onSelect: () => console.log("Go to analytics"),
      },
      {
        id: "all-1",
        label: "Create Product",
        icon: Add01Icon,
        shortcut: ["n", "p"],
        group: "all",
        onSelect: () => console.log("Create product"),
      },
      {
        id: "all-2",
        label: "Store Settings",
        icon: Store01Icon,
        group: "all",
        onSelect: () => console.log("Go to settings"),
      },
    ];

    return <CommandPaletteDemo commands={customCommands} groups={customGroups} />;
  },
};

export const OpenByDefault: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <div>
        <Button onClick={() => setOpen(true)} variant="outline">
          Reopen
        </Button>
        <CommandPalette
          open={open}
          onOpenChange={setOpen}
          commands={sampleCommands}
        />
      </div>
    );
  },
};

// Story showing search highlighting
export const SearchHighlighting: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground max-w-md text-center">
        Open the command palette and type &quot;product&quot; to see how matching text is
        highlighted in the results.
      </p>
      <CommandPaletteDemo commands={sampleCommands} />
    </div>
  ),
};

// Story demonstrating keyboard navigation
export const KeyboardNavigation: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <div className="text-sm text-muted-foreground max-w-md text-center space-y-2">
        <p>Keyboard shortcuts:</p>
        <ul className="space-y-1">
          <li>
            <Kbd>↑</Kbd> <Kbd>↓</Kbd> - Navigate between items
          </li>
          <li>
            <Kbd>↵</Kbd> - Select highlighted item
          </li>
          <li>
            <Kbd>Esc</Kbd> - Close palette
          </li>
        </ul>
      </div>
      <CommandPaletteDemo commands={sampleCommands} />
    </div>
  ),
};
