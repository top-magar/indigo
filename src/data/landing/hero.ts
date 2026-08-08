export type LandingLink = {
  label: string;
  href: string;
};

export type HeroBadge = {
  label: string;
  href: string;
};

export type HeroCta = {
  label: string;
  href: string;
};

export type HeroContent = {
  badge: HeroBadge;
  headline: [string, string];
  body: string;
  primary: HeroCta;
  secondary: HeroCta;
  note: string;
};

export type LogoDatum = {
  name: string;
  initials: string;
};

export const heroContent: HeroContent = {
  badge: { label: "Commerce infrastructure for modern Nepali brands", href: "#" },
  headline: ["Build your store.", "Run everything behind it."],
  body: "Create a beautiful storefront, accept local payments, manage orders and inventory, and understand what's selling — all from one connected workspace.",
  primary: { label: "Start free", href: "/signup" },
  secondary: { label: "Watch demo", href: "#demo" },
  note: "No credit card required. Free plan available.",
};

export const heroLogos: LogoDatum[] = [
  { name: "eSewa", initials: "eS" },
  { name: "Khalti", initials: "KH" },
  { name: "IME Pay", initials: "IP" },
  { name: "FonePay", initials: "FP" },
  { name: "Pathao", initials: "PT" },
  { name: "ConnectIPS", initials: "CI" },
];
