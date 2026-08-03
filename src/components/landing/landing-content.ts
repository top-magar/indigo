export type LandingLink = {
  label: string;
  href: string;
};

export type LandingContent = {
  navigation: {
    links: LandingLink[];
    login: LandingLink;
    primaryCta: LandingLink;
  };
  hero: {
    title: string;
    body: string;
    primaryCta: LandingLink;
    secondaryCta: LandingLink;
    variants: Array<{
      id: "editorial" | "catalog" | "studio";
      label: string;
      description: string;
    }>;
  };
  commerceProof: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  capabilities: Array<{
    title: string;
    description: string;
  }>;
  workflow: Array<{
    title: string;
    detail: string;
  }>;
  offer: {
    title: string;
    body: string;
    included: string[];
    upgrade: string[];
    cta: LandingLink;
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
};

export const landingContent = {
  navigation: {
    links: [
      { label: "Storefront", href: "#storefront" },
      { label: "Operations", href: "#operations" },
      { label: "Architecture", href: "#architecture" },
      { label: "Pricing", href: "#pricing" },
    ],
    login: { label: "Log in", href: "/login" },
    primaryCta: { label: "Start free", href: "/signup" },
  },
  hero: {
    title: "Build a store no template can contain.",
    body: "Indigo gives Nepal's merchants a visual storefront editor, connected catalog, orders, and local checkout in one system.",
    primaryCta: { label: "Start free", href: "/signup" },
    secondaryCta: { label: "See how it works", href: "#storefront" },
    variants: [
      {
        id: "editorial",
        label: "Editorial",
        description: "Narrative layouts with generous image-led rhythm.",
      },
      {
        id: "catalog",
        label: "Catalog",
        description: "Dense product discovery built for fast comparison.",
      },
      {
        id: "studio",
        label: "Studio",
        description: "Expressive campaigns with controlled asymmetry.",
      },
    ],
  },
  commerceProof: [
    {
      label: "Checkout",
      value: "eSewa + Khalti",
      detail: "Local gateway flows alongside cash on delivery and bank transfer.",
    },
    {
      label: "Currency",
      value: "NPR first",
      detail: "Catalogs, orders, and reporting designed for rupee commerce.",
    },
    {
      label: "Storefront",
      value: "Your domain",
      detail: "Publish to an Indigo address, then connect a custom domain.",
    },
    {
      label: "Control",
      value: "One workspace",
      detail: "Products, customers, inventory, pages, and orders stay connected.",
    },
  ],
  capabilities: [
    {
      title: "Responsive by construction",
      description: "Compose once, then inspect and tune desktop, tablet, and mobile layouts inside the same editor.",
    },
    {
      title: "A real design system",
      description: "Typography, color, spacing, and reusable blocks keep every page recognizably yours.",
    },
    {
      title: "Commerce-aware blocks",
      description: "Product grids, navigation, media, forms, and calls to action share live catalog data.",
    },
    {
      title: "Pages with structure",
      description: "Edit the content tree directly, move sections visually, and keep history as the storefront evolves.",
    },
  ],
  workflow: [
    { title: "Catalog", detail: "Products, variants, inventory" },
    { title: "Compose", detail: "Pages, sections, brand tokens" },
    { title: "Preview", detail: "Desktop, tablet, mobile" },
    { title: "Publish", detail: "Store route and custom domain" },
  ],
  offer: {
    title: "Start with the whole storefront, not a sales call.",
    body: "Create an account and build before committing to a paid plan. Upgrade when your operation needs more control.",
    included: ["Product catalog", "Visual page editor", "Order workspace", "Indigo store address"],
    upgrade: ["Custom domains", "Expanded team access", "Advanced operations", "Priority support"],
    cta: { label: "Create your store", href: "/signup" },
  },
  faq: [
    {
      question: "Can I design the storefront without code?",
      answer: "Yes. Indigo's visual editor lets you assemble pages, move sections, adjust styles, and preview responsive layouts. The underlying storefront remains structured rather than becoming a static image.",
    },
    {
      question: "Which payment methods are available?",
      answer: "Indigo includes checkout paths for eSewa, Khalti, cash on delivery, and bank transfer. Each merchant connects and manages their own payment credentials.",
    },
    {
      question: "Can I use a custom domain?",
      answer: "Yes. Every store can begin on an Indigo address, and eligible plans can connect a verified custom domain from the dashboard.",
    },
    {
      question: "What happens after I create an account?",
      answer: "Onboarding creates your merchant workspace. From there you can add products, configure payments, compose storefront pages, preview the result, and publish when it is ready.",
    },
    {
      question: "Does Indigo support mobile storefronts?",
      answer: "The storefront renderer is responsive, and the editor includes desktop, tablet, and mobile preview modes so layouts can be checked before publishing.",
    },
  ],
} satisfies LandingContent;

export type LandingAnalyticsEvent =
  | "landing_view"
  | "hero_demo_started"
  | "storefront_variant_changed"
  | "start_free_clicked"
  | "signup_started";
