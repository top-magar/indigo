import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./landing-v2.css";
import { LandingV2Page as LandingV2 } from "@/components/landing-v2/landing-v2-page";
import { sectionData } from "@/data/landing/section-data";
import KineticGrid from "@/components/ui/kinetic-grid";

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: sectionData.faq.items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export const metadata: Metadata = {
  title: "Indigo | Smarter Commerce Starts with Live Data",
  description:
    "Indigo is the commerce platform for Nepal with a visual storefront editor, local payment integrations, and real-time business analytics.",
  openGraph: {
    title: "Indigo | Smarter Commerce Starts with Live Data",
    description:
      "Indigo is the commerce platform for Nepal with a visual storefront editor, local payment integrations, and real-time business analytics.",
    siteName: "Indigo",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indigo | Smarter Commerce Starts with Live Data",
    description:
      "Indigo is the commerce platform for Nepal with a visual storefront editor, local payment integrations, and real-time business analytics.",
  },
};

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-indigo-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-indigo-mono",
});

export default function LandingV2Page() {
  return (
    <div className={`lv2-page ${geistSans.variable} ${geistMono.variable}`}>
      {/* Pre-paint theme boot: sets <html data-theme> before the landing renders,
          so the light/dark token set is correct on first paint (no FOUC). */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var s=localStorage.getItem("lv2-theme");var t=s||(window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark");var d=document.documentElement;d.dataset.theme=t;d.style.colorScheme=t;}catch(e){document.documentElement.dataset.theme="dark";}})();`,
        }}
      />
      <KineticGrid>
        <LandingV2 />
      </KineticGrid>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Indigo",
            url: "https://indigo.example.com",
            description:
              "E-commerce and storefront platform for Nepal with visual editing and real-time analytics.",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}
