import {
    Navbar,
    AnnouncementBar,
    Hero,
    LogoMarquee,
} from "@/components/landing";
import dynamic from "next/dynamic";
import type { Metadata } from "next";

const Features = dynamic(() => import("@/components/landing/features").then(m => ({ default: m.Features })));
const Showcase = dynamic(() => import("@/components/landing/showcase").then(m => ({ default: m.Showcase })));
const Solutions = dynamic(() => import("@/components/landing/solutions").then(m => ({ default: m.Solutions })));
const PullQuote = dynamic(() => import("@/components/landing/pull-quote").then(m => ({ default: m.PullQuote })));
const Infrastructure = dynamic(() => import("@/components/landing/infrastructure").then(m => ({ default: m.Infrastructure })));
const BentoGrid = dynamic(() => import("@/components/landing/bento-grid").then(m => ({ default: m.BentoGrid })));
const HowItWorks = dynamic(() => import("@/components/landing/how-it-works").then(m => ({ default: m.HowItWorks })));
const Testimonials = dynamic(() => import("@/components/landing/testimonials").then(m => ({ default: m.Testimonials })));
const Pricing = dynamic(() => import("@/components/landing/pricing").then(m => ({ default: m.Pricing })));
const FAQ = dynamic(() => import("@/components/landing/faq").then(m => ({ default: m.FAQ })));
const CTA = dynamic(() => import("@/components/landing/cta").then(m => ({ default: m.CTA })));
const Footer = dynamic(() => import("@/components/landing/footer").then(m => ({ default: m.Footer })));
const ScrollToTop = dynamic(() => import("@/components/landing/scroll-to-top").then(m => ({ default: m.ScrollToTop })));

export const metadata: Metadata = {
    title: "Indigo — Launch Your Online Store in Nepal | E-Commerce Platform",
    description:
        "Launch your online store in minutes. Accept eSewa, Khalti payments. Ship via Pathao. Built for 12,000+ Nepali businesses. Start free today.",
    keywords: [
        "ecommerce Nepal",
        "online store Nepal",
        "eSewa payment gateway",
        "Khalti integration",
        "sell online Nepal",
        "Nepali ecommerce platform",
        "Pathao delivery",
        "multi-tenant marketplace",
    ],
    openGraph: {
        title: "Indigo — Launch Your Online Store in Nepal",
        description:
            "The all-in-one e-commerce platform built for Nepal. Accept local payments, ship anywhere, grow your business.",
        type: "website",
    },
    alternates: { canonical: "/" },
};

const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Indigo",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
        "E-commerce platform for Nepal with eSewa, Khalti payments and Pathao delivery integration.",
    offers: {
        "@type": "AggregateOffer",
        priceCurrency: "NPR",
        lowPrice: "0",
        highPrice: "6000",
        offerCount: "3",
    },
    aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.8",
        ratingCount: "12000",
    },
};

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <AnnouncementBar />
            <Navbar />
            <Hero />
            <LogoMarquee />
            <Features />
            <Showcase />
            <Solutions />
            <PullQuote />
            <Infrastructure />
            <BentoGrid />
            <HowItWorks />
            <Testimonials />
            <Pricing />
            <FAQ />
            <CTA />
            <Footer />
            <ScrollToTop />
        </div>
    );
}
