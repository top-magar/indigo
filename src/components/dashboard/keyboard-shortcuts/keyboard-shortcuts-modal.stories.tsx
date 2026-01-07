import type { Meta, StoryObj } from "@storybook/nextjs";
import * as React from "react";
import {
  Home01Icon,
  ShoppingCart01Icon,
  Package01Icon,
  Settings01Icon,
  Search01Icon,
  Add01Icon,
  PencilEdit01Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import { KeyboardShortcutsModal } from "./keyboard-shortcuts-modal";
import { defaultShortcutsConfig } from "./shortcuts-config";
import type { ShortcutCategory } from "./types";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

// Interactive wrapper component
function KeyboardShortcutsDemo({
  categories,
  ...props
}: Omit<
  React.ComponentProps<typeof KeyboardShortcutsModal>,
  "open" | "onOpenChange"
>) {
  const [open, setOpen] = React.useState(false);

  // Listen for "?" key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if we're in an input
      const activeElement = document.activeElement;
      const isInput =
        activeElement?.tagName === "INPUT" ||
        activeElement?.tagName === "TEXTAREA";

      if (e.key === "?" && !isInput) {
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
        Open Keyboard Shortcuts
      </Button>
      <p className="text-xs text-muted-foreground">
        Or press <Kbd>?</Kbd> to open
      </p>
      <KeyboardShortcutsModal
        open={open}
        onOpenChange={setOpen}
        categories={categories}
        {...props}
      />
    </div>
  );
}

const meta: Meta<typeof KeyboardShortcutsModal> = {
  title: "Dashboard/KeyboardShortcutsModal",
  component: KeyboardShortcutsModal,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A GitHub-style keyboard shortcuts help modal. Displays all available shortcuts organized by category with search/filter functionality. Triggered by pressing the ? key.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Whether the modal is open",
    },
    title: {
      control: "text",
      description: "Modal title",
    },
    description: {
      control: "text",
      description: "Modal description",
    },
  },
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcutsModal>;

export const Default: Story = {
  render: () => (
    <KeyboardShortcutsDemo categories={defaultShortcutsConfig.categories} />
  ),
};

export const CustomTitle: Story = {
  render: () => (
    <KeyboardShortcutsDemo
      categories={defaultShortcutsConfig.categories}
      title="Hotkeys"
      description="Master these shortcuts to work faster."
    />
  ),
};

export const MinimalShortcuts: Story = {
  render: () => {
    const minimalCategories: ShortcutCategory[] = [
      {
        id: "navigation",
        label: "Navigation",
        priority: 1,
        shortcuts: [
          {
            id: "home",
            label: "Go to Home",
            keys: ["g", "h"],
            isSequence: true,
            icon: Home01Icon,
          },
          {
            id: "settings",
            label: "Go to Settings",
            keys: ["g", "s"],
            isSequence: true,
            icon: Settings01Icon,
          },
        ],
      },
      {
        id: "search",
        label: "Search",
        priority: 2,
        shortcuts: [
          {
            id: "focus-search",
            label: "Focus search",
            keys: ["/"],
            icon: Search01Icon,
          },
        ],
      },
    ];

    return <KeyboardShortcutsDemo categories={minimalCategories} />;
  },
};

export const NavigationOnly: Story = {
  render: () => {
    const navigationCategories: ShortcutCategory[] = [
      {
        id: "navigation",
        label: "Navigation",
        priority: 1,
        shortcuts: [
          {
            id: "nav-home",
            label: "Go to Home",
            keys: ["g", "h"],
            isSequence: true,
            icon: Home01Icon,
          },
          {
            id: "nav-orders",
            label: "Go to Orders",
            keys: ["g", "o"],
            isSequence: true,
            icon: ShoppingCart01Icon,
          },
          {
            id: "nav-products",
            label: "Go to Products",
            keys: ["g", "p"],
            isSequence: true,
            icon: Package01Icon,
          },
          {
            id: "nav-settings",
            label: "Go to Settings",
            keys: ["g", "s"],
            isSequence: true,
            icon: Settings01Icon,
          },
        ],
      },
    ];

    return <KeyboardShortcutsDemo categories={navigationCategories} />;
  },
};

export const ActionsOnly: Story = {
  render: () => {
    const actionCategories: ShortcutCategory[] = [
      {
        id: "actions",
        label: "Actions",
        icon: Add01Icon,
        priority: 1,
        shortcuts: [
          {
            id: "new",
            label: "New item",
            keys: ["n"],
            icon: Add01Icon,
          },
          {
            id: "edit",
            label: "Edit selected",
            keys: ["e"],
            icon: PencilEdit01Icon,
          },
          {
            id: "delete",
            label: "Delete selected",
            keys: ["d"],
            icon: Delete01Icon,
          },
          {
            id: "save",
            label: "Save changes",
            keys: ["mod", "s"],
          },
          {
            id: "duplicate",
            label: "Duplicate",
            keys: ["mod", "d"],
          },
        ],
      },
    ];

    return <KeyboardShortcutsDemo categories={actionCategories} />;
  },
};


