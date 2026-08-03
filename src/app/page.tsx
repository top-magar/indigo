import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./landing.css";
import { ProductionLanding } from "@/components/landing";

const indigoSans = Geist({
  subsets: ["latin"],
  variable: "--font-indigo-sans",
});

const indigoMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-indigo-mono",
});

export const metadata: Metadata = {
  title: "Indigo - Storefront freedom for commerce in Nepal",
  description:
    "Design and publish a distinctive storefront with a connected catalog, orders, inventory, eSewa, and Khalti checkout.",
  openGraph: {
    title: "Indigo - Storefront freedom for commerce in Nepal",
    description:
      "A visual storefront editor and connected commerce workspace built for Nepal.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indigo - Storefront freedom for commerce in Nepal",
    description:
      "A visual storefront editor and connected commerce workspace built for Nepal.",
  },
};

export default function LandingPage() {
  return (
    <div className={`${indigoSans.variable} ${indigoMono.variable}`}>
      <ProductionLanding />
    </div>
  );
}
