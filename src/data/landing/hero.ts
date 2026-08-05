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
  badge: { label: "Run your store 10× smarter", href: "#metrics" },
  headline: ["Smarter Commerce", "Starts with Live Data"],
  body: "Track every storefront visit, checkout, and campaign from one place. Indigo gives Nepali merchants live analytics, structured pages, and payments that actually connect.",
  primary: { label: "Request Demo", href: "/signup" },
  secondary: { label: "Join Waitlist", href: "#pricing" },
  note: "No credit card required. Free plan available.",
};

export const heroLogos: LogoDatum[] = [
  { name: "Nepali Payments", initials: "NP" },
  { name: "Retail OS", initials: "RO" },
  { name: "Product Analytics", initials: "PA" },
  { name: "Cloud Stores", initials: "CS" },
  { name: "Digital Brands", initials: "DB" },
  { name: "Shipping Hub", initials: "SH" },
];
