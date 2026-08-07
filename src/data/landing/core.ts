export interface HealthMetric {
  label: string;
  value: string;
  state: "Healthy" | "Watch";
}

export const healthMetrics: HealthMetric[] = [
  { label: "Active shoppers", value: "8,492", state: "Healthy" },
  { label: "New checkouts", value: "1,247", state: "Healthy" },
  { label: "Returning buyers", value: "38.4%", state: "Healthy" },
  { label: "Cart abandonment", value: "12.3%", state: "Watch" },
  { label: "Engagement", value: "82.1%", state: "Healthy" },
  { label: "Revenue", value: "NPR 4.8M", state: "Healthy" },
];

export interface PricingPlan {
  id: string;
  title: string;
  subtitle: string;
  priceMonthly: string;
  priceAnnual: string;
  note: string;
  popular?: boolean;
  cta: { label: string; href: string };
  features: string[];
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    title: "Starter",
    subtitle: "For testing the waters with your first products.",
    priceMonthly: "NPR 0",
    priceAnnual: "NPR 0",
    note: "Free forever — no credit card required.",
    cta: { label: "Get Started", href: "/signup" },
    features: [
      "Up to 100 products",
      "Visual page editor",
      "eSewa, Khalti & IME Pay checkout",
      "Indigo store address",
      "Order workspace",
    ],
  },
  {
    id: "growth",
    title: "Growth",
    subtitle: "For stores that are ready to sell in volume.",
    priceMonthly: "NPR 2,499",
    priceAnnual: "NPR 1,999",
    note: "Billed annually — 2 months free.",
    popular: true,
    cta: { label: "Start 14-day Trial", href: "/signup?plan=growth" },
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
    title: "Enterprise",
    subtitle: "For multi-brand operations and custom needs.",
    priceMonthly: "Custom",
    priceAnnual: "Custom",
    note: "Tailored for your operation.",
    cta: { label: "Talk to Sales", href: "/contact" },
    features: [
      "Everything in Growth",
      "Multi-store management",
      "Dedicated success manager",
      "SSO & audit logs",
      "Custom integrations",
      "99.99% uptime SLA",
    ],
  },
];

export interface NewsletterResult {
  type: "success" | "error";
  message: string;
}
