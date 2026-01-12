"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Home,
  ShoppingCart,
  Package,
  Users,
  Settings,
  Plus,
  TrendingUp,
  Layers,
  Tags,
  Store,
  LogOut,
  RefreshCw,
  Search,
  FileOutput,
  Bell,
} from "lucide-react";
import {
  CommandPalette,
  type CommandPaletteCommand,
  type CommandPaletteGroup,
} from "./command-palette";

// Context types
interface CommandPaletteContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  registerCommand: (command: CommandPaletteCommand) => void;
  unregisterCommand: (id: string) => void;
  registerCommands: (commands: CommandPaletteCommand[]) => void;
  clearCommands: () => void;
}

const CommandPaletteContext = React.createContext<CommandPaletteContextValue | null>(null);

// Provider props
export interface CommandPaletteProviderProps {
  children: React.ReactNode;
  /** Custom groups to organize commands */
  groups?: CommandPaletteGroup[];
  /** Whether to include default navigation commands */
  includeDefaultCommands?: boolean;
  /** Base path for dashboard routes */
  basePath?: string;
  /** Callback when user signs out */
  onSignOut?: () => void;
}

// Default groups
const defaultGroups: CommandPaletteGroup[] = [
  { id: "navigation", label: "Navigation", priority: 1 },
  { id: "actions", label: "Quick Actions", priority: 2 },
  { id: "settings", label: "Settings", priority: 3 },
];

