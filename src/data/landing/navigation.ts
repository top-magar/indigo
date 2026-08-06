export type MegaMenuIcon =
  | "activity"
  | "bar-chart"
  | "book"
  | "building"
  | "credit-card"
  | "download"
  | "layers"
  | "layout"
  | "life-buoy"
  | "list"
  | "package"
  | "scroll"
  | "shopping-bag"
  | "sparkles"
  | "star"
  | "store"
  | "terminal"
  | "users"
  | "wallet";

export type MegaMenuLink = {
  label: string;
  href: string;
  description?: string;
  icon?: MegaMenuIcon;
};

export type MegaMenuColumn = {
  title: string;
  links: MegaMenuLink[];
};

export type MegaMenuItem = {
  key: string;
  label: string;
  columns: MegaMenuColumn[];
  featured?: MegaMenuLink;
};

export type MobileMenuLink = {
  label: string;
  href: string;
};

export type MobileMenuGroup = {
  key: string;
  label: string;
  links: MobileMenuLink[];
};

export const starCount = "4,309";

export const navigationItems: MegaMenuItem[] = [
  {
    key: "product",
    label: "Product",
    columns: [
      {
        title: "Core Features",
        links: [
          { label: "Visual Storefront Editor", href: "#features", description: "Drag-and-drop pages and brand tokens", icon: "layout" },
          { label: "Live Commerce Analytics", href: "#features", description: "Real-time event tracking and funnels", icon: "bar-chart" },
          { label: "Checkout + Payments", href: "#features", description: "eSewa, Khalti, IME Pay, COD and more", icon: "credit-card" },
        ],
      },
      {
        title: "Advanced",
        links: [
          { label: "Multi-Store Management", href: "#features", description: "Run several brands from one workspace", icon: "building" },
          { label: "Inventory + Orders", href: "#features", description: "Product catalog and fulfillment", icon: "package" },
          { label: "Predictive Insights", href: "#features", description: "Forecast demand and churn risk", icon: "sparkles" },
        ],
      },
    ],
    featured: {
      label: "What’s new in Indigo",
      href: "#blog",
      description: "Reusable sections, improved publish previews, and local checkout improvements.",
      icon: "star",
    },
  },
  {
    key: "solutions",
    label: "Solutions",
    columns: [
      {
        title: "By Team",
        links: [
          { label: "Product Teams", href: "#solutions", description: "Launch pages without developer queues", icon: "layers" },
          { label: "Merchants", href: "#solutions", description: "Sell, ship, and manage in one workspace", icon: "store" },
          { label: "Engineering", href: "#solutions", description: "Extend flows and sync data cleanly", icon: "terminal" },
        ],
      },
      {
        title: "By Industry",
        links: [
          { label: "Ecommerce", href: "#solutions", description: "Online stores, D2C brands, catalogs", icon: "shopping-bag" },
          { label: "Fintech", href: "#solutions", description: "Subscription products and checkout flows", icon: "wallet" },
          { label: "Marketplaces", href: "#solutions", description: "Multi-seller and multi-brand setups", icon: "store" },
        ],
      },
    ],
    featured: {
      label: "Read merchant stories",
      href: "#testimonials",
      description: "See how Nepali brands launched faster with Indigo.",
      icon: "star",
    },
  },
  {
    key: "resources",
    label: "Resources",
    columns: [
      {
        title: "Learn",
        links: [
          { label: "Documentation", href: "/coming-soon", description: "Setup, guides, and storefront reference", icon: "book" },
          { label: "Blog", href: "/blog", description: "Practical advice for commerce teams", icon: "scroll" },
          { label: "Changelog", href: "/coming-soon", description: "Latest releases and ship notes", icon: "list" },
        ],
      },
      {
        title: "Connect",
        links: [
          { label: "Help Center", href: "/coming-soon", description: "Answers and troubleshooting", icon: "life-buoy" },
          { label: "Community", href: "/coming-soon", description: "Join other founders and builders", icon: "users" },
          { label: "Status", href: "/coming-soon", description: "Platform availability and incidents", icon: "activity" },
        ],
      },
    ],
    featured: {
      label: "Download the commerce playbook",
      href: "/coming-soon",
      description: "Launch, optimize, and scale your storefront faster.",
      icon: "download",
    },
  },
];

export const mobileMenu: MobileMenuGroup[] = [
  {
    key: "product",
    label: "Product",
    links: [
      { label: "Visual Storefront Editor", href: "#features" },
      { label: "Live Commerce Analytics", href: "#features" },
      { label: "Checkout + Payments", href: "#features" },
      { label: "Inventory + Orders", href: "#features" },
    ],
  },
  {
    key: "solutions",
    label: "Solutions",
    links: [
      { label: "Product Teams", href: "#solutions" },
      { label: "Merchants", href: "#solutions" },
      { label: "Ecommerce", href: "#solutions" },
      { label: "Marketplaces", href: "#solutions" },
    ],
  },
  {
    key: "resources",
    label: "Resources",
    links: [
      { label: "Documentation", href: "/coming-soon" },
      { label: "Blog", href: "/blog" },
      { label: "Changelog", href: "/coming-soon" },
      { label: "Help Center", href: "/coming-soon" },
    ],
  },
];
