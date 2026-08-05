/**
 * Typed content data for landing-v2 sections.
 *
 * Sections covered: metrics, integrations, differentiators, comparison,
 * pricing, testimonials, blog, FAQ. Components consume these types/values so
 * content stays out of JSX and remains swappable per locale/marketing variant.
 */

/* ─── Shared building blocks ──────────────────────────────────────────── */

export type LandingLink = {
  label: string;
  href: string;
};

export type SectionMeta = {
  /** One-based section number, e.g. `01 of 07`. */
  index: number;
  /** Total section count. */
  total: number;
  /** Rendered after the bracket block: `[ 01 of 07 ] · Label`. */
  label: string;
  /** Small overline above the headline. */
  eyebrow?: string;
  /** Main headline. */
  headline: string;
  /** Supporting body copy. */
  body?: string;
};

/* ─── Metrics ─────────────────────────────────────────────────────────── */

export type Metric = {
  id: string;
  label: string;
  value: string;
  detail?: string;
};

export type MetricsSection = SectionMeta & {
  metrics: Metric[];
};

/* ─── Integrations ────────────────────────────────────────────────────── */

export type Integration = {
  id: string;
  name: string;
  category: "Payments" | "Banking" | "Shipping" | "Analytics" | "Marketing" | "Communication" | "Development" | "Design" | "Database";
};

export type IntegrationsSection = SectionMeta & {
  /** Rows of the marquee; each row scrolls independently. */
  rows: Integration[][];
};

/* ─── Differentiators ─────────────────────────────────────────────────── */

export type Differentiator = {
  id: string;
  title: string;
  description: string;
  /** Optional supporting list of bullet points. */
  points?: string[];
};

export type DifferentiatorsSection = SectionMeta & {
  differentiators: Differentiator[];
};

/* ─── Comparison ──────────────────────────────────────────────────────── */

export type ComparisonRow = {
  feature: string;
  /** Whether Indigo supports the feature. */
  indigo: boolean | string;
  /** Typical templated-platform behavior. */
  alternative: boolean | string;
  note?: string;
};

export type ComparisonSection = SectionMeta & {
  /** Label for the Indigo column, e.g. "Indigo". */
  indigoLabel: string;
  /** Label for the comparison column, e.g. "Templated platforms". */
  alternativeLabel: string;
  rows: ComparisonRow[];
};

/* ─── Pricing ─────────────────────────────────────────────────────────── */

export type PricingPlan = {
  id: string;
  name: string;
  tagline: string;
  /** Monthly price in NPR; `null` for "custom". */
  monthlyPriceNpr: number | null;
  /** Billing period label, e.g. "per month". */
  periodLabel: string;
  highlighted?: boolean;
  cta: LandingLink;
  features: string[];
  /** Features intentionally not included, e.g. "2% transaction fee". */
  caveats?: string[];
};

export type PricingSection = SectionMeta & {
  /** Copy shown when the annual toggle is active. */
  annualNote?: string;
  /** Copy shown when the monthly toggle is active. */
  monthlyNote?: string;
  plans: PricingPlan[];
};

/* ─── Testimonials ────────────────────────────────────────────────────── */

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
  /** Short outcome metric, e.g. "2x revenue growth". */
  metric?: string;
  /** Avatar initials rendered when no image is available. */
  initials: string;
};

export type TestimonialsSection = SectionMeta & {
  testimonials: Testimonial[];
};

/* ─── Blog ────────────────────────────────────────────────────────────── */

export type BlogPost = {
  id: string;
  title: string;
  description: string;
  category: string;
  /** ISO date string, e.g. "2026-07-18". */
  publishedAt: string;
  readMinutes: number;
  href: string;
  /** Featured posts lead the grid. */
  featured?: boolean;
};

export type BlogSection = SectionMeta & {
  posts: BlogPost[];
  viewAll: LandingLink;
};

/* ─── FAQ ─────────────────────────────────────────────────────────────── */

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type FaqSection = SectionMeta & {
  items: FaqItem[];
  /** CTA shown below the accordion, if any. */
  cta?: LandingLink;
};

/* ─── Section data ────────────────────────────────────────────────────── */

const TOTAL_SECTIONS = 10;