export function CommandPaletteProvider({
  children,
  groups = defaultGroups,
  includeDefaultCommands = true,
  basePath = "/dashboard",
  onSignOut,
}: CommandPaletteProviderProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [commands, setCommands] = React.useState<Map<string, CommandPaletteCommand>>(
    new Map()
  );

  // Toggle command palette
  const toggle = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  // Register a single command
  const registerCommand = React.useCallback((command: CommandPaletteCommand) => {
    setCommands((prev) => {
      const next = new Map(prev);
      next.set(command.id, command);
      return next;
    });
  }, []);

  // Unregister a command
  const unregisterCommand = React.useCallback((id: string) => {
    setCommands((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  // Register multiple commands at once
  const registerCommands = React.useCallback((newCommands: CommandPaletteCommand[]) => {
    setCommands((prev) => {
      const next = new Map(prev);
      newCommands.forEach((command) => {
        next.set(command.id, command);
      });
      return next;
    });
  }, []);

  // Clear all commands
  const clearCommands = React.useCallback(() => {
    setCommands(new Map());
  }, []);

  // Register default commands
  React.useEffect(() => {
    if (!includeDefaultCommands) return;

    const defaultCommands: CommandPaletteCommand[] = [
      // Navigation commands
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        description: "View dashboard overview",
        icon: Home,
        shortcut: ["g", "d"],
        keywords: ["home", "overview", "main"],
        group: "navigation",
        onSelect: () => router.push(basePath),
      },
      {
        id: "nav-orders",
        label: "Go to Orders",
        description: "Manage customer orders",
        icon: ShoppingCart,
        shortcut: ["g", "o"],
        keywords: ["sales", "purchases", "transactions"],
        group: "navigation",
        onSelect: () => router.push(`${basePath}/orders`),
      },
      {
        id: "nav-products",
        label: "Go to Products",
        description: "Manage product catalog",
        icon: Package,
        shortcut: ["g", "p"],
        keywords: ["items", "catalog", "inventory"],
        group: "navigation",
        onSelect: () => router.push(`${basePath}/products`),
      },
      {
        id: "nav-customers",
        label: "Go to Customers",
        description: "View customer information",
        icon: Users,
        shortcut: ["g", "c"],
        keywords: ["users", "clients", "buyers"],
        group: "navigation",
        onSelect: () => router.push(`${basePath}/customers`),
      },
      {
        id: "nav-analytics",
        label: "Go to Analytics",
        description: "View reports and insights",
        icon: TrendingUp,
        shortcut: ["g", "a"],
        keywords: ["reports", "stats", "metrics", "insights"],
        group: "navigation",
        onSelect: () => router.push(`${basePath}/analytics`),
      },
      {
        id: "nav-inventory",
        label: "Go to Inventory",
        description: "Manage stock levels",
        icon: Layers,
        shortcut: ["g", "i"],
        keywords: ["stock", "warehouse", "quantity"],
        group: "navigation",
        onSelect: () => router.push(`${basePath}/inventory`),
      },
      {
        id: "nav-categories",
        label: "Go to Categories",
        description: "Organize product categories",
        icon: Tags,
        keywords: ["tags", "organize", "groups"],
        group: "navigation",
        onSelect: () => router.push(`${basePath}/categories`),
      },
      {
        id: "nav-storefront",
        label: "Go to Storefront Editor",
        description: "Customize your store appearance",
        icon: Store,
        keywords: ["design", "theme", "customize", "editor"],
        group: "navigation",
        onSelect: () => router.push("/storefront"),
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        description: "Configure store settings",
        icon: Settings,
        shortcut: ["g", "s"],
        keywords: ["preferences", "config", "options"],
        group: "navigation",
        onSelect: () => router.push(`${basePath}/settings`),
      },

      // Action commands
      {
        id: "action-new-product",
        label: "Create New Product",
        description: "Add a new product to your catalog",
        icon: Plus,
        shortcut: ["n", "p"],
        keywords: ["add", "create", "new", "product"],
        group: "actions",
        onSelect: () => router.push(`${basePath}/products/new`),
      },
      {
        id: "action-new-order",
        label: "Create New Order",
        description: "Create a manual order",
        icon: Plus,
        shortcut: ["n", "o"],
        keywords: ["add", "create", "new", "order", "sale"],
        group: "actions",
        onSelect: () => router.push(`${basePath}/orders/new`),
      },
      {
        id: "action-new-customer",
        label: "Add New Customer",
        description: "Add a customer manually",
        icon: Plus,
        keywords: ["add", "create", "new", "customer", "user"],
        group: "actions",
        onSelect: () => router.push(`${basePath}/customers/new`),
      },
      {
        id: "action-search-orders",
        label: "Search Orders",
        description: "Find orders by ID or customer",
        icon: Search,
        keywords: ["find", "lookup", "order"],
        group: "actions",
        onSelect: () => router.push(`${basePath}/orders?search=`),
      },
      {
        id: "action-export-products",
        label: "Export Products",
        description: "Download product catalog as CSV",
        icon: FileOutput,
        keywords: ["download", "csv", "export", "products"],
        group: "actions",
        onSelect: () => {
          // This would trigger an export action
          console.log("Export products triggered");
        },
      },
      {
        id: "action-refresh",
        label: "Refresh Data",
        description: "Reload current page data",
        icon: RefreshCw,
        shortcut: ["mod", "r"],
        keywords: ["reload", "update", "sync"],
        group: "actions",
        onSelect: () => router.refresh(),
      },

      // Settings commands
      {
        id: "settings-notifications",
        label: "Notification Settings",
        description: "Configure email and push notifications",
        icon: Bell,
        keywords: ["alerts", "email", "push"],
        group: "settings",
        onSelect: () => router.push(`${basePath}/settings/notifications`),
      },
      {
        id: "settings-store",
        label: "Store Settings",
        description: "Configure store details",
        icon: Store,
        keywords: ["shop", "business", "details"],
        group: "settings",
        onSelect: () => router.push(`${basePath}/settings/store`),
      },
    ];

    // Add sign out command if callback provided
    if (onSignOut) {
      defaultCommands.push({
        id: "action-signout",
        label: "Sign Out",
        description: "Log out of your account",
        icon: LogOut,
        keywords: ["logout", "exit", "leave"],
        group: "settings",
        onSelect: onSignOut,
      });
    }

    registerCommands(defaultCommands);

    // Cleanup on unmount
    return () => {
      defaultCommands.forEach((cmd) => unregisterCommand(cmd.id));
    };
  }, [includeDefaultCommands, basePath, router, onSignOut, registerCommands, unregisterCommand]);

  // Global keyboard shortcut to open command palette
  useHotkeys(
    "mod+k",
    (e) => {
      e.preventDefault();
      toggle();
    },
    {
      enableOnFormTags: ["INPUT", "TEXTAREA", "SELECT"],
    }
  );

  // Also support "/" to open when not in an input
  useHotkeys(
    "/",
    (e) => {
      const target = e.target as HTMLElement;
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      const isContentEditable = target.isContentEditable;
      
      if (!isInput && !isContentEditable) {
        e.preventDefault();
        setOpen(true);
      }
    }
  );

  const contextValue = React.useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      registerCommand,
      unregisterCommand,
      registerCommands,
      clearCommands,
    }),
    [open, toggle, registerCommand, unregisterCommand, registerCommands, clearCommands]
  );

  return (
    <CommandPaletteContext.Provider value={contextValue}>
      {children}
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        commands={Array.from(commands.values())}
        groups={groups}
      />
    </CommandPaletteContext.Provider>
  );
}

// Hook to use command palette
export function useCommandPalette() {
  const context = React.useContext(CommandPaletteContext);
  if (!context) {
    throw new Error("useCommandPalette must be used within a CommandPaletteProvider");
  }
  return context;
}

// Hook to register commands from a component
export function useRegisterCommands(commands: CommandPaletteCommand[], deps: React.DependencyList = []) {
  const { registerCommands, unregisterCommand } = useCommandPalette();

  React.useEffect(() => {
    registerCommands(commands);

    return () => {
      commands.forEach((cmd) => unregisterCommand(cmd.id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
