import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { heroContent } from "@/data/landing/hero";
import { SectionHeading } from "./section-heading";
import { PointCloud } from "./point-cloud";
import { Frame } from "./frame";

export function FinalCtaSection() {
  return (
    <section className="lv2-final-cta" aria-labelledby="final-cta-title">
      <div className="lv2-final-cta__terrain" aria-hidden>
        <PointCloud />
      </div>
      <div className="lv2-container" style={{ position: "relative" }}>
        <Frame variant="purple" className="lv2-final-cta__panel">
          <SectionHeading
            index={8}
            total={8}
            label="Get Started"
            numbered={false}
            eyebrow="Take the next step"
            headline={<>Move faster with<br />data confidence</>}
            body="Spin up a store, connect payments, and start seeing live analytics from day one — no credit card required."
            align="center"
            id="final-cta-title"
          />
          <div className="lv2-final-cta__ctas">
            <Link href={heroContent.primary.href} className="lv2-btn lv2-btn--primary lv2-btn--lg">
              {heroContent.primary.label}
              <ArrowRight aria-hidden />
            </Link>
            <Link href={heroContent.secondary.href} className="lv2-btn lv2-btn--ghost lv2-btn--lg">
              {heroContent.secondary.label}
            </Link>
          </div>
        </Frame>
      </div>
    </section>
  );
}
