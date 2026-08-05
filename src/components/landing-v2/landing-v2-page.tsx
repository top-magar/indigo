import { NavigationShell } from "./index";
import { HeroSection } from "./hero";
import { LogoMarquee } from "./logo-marquee";
import { MetricsSection } from "./metrics";
import { FeaturesSection } from "./features";
import { IntegrationsSection } from "./integrations";
import { UseCasesSection } from "./use-cases";
import { DifferentiatorsSection } from "./differentiators";
import { ComparisonSection } from "./comparison";
import { PricingSection } from "./pricing";
import { TestimonialsSection } from "./testimonials";
import { BlogSection } from "./blog";
import { FaqSection } from "./faq";
import { FinalCtaSection } from "./final-cta";
import { Footer } from "./footer";

/**
 * Server Component shell — composes client islands (header, hero dashboard,
 * pricing toggle, marquees, FAQ, footer newsletter) with static sections.
 */
export function LandingV2Page() {
  return (
    <NavigationShell>
      <HeroSection />
      <LogoMarquee />
      <MetricsSection />
      <FeaturesSection />
      <IntegrationsSection />
      <UseCasesSection />
      <DifferentiatorsSection />
      <ComparisonSection />
      <PricingSection />
      <TestimonialsSection />
      <BlogSection />
      <FaqSection />
      <FinalCtaSection />
      <Footer />
    </NavigationShell>
  );
}
