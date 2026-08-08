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

export const starCount = "1,204";

export const navigationItems: MegaMenuItem[] = [
  {
    key: "product",
    label: "Product",
    columns: [
      {
        title: "Build & Operate",
        links: [
          { label: "Visual Storefront", href: "#features", description: "Design without code", icon: "layout" },
          { label: "Order Management", href: "#features", description: "Process and fulfill", icon: "package" },
          { label: "Inventory sync", href: "#features", description: "Track stock in real-time", icon: "layers" },
        ],
      },
      {
        title: "Payments & Growth",
        links: [
          { label: "Local Payments", href: "#integrations", description: "eSewa, Khalti, IME Pay", icon: "credit-card" },
          { label: "Commerce Analytics", href: "#features", description: "Understand your sales", icon: "bar-chart" },
          { label: "Customer Profiles", href: "#features", description: "Track LTV and behavior", icon: "users" },
        ],
      },
    ],
    featured: {
      label: "What's New: Native eSewa",
      href: "#integrations",
      description: "Direct eSewa integration is now live for all merchants.",
      icon: "sparkles",
    },
  },
  {
    key: "solutions",
    label: "Solutions",
    columns: [
      {
        title: "By Business Size",
        links: [
          { label: "Emerging Sellers", href: "#solutions", description: "Launch your first store", icon: "store" },
          { label: "Growing DTC Brands", href: "#solutions", description: "Scale your operations", icon: "building" },
          { label: "Retail Teams", href: "#solutions", description: "Centralize your channels", icon: "users" },
        ],
      },
      {
        title: "Use Cases",
        links: [
          { label: "Social Commerce", href: "#solutions", description: "Turn followers into buyers", icon: "star" },
          { label: "Omnichannel", href: "#solutions", description: "Sync physical and digital", icon: "layout" },
          { label: "B2B Wholesale", href: "#solutions", description: "Custom pricing tiers", icon: "package" },
        ],
      },
    ],
    featured: {
      label: "Merchant Stories",
      href: "#testimonials",
      description: "See how Nepali brands grow with Indigo.",
      icon: "book",
    },
  },
  {
    key: "resources",
    label: "Resources",
    columns: [
      {
        title: "Learn",
        links: [
          { label: "Documentation", href: "/coming-soon", description: "Guides and tutorials", icon: "book" },
          { label: "Commerce Blog", href: "/blog", description: "Strategies for growth", icon: "scroll" },
          { label: "Changelog", href: "/coming-soon", description: "Platform updates", icon: "list" },
        ],
      },
      {
        title: "Connect",
        links: [
          { label: "Community", href: "/coming-soon", description: "Join other merchants", icon: "users" },
          { label: "Partner Directory", href: "/coming-soon", description: "Find certified experts", icon: "star" },
          { label: "Help Center", href: "/coming-soon", description: "Get support", icon: "life-buoy" },
        ],
      },
    ],
    featured: {
      label: "Nepal E-commerce Report",
      href: "/coming-soon",
      description: "Read our 2026 state of commerce analysis.",
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
      { label: "Local Payments", href: "#integrations" },
      { label: "Inventory & Orders", href: "#features" },
      { label: "Commerce Analytics", href: "#features" },
    ],
  },
  {
    key: "solutions",
    label: "Solutions",
    links: [
      { label: "Emerging Sellers", href: "#solutions" },
      { label: "Growing Brands", href: "#solutions" },
      { label: "Retail Teams", href: "#solutions" },
    ],
  },
  {
    key: "resources",
    label: "Resources",
    links: [
      { label: "Documentation", href: "/coming-soon" },
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/coming-soon" },
    ],
  },
];
