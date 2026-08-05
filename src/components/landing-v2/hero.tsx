import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { heroContent } from "@/data/landing/hero";
import { DashboardPreview } from "./dashboard-preview";
import { SectionHeading } from "./section-heading";

export function HeroSection() {
  return (
    <section className="lv2-hero lv2-grid-bg" aria-labelledby="hero-heading">
      <div className="lv2-container" style={{ textAlign: "center" }}>
        <SectionHeading
          index={1}
          total={8}
          label="Overview"
          numbered={false}
          as="h1"
          eyebrow={heroContent.badge.label}
          headline={
            <>
              {heroContent.headline[0]}
              <br />
              {heroContent.headline[1]}
            </>
          }
          body={heroContent.body}
          align="center"
          id="hero-heading"
        />
        <div className="lv2-hero__ctas" style={{ justifyContent: "center" }}>
          <Link href={heroContent.primary.href} className="lv2-btn lv2-btn--primary lv2-btn--lg">
            {heroContent.primary.label}
            <ArrowRight aria-hidden />
          </Link>
          <Link href={heroContent.secondary.href} className="lv2-btn lv2-btn--ghost lv2-btn--lg">
            {heroContent.secondary.label}
          </Link>
        </div>
        <p className="lv2-hero__note">{heroContent.note}</p>
      </div>

      <div className="lv2-container lv2-hero__visual" style={{ marginTop: 72 }}>
        <DashboardPreview />
      </div>
    </section>
  );
}