export const WithDescriptions: Story = {
  render: () => {
    const categoriesWithDescriptions: ShortcutCategory[] = [
      {
        id: "navigation",
        label: "Navigation",
        priority: 1,
        shortcuts: [
          {
            id: "home",
            label: "Go to Home",
            keys: ["g", "h"],
            isSequence: true,
            description: "Navigate to the dashboard home page",
            icon: Home01Icon,
          },
          {
            id: "orders",
            label: "Go to Orders",
            keys: ["g", "o"],
            isSequence: true,
            description: "View and manage customer orders",
            icon: ShoppingCart01Icon,
          },
        ],
      },
      {
        id: "actions",
        label: "Actions",
        priority: 2,
        shortcuts: [
          {
            id: "new",
            label: "New item",
            keys: ["n"],
            description: "Create a new item in the current view",
            icon: Add01Icon,
          },
          {
            id: "save",
            label: "Save changes",
            keys: ["mod", "s"],
            description: "Save all pending changes",
          },
        ],
      },
    ];

    return <KeyboardShortcutsDemo categories={categoriesWithDescriptions} />;
  },
};

export const ManyShortcuts: Story = {
  render: () => {
    // Generate many shortcuts to test scrolling
    const manyCategories: ShortcutCategory[] = [
      {
        id: "navigation",
        label: "Navigation",
        priority: 1,
        shortcuts: Array.from({ length: 10 }, (_, i) => ({
          id: `nav-${i}`,
          label: `Navigate to Page ${i + 1}`,
          keys: ["g", String(i + 1)],
          isSequence: true,
        })),
      },
      {
        id: "actions",
        label: "Actions",
        priority: 2,
        shortcuts: Array.from({ length: 8 }, (_, i) => ({
          id: `action-${i}`,
          label: `Action ${i + 1}`,
          keys: ["a", String(i + 1)],
          isSequence: true,
        })),
      },
      {
        id: "views",
        label: "Views",
        priority: 3,
        shortcuts: Array.from({ length: 5 }, (_, i) => ({
          id: `view-${i}`,
          label: `View ${i + 1}`,
          keys: [String(i + 1)],
        })),
      },
    ];

    return <KeyboardShortcutsDemo categories={manyCategories} />;
  },
};

// Wrapper component for OpenByDefault story
function OpenByDefaultDemo() {
  const [open, setOpen] = React.useState(true);

  return (
    <div>
      <Button onClick={() => setOpen(true)} variant="outline">
        Reopen
      </Button>
      <KeyboardShortcutsModal
        open={open}
        onOpenChange={setOpen}
        categories={defaultShortcutsConfig.categories}
      />
    </div>
  );
}

export const OpenByDefault: Story = {
  render: () => <OpenByDefaultDemo />,
};

// Story showing search functionality
export const SearchDemo: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-muted-foreground max-w-md text-center">
        Open the modal and try searching for &quot;go&quot;, &quot;new&quot;, or &quot;search&quot; to
        filter shortcuts.
      </p>
      <KeyboardShortcutsDemo categories={defaultShortcutsConfig.categories} />
    </div>
  ),
};

// Story showing key sequence vs combo
export const KeySequencesVsCombos: Story = {
  render: () => {
    const mixedCategories: ShortcutCategory[] = [
      {
        id: "sequences",
        label: "Key Sequences (press one after another)",
        priority: 1,
        shortcuts: [
          {
            id: "seq-1",
            label: "Go to Home",
            keys: ["g", "h"],
            isSequence: true,
            description: "Press G, then H",
          },
          {
            id: "seq-2",
            label: "Go to Orders",
            keys: ["g", "o"],
            isSequence: true,
            description: "Press G, then O",
          },
        ],
      },
      {
        id: "combos",
        label: "Key Combos (press together)",
        priority: 2,
        shortcuts: [
          {
            id: "combo-1",
            label: "Save",
            keys: ["mod", "s"],
            description: "Press Cmd/Ctrl + S together",
          },
          {
            id: "combo-2",
            label: "Command Palette",
            keys: ["mod", "k"],
            description: "Press Cmd/Ctrl + K together",
          },
        ],
      },
    ];

    return <KeyboardShortcutsDemo categories={mixedCategories} />;
  },
};