export const sectionData = {
  metrics: {
    index: 1,
    total: TOTAL_SECTIONS,
    label: "Metrics",
    eyebrow: "Measurable outcomes",
    headline: "Data that drives real decisions.",
    body: "Sample targets for the metrics merchants watch most — editable until production benchmarks are available.",
    metrics: [
      { id: "events", label: "Events tracked daily", value: "10M+", detail: "Storefront visits, clicks, and checkouts in one stream" },
      { id: "reporting", label: "Faster reporting", value: "85%", detail: "From raw data to a publish-ready report" },
      { id: "conversion", label: "Higher conversion", value: "3×", detail: "Sample uplift for stores acting on funnel insights" },
      { id: "uptime", label: "Uptime guaranteed", value: "99.9%", detail: "Sample target for mission-critical storefronts" },
    ],
  } satisfies MetricsSection,

  integrations: {
    index: 3,
    total: TOTAL_SECTIONS,
    label: "Integrations",
    eyebrow: "Ecosystem",
    headline: "Works with everything you already use.",
    body: "Local gateways and global tools connect in minutes — no code, no middleware, no waiting on a developer.",
    rows: [
      [
        { id: "esewa", name: "eSewa", category: "Payments" },
        { id: "khalti", name: "Khalti", category: "Payments" },
        { id: "ime-pay", name: "IME Pay", category: "Payments" },
        { id: "stripe", name: "Stripe", category: "Payments" },
        { id: "nabil", name: "Nabil Bank", category: "Banking" },
        { id: "pathao", name: "Pathao", category: "Shipping" },
      ],
      [
        { id: "google-analytics", name: "Google Analytics", category: "Analytics" },
        { id: "mailchimp", name: "Mailchimp", category: "Marketing" },
        { id: "slack", name: "Slack", category: "Communication" },
        { id: "github", name: "GitHub", category: "Development" },
        { id: "figma", name: "Figma", category: "Design" },
        { id: "supabase", name: "Supabase", category: "Database" },
      ],
    ],
  } satisfies IntegrationsSection,

  differentiators: {
    index: 5,
    total: TOTAL_SECTIONS,
    label: "Differentiators",
    eyebrow: "Why Indigo",
    headline: "A storefront no template can contain.",
    body: "Indigo pairs a visual page editor with a connected catalog, orders, and local checkout — so the storefront stays structured instead of becoming a static image.",
    differentiators: [
      {
        id: "visual-editor",
        title: "Visual storefront editor",
        description: "Assemble pages, move sections, and tune responsive layouts without writing code — then inspect desktop, tablet, and mobile previews.",
        points: ["Drag-and-drop sections", "Desktop / tablet / mobile preview", "Live brand tokens"],
      },
      {
        id: "local-first-payments",
        title: "NPR-first commerce",
        description: "eSewa, Khalti, IME Pay, cash on delivery, and bank transfer flows designed around rupee commerce from day one.",
        points: ["Local gateway flows", "NPR reporting", "COD + bank transfer"],
      },
      {
        id: "connected-operations",
        title: "One connected workspace",
        description: "Products, customers, inventory, pages, and orders live in a single system — no glue code between storefront and back office.",
        points: ["Shared catalog data", "Order workspace", "Inventory tracking"],
      },
    ],
  } satisfies DifferentiatorsSection,

  comparison: {
    index: 6,
    total: TOTAL_SECTIONS,
    label: "Comparison",
    eyebrow: "The difference",
    headline: "Indigo vs. templated platforms.",
    body: "Most store builders ship static templates and bolt commerce on afterward. Indigo starts from a structured commerce core.",
    indigoLabel: "Indigo",
    alternativeLabel: "Templated platforms",
    rows: [
      { feature: "Visual page editor", indigo: true, alternative: true },
      { feature: "Local gateways (eSewa, Khalti, IME Pay)", indigo: true, alternative: false },
      { feature: "NPR-first checkout & reporting", indigo: true, alternative: false },
      { feature: "Connected catalog across all pages", indigo: true, alternative: false, note: "Templates often hard-code products" },
      { feature: "Responsive preview in-editor", indigo: true, alternative: true },
      { feature: "Custom domain on every plan", indigo: true, alternative: false, note: "Usually paywalled" },
      { feature: "No per-transaction fees", indigo: "Growth+", alternative: false },
      { feature: "Multi-store management", indigo: true, alternative: false },
    ],
  } satisfies ComparisonSection,

  pricing: {
    index: 7,
    total: TOTAL_SECTIONS,
    label: "Pricing",
    eyebrow: "Plans",
    headline: "Start free. Scale when the store does.",
    body: "Create an account and build before committing to a paid plan. Upgrade when your operation needs more control.",
    annualNote: "Annual billing — two months free.",
    monthlyNote: "Monthly billing — switch to annual anytime.",
    plans: [
      {
        id: "starter",
        name: "Starter",
        tagline: "For testing the waters with your first products.",
        monthlyPriceNpr: 0,
        periodLabel: "free forever",
        cta: { label: "Start free", href: "/signup" },
        features: [
          "Up to 100 products",
          "Visual page editor",
          "eSewa, Khalti & IME Pay checkout",
          "Indigo store address",
          "Order workspace",
        ],
        caveats: ["2% transaction fee"],
      },
      {
        id: "growth",
        name: "Growth",
        tagline: "For stores that are ready to sell in volume.",
        monthlyPriceNpr: 1999,
        periodLabel: "per month",
        highlighted: true,
        cta: { label: "Start 14-day trial", href: "/signup?plan=growth" },
        features: [
          "Unlimited products",
          "Custom domain",
          "No transaction fees",
          "Inventory tracking",
          "Advanced operations",
          "Expanded team access",
          "Priority support",
        ],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        tagline: "For multi-brand operations and custom needs.",
        monthlyPriceNpr: null,
        periodLabel: "custom",
        cta: { label: "Talk to sales", href: "/contact" },
        features: [
          "Everything in Growth",
          "Multi-store management",
          "Dedicated success manager",
          "SSO & audit logs",
          "Custom integrations",
          "99.99% uptime SLA",
        ],
      },
    ],
  } satisfies PricingSection,

  testimonials: {
    index: 8,
    total: TOTAL_SECTIONS,
    label: "Testimonials",
    eyebrow: "Merchant stories",
    headline: "Stores that switched, and never looked back.",
    body: "From craft brands in Kathmandu to multi-brand retail groups — here is what running on Indigo looks like.",
    testimonials: [
      {
        id: "himalayan-crafts",
        quote: "Indigo transformed our online presence. Sales doubled within three months.",
        author: "Priya Sharma",
        role: "Founder",
        company: "Himalayan Crafts",
        metric: "2x revenue growth",
        initials: "PS",
      },
      {
        id: "nepstyle",
        quote: "The page builder is incredible. Our store looks like it was designed by a premium agency.",
        author: "Rajesh Thapa",
        role: "CEO",
        company: "NepStyle",
        metric: "40% higher conversion",
        initials: "RT",
      },
      {
        id: "kathmandu-organics",
        quote: "Finally, a platform that understands Nepali payments. eSewa and Khalti just work.",
        author: "Sita Gurung",
        role: "Owner",
        company: "Kathmandu Organics",
        metric: "98% payment success",
        initials: "SG",
      },
      {
        id: "metro-retail",
        quote: "Multi-store management saved us hundreds of hours. One dashboard, five brands.",
        author: "Amir Khan",
        role: "COO",
        company: "Metro Retail Group",
        metric: "5 stores, 1 team",
        initials: "AK",
      },
    ],
  } satisfies TestimonialsSection,

  blog: {
    index: 9,
    total: TOTAL_SECTIONS,
    label: "Insights",
    eyebrow: "From the blog",
    headline: "Guides for building a store that sells.",
    body: "Practical playbooks on storefront design, local payments, and e-commerce operations in Nepal.",
    viewAll: { label: "View all articles", href: "/blog" },
    posts: [
      {
        id: "nepal-ecommerce-2026",
        title: "The state of e-commerce in Nepal in 2026",
        description: "How digital wallets, mobile-first shopping, and last-mile logistics are reshaping Nepali retail.",
        category: "Market",
        publishedAt: "2026-07-28",
        readMinutes: 8,
        href: "/blog/nepal-ecommerce-2026",
        featured: true,
      },
      {
        id: "storefront-without-code",
        title: "How to design a storefront without writing code",
        description: "A step-by-step walkthrough of composing pages, sections, and brand tokens in the visual editor.",
        category: "Guides",
        publishedAt: "2026-07-14",
        readMinutes: 6,
        href: "/blog/storefront-without-code",
      },
      {
        id: "choosing-payment-gateway",
        title: "Choosing the right payment gateway for your store",
        description: "eSewa vs. Khalti vs. IME Pay vs. cards — fees, settlement times, and customer habits compared.",
        category: "Payments",
        publishedAt: "2026-06-30",
        readMinutes: 5,
        href: "/blog/choosing-payment-gateway",
      },
      {
        id: "catalog-hygiene",
        title: "Catalog hygiene: the quiet driver of conversion",
        description: "Variant strategy, inventory accuracy, and product photography that turns browsers into buyers.",
        category: "Operations",
        publishedAt: "2026-06-12",
        readMinutes: 7,
        href: "/blog/catalog-hygiene",
      },
    ],
  } satisfies BlogSection,

  faq: {
    index: 10,
    total: TOTAL_SECTIONS,
    label: "FAQ",
    eyebrow: "Questions",
    headline: "Answers, before you ask.",
    body: "Everything merchants usually want to know before starting with Indigo.",
    cta: { label: "Still curious? Talk to us", href: "/contact" },
    items: [
      {
        id: "launch-time",
        question: "How long does it take to launch a store?",
        answer: "With quick-start templates you can launch a basic store in under an hour. Custom designs and large catalogs may take a few days to set up properly.",
      },
      {
        id: "custom-domain",
        question: "Can I use my own domain?",
        answer: "Yes — the Growth plan and above let you connect a verified custom domain, and every store gets a free Indigo address to start with.",
      },
      {
        id: "payments",
        question: "Which payment methods are supported?",
        answer: "eSewa, Khalti, IME Pay, cash on delivery, and bank transfer are built in. Each merchant connects and manages their own payment credentials.",
      },
      {
        id: "transaction-fee",
        question: "Is there a transaction fee?",
        answer: "No transaction fees on Growth and Enterprise plans. The free Starter plan has a small 2% fee per transaction; standard payment gateway fees still apply.",
      },
      {
        id: "migration",
        question: "Can I migrate from another platform?",
        answer: "Yes — we offer a one-click migration path for Shopify and WooCommerce that imports products, customers, and order history.",
      },
      {
        id: "no-code",
        question: "Do I need to know how to code?",
        answer: "No. The visual editor covers pages, sections, and styles. The underlying storefront stays structured rather than becoming a static image.",
      },
    ],
  } satisfies FaqSection,
} as const;

export type LandingSectionData = typeof sectionData;
