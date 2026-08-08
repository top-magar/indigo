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
import { HatchDivider } from "./hatch-divider";

/**
 * Server Component shell — composes client islands (header, hero dashboard,
 * pricing toggle, marquees, FAQ, footer newsletter) with static sections.
 *
 * Hatch dividers between sections form the engineering rhythm of the
 * technical construction grid.
 */
export function LandingPage() {
  return (
    <NavigationShell>
      <HeroSection />
      <LogoMarquee />
      <HatchDivider />
      <MetricsSection />
      <HatchDivider />
      <FeaturesSection />
      <HatchDivider />
      <IntegrationsSection />
      <HatchDivider />
      <UseCasesSection />
      <HatchDivider />
      <DifferentiatorsSection />
      <HatchDivider />
      <ComparisonSection />
      <HatchDivider />
      <PricingSection />
      <HatchDivider />
      <TestimonialsSection />
      <HatchDivider />
      <BlogSection />
      <HatchDivider />
      <FaqSection />
      <HatchDivider />
      <FinalCtaSection />
      <HatchDivider />
      <Footer />
    </NavigationShell>
  );
}
