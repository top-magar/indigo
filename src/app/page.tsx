import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./landing-v2.css";
import { LandingV2Page as LandingV2 } from "@/components/landing-v2/landing-v2-page";

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
      <LandingV2 />
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How long does it take to launch a store?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "With quick-start templates you can launch a basic store in under an hour. Custom designs and large catalogs may take a few days to set up properly.",
                },
              },
              {
                "@type": "Question",
                name: "Which payment methods are supported?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "eSewa, Khalti, IME Pay, cash on delivery, and bank transfer are built in. Each merchant connects and manages their own payment credentials.",
                },
              },
              {
                "@type": "Question",
                name: "Do I need to know how to code?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "No. The visual editor covers pages, sections, and styles while the underlying storefront stays structured rather than becoming a static image.",
                },
              },
              {
                "@type": "Question",
                name: "Can I use my own domain?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes — the Growth plan and above let you connect a verified custom domain, and every store gets a free Indigo address to start with.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  );
}
