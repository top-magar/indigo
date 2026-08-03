import React from "react";
import "./landing.css";
import {
  AnnouncementBar,
  Navbar,
  Hero,
  SocialProof,
  HowItWorks,
  BentoGrid,
  Infrastructure,
  Metrics,
  IntegrationsMarquee,
  SolutionsRoles,
  ComparisonRiver,
  Developers,
  Security,
  Pricing,
  Testimonials,
  BlogInsights,
  Faq,
  CtaBanner,
  Footer,
  ScrollToTop,
} from "@/components/landing";

/* ═══ Blueprint structural band between sections ═══ */
function BlueprintBand() {
  return <div className="bp-band" aria-hidden="true" />;
}

function BlueprintBandAccent() {
  return <div className="bp-band bp-band--accent" aria-hidden="true" />;
}

export default function LandingPage() {
  return (
    <div className="landing-page relative min-h-screen bg-background text-foreground overflow-x-hidden antialiased">
      {/* 01. Announcement & Navbar Header */}
      <div className="relative z-50">
        <AnnouncementBar />
        <Navbar />
      </div>

      {/* Band: Below announcement bar */}
      <BlueprintBand />

      <main className="relative z-10">
        {/* 02. Hero — Primary blueprint expression */}
        <Hero />

        {/* Band: Hero → SocialProof */}
        <BlueprintBand />

        {/* 03. Social Proof — Full-width horizontal structural band */}
        <SocialProof />

        {/* 04. How It Works — Blueprint step markers */}
        <HowItWorks />

        {/* 05. Features — Bordered feature grid */}
        <BentoGrid />

        {/* Band: Before infrastructure */}
        <BlueprintBandAccent />

        {/* 06. Infrastructure — Second-largest blueprint section */}
        <Infrastructure />

        {/* 07. Metrics — Full-width stat band */}
        <Metrics />

        {/* 08. Integrations — Dual marquee */}
        <IntegrationsMarquee />

        {/* 09. Solutions — Role-based value propositions */}
        <SolutionsRoles />

        {/* Band: Before comparison */}
        <BlueprintBand />

        {/* 10. Comparison — Major blueprint data section */}
        <ComparisonRiver />

        {/* 11. Developers — Code block focus */}
        <Developers />

        {/* 12. Security — Trust signals */}
        <Security />

        {/* 13. Pricing — 3-tier transparent pricing */}
        <Pricing />

        {/* 14. Testimonials — Auto-rotating merchant quotes */}
        <Testimonials />

        {/* 15. Blog — Latest insights */}
        <BlogInsights />

        {/* 16. FAQ — Expandable accordion */}
        <Faq />

        {/* Band: Around final CTA */}
        <BlueprintBand />

        {/* 17. Final CTA — Final major blueprint composition */}
        <CtaBanner />
      </main>

      {/* Band: Above footer */}
      <BlueprintBand />

      {/* 18. Footer & Utilities */}
      <Footer />
      <ScrollToTop />
    </div>
  );
}
